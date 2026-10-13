import React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  headerClassName,
  bodyClassName,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] shadow-xs transition-shadow duration-200 hover:shadow-sm",
        className
      )}
    >
      {(title || action) && (
        <div
          className={cn(
            "px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3",
            headerClassName
          )}
        >
          <div>
            {typeof title === "string" ? (
              <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
            ) : (
              title
            )}
            {description && (
              <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
