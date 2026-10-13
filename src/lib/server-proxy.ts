import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const AI_SERVER_URL =
  process.env.AI_SERVER_URL || `http://localhost:${process.env.AI_SERVER_PORT || 3001}`;

export function createApiProxy(servicePrefix: string) {
  return async function proxyHandler(
    req: NextRequest,
    context?: { params?: Promise<{ path?: string[] }> }
  ) {
    const params = context?.params ? await context.params : undefined;
    const subPath = params?.path && params.path.length > 0 ? `/${params.path.join("/")}` : "";
    const targetUrl = `${AI_SERVER_URL}/${servicePrefix}${subPath}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("connection");

    try {
      const { userId, getToken } = await auth();
      if (userId) {
        const token = await getToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
    } catch (authErr) {
      console.warn(`[proxy-auth] Session token extraction note for /${servicePrefix}:`, authErr);
    }

    const body =
      req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

    try {
      const res = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
        // @ts-expect-error Node fetch duplex option
        duplex: "half",
      });

      const resHeaders = new Headers(res.headers);
      return new NextResponse(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
      });
    } catch (err) {
      console.error(`[proxy-error] Failed to proxy /${servicePrefix}:`, err);
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "production"
              ? "AI backend service is temporarily unreachable. Please check that AI_SERVER_URL is configured on your hosting provider."
              : "AI backend server is unreachable. Please ensure the AI service is running on port 3001.",
        },
        { status: 502 }
      );
    }
  };
}
