import React from "react";
import { DemoBadge } from "./DemoBadge";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  showDemoBadge?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  showDemoBadge = false,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
              {badge}
            </span>
          )}
          {showDemoBadge && <DemoBadge />}
        </div>
        {description && <p className="text-sm text-[#64748B] mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
