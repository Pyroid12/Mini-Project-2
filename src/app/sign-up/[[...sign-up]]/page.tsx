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
              Join engineering students preparing for top campus placements
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xl p-4 sm:p-6 overflow-hidden">
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
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
                },
              }}
            />
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#635BFF] font-semibold hover:underline">
              Sign in here
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
