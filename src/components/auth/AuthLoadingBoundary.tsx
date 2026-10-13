"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GraduationCap } from "lucide-react";

interface AuthLoadingBoundaryProps {
  children: React.ReactNode;
}

export function AuthLoadingBoundary({ children }: AuthLoadingBoundaryProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      const signInUrl =
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
      router.replace(signInUrl);
    }
  }, [isLoaded, userId, router]);

  // If client auth check completed and user is definitely not signed in, show redirect state
  if (isLoaded && !userId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#635BFF]/10 border border-[#635BFF]/20 flex items-center justify-center text-[#635BFF]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#172033]">
              Redirecting to sign in
            </h2>
            <p className="text-xs text-[#64748B]">
              Please sign in to access your CareerBuddy workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Always render children during SSR / initial mount so Turbopack doesn't drop the segment
  return <>{children}</>;
}
