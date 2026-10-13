/**
 * CareerBuddy AI - Frontend & Next.js Server Environment Validator
 * Validates presence, formatting, and classification of environment variables
 * WITHOUT exposing any secret credentials.
 */

export interface EnvVariableReport {
  name: string;
  category: "required" | "optional";
  scope: "client" | "server";
  status: "configured" | "missing" | "invalid_format";
  message?: string;
}

export interface EnvAuditResult {
  isReady: boolean;
  hasRequiredVariables: boolean;
  variables: EnvVariableReport[];
  warnings: string[];
  errors: string[];
}

export function validateFrontendEnv(): EnvAuditResult {
  const variables: EnvVariableReport[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Client-Side Clerk Publishable Key (Required)
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!clerkPubKey || clerkPubKey.trim() === "") {
    variables.push({
      name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      category: "required",
      scope: "client",
      status: "missing",
      message: "Clerk publishable key is missing. Retrieve from Clerk Dashboard.",
    });
    errors.push("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  } else if (!clerkPubKey.startsWith("pk_test_") && !clerkPubKey.startsWith("pk_live_")) {
    variables.push({
      name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      category: "required",
      scope: "client",
      status: "invalid_format",
      message: "Key should start with pk_test_ or pk_live_.",
    });
    errors.push("Invalid format for NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  } else {
    variables.push({
      name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      category: "required",
      scope: "client",
      status: "configured",
    });
  }

  // 2. Client-Side Routing Configurations
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  variables.push({
    name: "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    category: "optional",
    scope: "client",
    status: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ? "configured" : "configured",
    message: `Defaulting to ${signInUrl}`,
  });
  variables.push({
    name: "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
    category: "optional",
    scope: "client",
    status: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ? "configured" : "configured",
    message: `Defaulting to ${signUpUrl}`,
  });

  // 3. Server-Side Clerk Secret Key (Required if on server)
  if (typeof window === "undefined") {
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret || clerkSecret.trim() === "") {
      variables.push({
        name: "CLERK_SECRET_KEY",
        category: "required",
        scope: "server",
        status: "missing",
        message: "Clerk backend secret is missing. Session token verification will fail.",
      });
      errors.push("Missing CLERK_SECRET_KEY on server");
    } else if (!clerkSecret.startsWith("sk_test_") && !clerkSecret.startsWith("sk_live_")) {
      variables.push({
        name: "CLERK_SECRET_KEY",
        category: "required",
        scope: "server",
        status: "invalid_format",
        message: "Key should start with sk_test_ or sk_live_.",
      });
      errors.push("Invalid format for CLERK_SECRET_KEY");
    } else {
      variables.push({
        name: "CLERK_SECRET_KEY",
        category: "required",
        scope: "server",
        status: "configured",
      });
    }

    // 4. Server-Side Database Connection (Optional in development, required for production persistence)
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.trim() === "") {
      variables.push({
        name: "DATABASE_URL",
        category: "optional",
        scope: "server",
        status: "missing",
        message: "Running in ephemeral in-memory mode. Set DATABASE_URL to enable PostgreSQL persistence.",
      });
      warnings.push("DATABASE_URL is not set; operating with volatile in-memory fallback.");
    } else {
      variables.push({
        name: "DATABASE_URL",
        category: "optional",
        scope: "server",
        status: "configured",
      });
    }

    // 5. Express AI Server URL
    const aiServerUrl = process.env.AI_SERVER_URL;
    variables.push({
      name: "AI_SERVER_URL",
      category: "optional",
      scope: "server",
      status: aiServerUrl ? "configured" : "configured",
      message: aiServerUrl ? "Configured" : "Defaulting to http://localhost:3001",
    });
  }

  // 6. External Mock Interview Engine URL
  const mockUrl = process.env.NEXT_PUBLIC_MOCK_INTERVIEW_URL;
  variables.push({
    name: "NEXT_PUBLIC_MOCK_INTERVIEW_URL",
    category: "optional",
    scope: "client",
    status: mockUrl ? "configured" : "missing",
    message: mockUrl ? "Linked" : "Optional external interview platform URL is unset.",
  });

  return {
    isReady: errors.length === 0,
    hasRequiredVariables: errors.length === 0,
    variables,
    warnings,
    errors,
  };
}
