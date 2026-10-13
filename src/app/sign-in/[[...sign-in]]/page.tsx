"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignIn, useClerk, useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Info,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isUserLoaded, isSignedIn, router]);

  const handleDemoAccess = async () => {
    setIsDemoLoading(true);
    setDemoError(null);

    try {
      const response = await fetch("/api/demo/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Demo access is currently unavailable. Please configure the demo account."
        );
      }

      // 1. Primary Strategy: Authenticate ticket directly in browser via Clerk SDK
      if (clerk.client && data.token) {
        try {
          const ticketRes = await clerk.client.signIn.create({
            strategy: "ticket",
            ticket: data.token,
          });

          if (ticketRes.status === "complete" && ticketRes.createdSessionId) {
            await clerk.setActive({ session: ticketRes.createdSessionId });
            router.push("/dashboard");
            router.refresh();
            return;
          }
        } catch (ticketErr) {
          console.warn("Client ticket sign-in failed, trying credential fallback:", ticketErr);
        }
      }

      // 2. Fallback Strategy: Authenticate with demo credentials via Clerk SDK
      if (clerk.client && data.identifier && data.password) {
        try {
          const credRes = await clerk.client.signIn.create({
            identifier: data.identifier,
            password: data.password,
          });

          if (credRes.status === "complete" && credRes.createdSessionId) {
            await clerk.setActive({ session: credRes.createdSessionId });
            router.push("/dashboard");
            router.refresh();
            return;
          }
        } catch (credErr) {
          console.warn("Client credential demo sign-in failed:", credErr);
        }
      }

      throw new Error("Unable to establish demo session. Please check your Clerk dashboard and network connection.");
    } catch (err) {
      console.error("Demo access error:", err);
      setDemoError(err instanceof Error ? err.message : "Demo access failed. Please try again.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Automatically trigger demo access if visited via /sign-in?demo=true
  useEffect(() => {
    if (typeof window !== "undefined" && clerk.loaded && !isDemoLoading && !isSignedIn) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true") {
        handleDemoAccess();
      }
    }
  }, [clerk.loaded, isDemoLoading, isSignedIn]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-[#172033] dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-[#635BFF]/20 selection:text-[#635BFF]">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CareerBuddy AI</span>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2 focus:outline-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white shadow-lg shadow-[#635BFF]/25">
                <GraduationCap className="w-6 h-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome Back to CareerBuddy AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your AI-powered career and campus placement companion
            </p>
          </div>

          {/* Evaluator Demo Access Section */}
          <div className="p-4 bg-[#EEF0FF] dark:bg-[#635BFF]/10 border border-[#635BFF]/20 rounded-2xl space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#635BFF] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#635BFF] block">Evaluator & Demo Access</span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                  Explore preloaded engineering roadmap, resume audits, and developer metrics in an authenticated demo session.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoAccess}
              disabled={isDemoLoading}
              className="w-full py-2.5 px-4 bg-[#635BFF] hover:bg-[#5348E8] disabled:bg-[#635BFF]/60 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#635BFF]/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in Demo Account...</span>
                </>
              ) : (
                <>
                  <span>Enter with Demo Student Access</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {demoError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{demoError}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200 dark:border-slate-800" />
            <span className="shrink mx-3 text-slate-400 text-xs font-medium">Or sign in with account</span>
            <div className="grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Genuine Clerk Sign-In Component */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xl p-4 sm:p-6 overflow-hidden">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#635BFF",
                  colorBackground: "transparent",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 p-0 w-full bg-transparent",
                  header: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-xs",
                  socialButtonsBlockButtonText: "font-semibold text-xs sm:text-sm",
                  formButtonPrimary:
                    "w-full py-2.5 px-4 bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#635BFF]/25 flex items-center justify-center",
                  formFieldInput:
                    "w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF]",
                  formFieldLabel: "block text-xs font-semibold text-slate-700 mb-1",
                  dividerLine: "border-t border-slate-200",
                  dividerText: "text-slate-400 text-xs font-medium",
                  footerActionLink: "text-[#635BFF] font-semibold hover:underline text-xs",
                  footerActionText: "text-slate-500 text-xs",
                  identityPreviewEditButton: "text-[#635BFF] text-xs font-semibold",
                },
              }}
            />
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            By proceeding, you agree to CareerBuddy AI&apos;s{" "}
            <a href="#" className="underline hover:text-[#635BFF]">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-[#635BFF]">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
        CareerBuddy AI • Secured by Clerk Authentication
      </footer>
    </div>
  );
}
