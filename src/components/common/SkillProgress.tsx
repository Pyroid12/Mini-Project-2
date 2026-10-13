import React from "react";
import { cn } from "@/lib/utils";

interface SkillProgressProps {
  name: string;
  level: number;
  category?: string;
  className?: string;
}

export function SkillProgress({ name, level, category, className }: SkillProgressProps) {
  // Color scale based on proficiency
  const getColor = (val: number) => {
    if (val >= 80) return "bg-[#16A34A]"; // high proficiency
    if (val >= 65) return "bg-[#635BFF]"; // solid
    return "bg-[#F59E0B]"; // needs practice
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#172033] flex items-center gap-1.5">
          {name}
          {category && (
            <span className="text-[10px] text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded border border-[#E2E8F0]">
              {category}
            </span>
          )}
        </span>
        <span className="font-semibold text-[#172033]">{level}%</span>
      </div>
      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor(level))}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}
