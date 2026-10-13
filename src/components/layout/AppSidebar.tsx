"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  UserCircle2,
  Map,
  FileText,
  BarChart3,
  MessageSquare,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  X,
  ShieldCheck,
  LogOut,
  Loader2,
} from "lucide-react";
import { Linkedin } from "@/components/common/Icons";
import { cn, getInitials } from "@/lib/utils";
import { DemoBadge } from "@/components/common/DemoBadge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/profile", icon: UserCircle2 },
  { name: "Career Roadmap", href: "/career-roadmap", icon: Map },
  { name: "Resume Analysis", href: "/resume-analysis", icon: FileText },
  { name: "Developer Progress", href: "/developer-progress", icon: BarChart3 },
  { name: "LinkedIn Analysis", href: "/linkedin-analysis", icon: Linkedin },
  { name: "AI Mock Interview", href: "/mock-interview", icon: MessageSquare, badge: "AI" },
  { name: "Placement Readiness", href: "/placement-readiness", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}

export function AppSidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isDemoUser =
    isLoaded &&
    user &&
    Boolean(
      (user.publicMetadata as Record<string, unknown>)?.isDemoUser ||
        process.env.NEXT_PUBLIC_DEMO_EMAIL ===
          user.primaryEmailAddress?.emailAddress
    );

  const displayName = user?.fullName || user?.firstName || "Student";
  const initials = getInitials(displayName);
  const avatarUrl = user?.imageUrl;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch (err) {
      console.error("Sign out error:", err);
      router.push("/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E2E8F0] transition-all duration-300 ease-in-out select-none",
          // Desktop collapse/expand widths
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile responsive slide-over
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0] shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden group focus:outline-hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#5348E8] transition-colors shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-base font-bold text-[#172033] tracking-tight whitespace-nowrap flex items-center gap-1.5">
                  CareerBuddy <span className="text-[#635BFF] text-xs px-1.5 py-0.2 bg-[#635BFF]/10 rounded font-semibold">AI</span>
                </span>
                <span className="text-[11px] text-[#64748B] font-medium whitespace-nowrap">Placement Companion</span>
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition-colors border border-[#E2E8F0]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-[#635BFF]/10 text-[#635BFF] font-semibold shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50",
                    isCollapsed && !mobileOpen ? "justify-center px-0" : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive ? "text-[#635BFF]" : "text-[#64748B] group-hover:text-[#172033]"
                    )}
                  />

                  {(!isCollapsed || mobileOpen) && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#635BFF] text-white tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Bar on collapsed view */}
                  {isActive && isCollapsed && !mobileOpen && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#635BFF] rounded-r" />
                  )}
                </Link>

                {/* Desktop Collapsed Tooltip */}
                {isCollapsed && !mobileOpen && hoveredItem === item.name && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 bg-[#172033] text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-[#635BFF] px-1 py-0.2 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Mini Footer */}
        <div className="p-3 border-t border-[#E2E8F0] shrink-0 bg-slate-50/50 space-y-2">
          {isDemoUser && (!isCollapsed || mobileOpen) && (
            <div className="p-2.5 bg-[#EEF0FF] border border-[#635BFF]/20 rounded-xl flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#635BFF] shrink-0 mt-0.5" />
              <div className="text-[10px] text-[#64748B] leading-relaxed">
                <p className="font-semibold text-[#635BFF]">Demo Session</p>
                <p>
                  Edits preview only.{" "}
                  <Link
                    href="/sign-up"
                    className="font-semibold underline hover:text-[#4539e8]"
                  >
                    Sign up
                  </Link>{" "}
                  to save.
                </p>
              </div>
            </div>
          )}

          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all group",
              isCollapsed && !mobileOpen ? "justify-center p-1.5" : ""
            )}
            title="View student profile"
          >
            <div className="relative shrink-0">
              {!isLoaded ? (
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-[#635BFF]/30 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#635BFF]/15 text-[#635BFF] font-bold text-sm flex items-center justify-center ring-2 ring-slate-100 group-hover:ring-[#635BFF]/30 transition-all">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
            </div>

            {(!isCollapsed || mobileOpen) && (
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-semibold text-[#172033] truncate group-hover:text-[#635BFF] transition-colors">
                    {isLoaded ? displayName : "Loading..."}
                  </p>
                  {isDemoUser && <DemoBadge label="DEMO" />}
                </div>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {isLoaded
                    ? user?.primaryEmailAddress?.emailAddress || "Student Account"
                    : "..."}
                </p>
              </div>
            )}
          </Link>

          {isCollapsed && !mobileOpen ? (
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSigningOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}