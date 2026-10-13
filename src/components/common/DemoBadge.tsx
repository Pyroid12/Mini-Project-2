import React from "react";
import { Sparkles } from "lucide-react";

interface DemoBadgeProps {
  label?: string;
  className?: string;
}

export function DemoBadge({ label = "Demonstration Data", className = "" }: DemoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 ${className}`}
      title="This section displays realistic demonstration data for Phase 1 UI preview."
    >
      <Sparkles className="w-3 h-3 text-[#635BFF]" />
      <span>{label}</span>
    </span>
  );
}
