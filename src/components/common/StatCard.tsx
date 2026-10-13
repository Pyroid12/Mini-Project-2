import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  href?: string;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-[#635BFF]/10",
  iconColor = "text-[#635BFF]",
  trend,
  href,
  className,
  valueClassName,
}: StatCardProps) {
  const strVal = String(value);
  // Dynamically scale text size so long values (e.g., "JavaScript", "TypeScript") never overflow narrow cards
  const autoFontSize =
    strVal.length > 12
      ? "text-sm sm:text-base"
      : strVal.length > 8
      ? "text-base sm:text-lg"
      : "text-2xl";

  const content = (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-4.5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-[#635BFF]/30 group relative flex flex-col justify-between overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2.5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider truncate" title={title}>
              {title}
            </p>
            <h3
              title={strVal}
              className={cn(
                "font-bold text-[#172033] mt-0.5 tracking-tight group-hover:text-[#635BFF] transition-colors truncate leading-tight",
                valueClassName || autoFontSize
              )}
            >
              {value}
            </h3>
          </div>
        </div>
        {href && (
          <div className="w-6 h-6 rounded-md text-[#64748B] opacity-0 group-hover:opacity-100 group-hover:text-[#635BFF] transition-all flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]/60 mt-1 min-w-0">
        {subtitle && (
          <span className="truncate" title={subtitle}>
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={cn(
              "font-semibold flex items-center gap-1 shrink-0 ml-1",
              trend.isPositive ? "text-[#16A34A]" : "text-[#F59E0B]"
            )}
          >
            {trend.value}
            {trend.label && <span className="font-normal text-[#64748B]">{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[#635BFF] rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
