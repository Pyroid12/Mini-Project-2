/**
 * CareerBuddy AI - Express Backend Environment Validator
 * Evaluates backend service readiness without exposing sensitive keys.
 */

export interface BackendEnvAudit {
  isReady: boolean;
  errors: string[];
  warnings: string[];
  status: {
    clerk: "configured" | "missing" | "invalid_format";
    gemini: "configured" | "missing";
    database: "configured" | "in-memory-fallback";
    githubToken: "configured" | "unauthenticated-mode";
  };
}

export function validateBackendEnv(): BackendEnvAudit {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Clerk Secret Key
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  let clerkStatus: "configured" | "missing" | "invalid_format" = "missing";
  if (!clerkSecret || clerkSecret.trim() === "") {
    errors.push("Missing CLERK_SECRET_KEY on backend server.");
  } else if (!clerkSecret.startsWith("sk_test_") && !clerkSecret.startsWith("sk_live_")) {
    clerkStatus = "invalid_format";
    errors.push("Invalid format for CLERK_SECRET_KEY (must start with sk_test_ or sk_live_).");
  } else {
    clerkStatus = "configured";
  }

  // 2. Google Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY;
  let geminiStatus: "configured" | "missing" = "missing";
  if (!geminiKey || geminiKey.trim() === "") {
    errors.push("Missing GEMINI_API_KEY. AI resume and roadmap features require an API key.");
  } else {
    geminiStatus = "configured";
  }

  // 3. PostgreSQL Database URL (Optional in dev, runs in-memory fallback)
  const dbUrl = process.env.DATABASE_URL;
  let dbStatus: "configured" | "in-memory-fallback" = "in-memory-fallback";
  if (!dbUrl || dbUrl.trim() === "") {
    warnings.push("DATABASE_URL is not set; running in in-memory session mode.");
  } else {
    dbStatus = "configured";
  }

  // 4. GitHub Token (Optional)
  const ghToken = process.env.GITHUB_TOKEN;
  let ghStatus: "configured" | "unauthenticated-mode" = "unauthenticated-mode";
  if (ghToken && ghToken.trim() !== "") {
    ghStatus = "configured";
  } else {
    warnings.push("GITHUB_TOKEN is not set; GitHub API calls will use unauthenticated rate limit (60 req/hr).");
  }

  return {
    isReady: errors.length === 0,
    errors,
    warnings,
    status: {
      clerk: clerkStatus,
      gemini: geminiStatus,
      database: dbStatus,
      githubToken: ghStatus,
    },
  };
}
