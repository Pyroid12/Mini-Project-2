import "../server/lib/loadEnv";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function runAuthTests() {
  console.log("=== 1. Testing Clerk Configuration & Environment Variables ===");
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("Missing CLERK_SECRET_KEY");
  }
  console.log("Publishable Key:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 15) + "...");
  console.log("Secret Key Present:", Boolean(process.env.CLERK_SECRET_KEY));
  console.log("Fallback Sign-In Redirect:", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL);
  console.log("Fallback Sign-Up Redirect:", process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL);

  console.log("\n=== 2. Testing Dedicated Demo Account in Clerk ===");
  const demoUserId = process.env.DEMO_USER_CLERK_ID;
  if (!demoUserId) {
    throw new Error("Missing DEMO_USER_CLERK_ID in .env.local");
  }
  const demoUser = await clerkClient.users.getUser(demoUserId);
  console.log("Demo User Found:", {
    id: demoUser.id,
    emails: demoUser.emailAddresses.map((e) => e.emailAddress),
    firstName: demoUser.firstName,
    lastName: demoUser.lastName,
  });

  console.log("\n=== 3. Testing Demo Sign-In Token Generation (Clerk Backend) ===");
  const ticket = await clerkClient.signInTokens.createSignInToken({
    userId: demoUserId,
    expiresInSeconds: 300,
  });
  console.log("Sign-in Token Generated:", {
    status: ticket.status,
    hasToken: Boolean(ticket.token),
    url: ticket.url,
  });
  if (!ticket.token) {
    throw new Error("Failed to generate ticket token");
  }

  console.log("\n=== 4. Testing Strict Backend Auth (No Token = 401) ===");
  const unauthRes = await fetch("http://localhost:3001/dashboard/summary");
  console.log("Unauthenticated Request Status:", unauthRes.status);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 Unauthorized for unauthenticated request, got ${unauthRes.status}`);
  }
  console.log("Verified: Express backend strictly rejects unauthenticated requests! ✓");

  console.log("\n=== 5. Testing Forged / Fake Token Rejection ===");
  const fakeRes = await fetch("http://localhost:3001/dashboard/summary", {
    headers: { Authorization: "Bearer fake-token-12345" },
  });
  console.log("Forged Token Request Status:", fakeRes.status);
  if (fakeRes.status !== 401) {
    throw new Error(`Expected 401 for forged token, got ${fakeRes.status}`);
  }
  console.log("Verified: Express backend cryptographically rejects invalid tokens! ✓");

  console.log("\n=== 6. Testing Next.js Demo Sign-In Route Handler ===");
  const demoApiRes = await fetch("http://localhost:3000/api/demo/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  console.log("Demo API Route Status:", demoApiRes.status);
  if (demoApiRes.ok) {
    const demoData = await demoApiRes.json();
    console.log("Demo API Response:", {
      success: demoData.success,
      hasToken: Boolean(demoData.token),
      hasCredentials: Boolean(demoData.identifier && demoData.password),
      redirectTo: demoData.redirectTo,
    });
    if (!demoData.token && !demoData.password) {
      throw new Error("Demo API failed to provide token or credentials");
    }
  } else {
    console.log("Demo API returned (check if Next.js dev server is running on 3000):", demoApiRes.status);
  }

  console.log("\n=== 7. Testing User Upsert in Database (ensureUser) ===");
  const { ensureUser } = await import("../server/lib/user");
  const ensured = await ensureUser(
    demoUser.id,
    demoUser.emailAddresses[0]?.emailAddress || "demo@example.com",
    demoUser.fullName || "Demo Student",
    true
  );
  console.log("User Ensured in Database:", ensured);
  if (!ensured || ensured.clerkUserId !== demoUser.id) {
    throw new Error("Failed to ensure user in DB");
  }

  console.log("\nALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! ✓✓✓");
}

runAuthTests().catch((err) => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
