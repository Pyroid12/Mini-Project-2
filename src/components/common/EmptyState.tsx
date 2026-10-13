import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-[#E2E8F0]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#64748B] mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#172033] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-[#635BFF] text-white hover:bg-[#5348E8] transition-colors shadow-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
