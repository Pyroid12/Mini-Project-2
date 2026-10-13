export async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof window !== "undefined") {
      const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
      if (clerk?.session?.getToken) {
        return await clerk.session.getToken();
      }
    }
    return null;
  } catch {
    return null;
  }
}

export interface ApiError {
  error: string;
  fieldErrors?: Record<string, string>;
}

export async function aiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    ...(typeof options.body === "string" ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    let err = (body as ApiError)?.error;
    if (!err && typeof body === "string" && body.trim().length > 0) {
      if (body.includes("ECONNREFUSED") || res.status === 502 || res.status === 504) {
        err = "AI backend server is temporarily unreachable. Please ensure the AI service is running.";
      } else if (!body.startsWith("<")) {
        err = body.slice(0, 200);
      }
    }
    throw new Error(err || `Request failed (${res.status} ${res.statusText || "Server Error"}).`);
  }

  return body as T;
}

export async function aiUpload<T = unknown>(
  url: string,
  formData: FormData
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const err = (body as ApiError)?.error || "Upload failed.";
    throw new Error(err);
  }

  return body as T;
}
