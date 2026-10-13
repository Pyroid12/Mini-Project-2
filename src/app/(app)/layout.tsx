import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthLoadingBoundary } from "@/components/auth/AuthLoadingBoundary";

export default function ApplicationShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLoadingBoundary>
      <AppShell>{children}</AppShell>
    </AuthLoadingBoundary>
  );
}