import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading experience...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center bg-white rounded-xl border border-[#E2E8F0]",
        className
      )}
    >
      <Loader2 className="w-7 h-7 text-[#635BFF] animate-spin mb-3" />
      <p className="text-sm font-medium text-[#64748B]">{message}</p>
    </div>
  );
}
