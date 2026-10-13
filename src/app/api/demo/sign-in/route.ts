import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST() {
  try {
    if (process.env.DEMO_ACCESS_ENABLED === "false") {
      return NextResponse.json(
        { error: "Demo access has been disabled for this environment." },
        { status: 403 }
      );
    }

    const demoClerkId = process.env.DEMO_USER_CLERK_ID;
    if (!demoClerkId) {
      return NextResponse.json(
        {
          error:
            "Demo access is not configured. Set DEMO_USER_CLERK_ID in server environment variables.",
        },
        { status: 503 }
      );
    }

    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: demoClerkId,
      expiresInSeconds: 300,
    });

    return NextResponse.json({
      success: true,
      token: signInToken.token,
      url: signInToken.url,
      identifier: process.env.DEMO_USER_EMAIL,
      password: process.env.DEMO_USER_PASSWORD,
      message: "Demo user signed in successfully.",
      redirectTo: "/dashboard",
    });
  } catch (err) {
    console.error("[demo/sign-in] Server error:", err);

    const message =
      err instanceof Error
        ? err.message.includes("not_found") || err.message.includes("Password")
          ? "Demo account is not set up correctly. Please configure DEMO_USER_EMAIL/DEMO_USER_PASSWORD with a real Clerk user that has password-based sign-in enabled."
          : err.message
        : "An unexpected error occurred during demo sign-in.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
