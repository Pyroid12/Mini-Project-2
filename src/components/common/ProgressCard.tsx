import React from "react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  max?: number;
  label?: string;
  description?: string;
  variant?: "primary" | "success" | "warning";
  className?: string;
}

export function ProgressCard({
  title,
  value,
  max = 100,
  label,
  description,
  variant = "primary",
  className,
}: ProgressCardProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barColors = {
    primary: "bg-[#635BFF]",
    success: "bg-[#16A34A]",
    warning: "bg-[#F59E0B]",
  };

  return (
    <div className={cn("bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs", className)}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-[#172033]">{title}</h4>
        <span className="text-sm font-bold text-[#172033]">{percentage}%</span>
      </div>
      
      {/* Horizontal Progress Bar */}
      <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5 text-xs text-[#64748B]">
        <span>{label || `${value} of ${max}`}</span>
        {description && <span>{description}</span>}
      </div>
    </div>
  );
}
