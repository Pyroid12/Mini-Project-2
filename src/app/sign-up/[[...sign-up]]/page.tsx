"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignUp, useUser } from "@clerk/nextjs";
import { ArrowLeft, GraduationCap, Sparkles } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

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
          <span>Create Account</span>
        </div>
      </header>

      {/* Main Form Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2 focus:outline-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white shadow-lg shadow-[#635BFF]/25">
                <GraduationCap className="w-6 h-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create Your CareerBuddy Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Sign up with your Google account to get started with placement preparation
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xl p-6 sm:p-8 overflow-hidden">
            <div className="mb-4 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">
                Single Sign-On
              </span>
            </div>
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/dashboard"
              forceRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#635BFF",
                  colorBackground: "#FFFFFF",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "!shadow-none !border-0 !p-0 !w-full !bg-transparent",
                  header: "!hidden",
                  headerTitle: "!hidden",
                  headerSubtitle: "!hidden",
                  form: "!hidden",
                  formFieldRow: "!hidden",
                  formButtonPrimary: "!hidden",
                  dividerRow: "!hidden",
                  dividerLine: "!hidden",
                  dividerText: "!hidden",
                  footer: "!hidden !bg-transparent !border-0",
                  footerAction: "!hidden !bg-transparent !border-0",
                  footerPages: "!hidden !bg-transparent !border-0",
                  socialButtonsBlockButton:
                    "w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer",
                  socialButtonsBlockButtonText:
                    "font-semibold text-sm text-slate-800 dark:text-white",
                  socialButtonsProviderIcon: "w-5 h-5",
                },
              }}
            />
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#635BFF] font-semibold hover:underline">
              Sign in with Google
            </Link>
          </div>
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
        CareerBuddy AI • Secured by Clerk Authentication
      </footer>
    </div>
  );
}
