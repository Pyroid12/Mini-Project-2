import { Request, Response, NextFunction } from "express";
import { verifyToken, createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    isDemoUser: boolean;
    email: string | null;
    fullName: string | null;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let token: string | null = null;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    token = header.slice("Bearer ".length).trim();
  }

  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie
        .split(";")
        .map((c) => c.trim().split("="))
        .filter((parts) => parts.length >= 2)
        .map(([k, ...v]) => [k.trim(), decodeURIComponent(v.join("="))])
    );
    token = cookies["__session"] || null;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid session token" });
    }

    const isDemoUser = false;
    let email: string | null = null;
    let fullName: string | null = null;

    try {
      const user = await clerkClient.users.getUser(userId);
      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        null;
      if (!email) email = primaryEmail;
      const fallbackName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      if (!fullName) fullName = user.fullName || fallbackName || null;
    } catch {
      // If Clerk API fails to fetch profile, proceed with the verified userId
    }

    req.auth = { userId, isDemoUser: false, email, fullName };
    return next();
  } catch (err) {
    console.warn("[server/auth] Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
}
