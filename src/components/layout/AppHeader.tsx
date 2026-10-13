"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Check,
  X,
  ChevronRight,
  Sparkles,
  LogOut,
  UserCircle2,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { DemoBadge } from "@/components/common/DemoBadge";
import { applyTheme, isDarkModeActive, THEME_CHANGE_EVENT } from "@/lib/theme";

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setIsDarkMode(isDarkModeActive());
    const onThemeChange = () => {
      setIsDarkMode(isDarkModeActive());
    };
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const isDemoUser =
    isLoaded &&
    user &&
    Boolean(
      (user.publicMetadata as Record<string, unknown>)?.isDemoUser ||
        process.env.NEXT_PUBLIC_DEMO_EMAIL === user.primaryEmailAddress?.emailAddress
    );

  const getPageInfo = () => {
    switch (pathname) {
      case "/dashboard":
        return { title: "Career Dashboard", category: "Overview" };
      case "/profile":
        return { title: "Student Profile", category: "Account" };
      case "/career-roadmap":
        return { title: "Career Roadmap", category: "Planning" };
      case "/resume-analysis":
        return { title: "Resume Analysis", category: "Evaluation" };
      case "/developer-progress":
        return { title: "Developer Progress", category: "Analytics" };
      case "/linkedin-analysis":
        return { title: "LinkedIn Analysis", category: "Evaluation" };
      case "/mock-interview":
        return { title: "AI Mock Interview", category: "Practice" };
      case "/placement-readiness":
        return { title: "Placement Readiness", category: "Insights" };
      case "/settings":
        return { title: "Settings", category: "System" };
      default:
        return { title: "CareerBuddy AI", category: "Workspace" };
    }
  };

  const pageInfo = getPageInfo();

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    applyTheme(nextDark ? "dark" : "light");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setShowUserMenu(false);
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch (err) {
      console.error("Header sign out error:", err);
      router.push("/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayName = user?.fullName || user?.firstName || "Student";
  const initials = getInitials(displayName);
  const avatarUrl = user?.imageUrl;

  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#64748B]">
          <span className="hidden sm:inline font-medium text-slate-400">{pageInfo.category}</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 mx-1.5 text-slate-300" />
          <span className="font-semibold text-[#172033] text-sm md:text-base">
            {pageInfo.title}
          </span>
        </nav>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, roadmaps, questions (Ctrl + K)..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
            onFocus={() => setShowSearchModal(true)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSearchModal(true)}
          className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition-colors border border-transparent hover:border-[#E2E8F0]"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={isDarkMode ? "Switch to light theme" : "Switch to dark theme preview"}
        >
          {isDarkMode ? (
            <Sun className="w-4.5 h-4.5 text-[#F59E0B]" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-[#64748B]" />
          )}
        </button>

        <div className="relative pl-2 border-l border-[#E2E8F0] ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-2 group focus:outline-hidden"
            aria-label="User menu"
          >
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              </div>
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#635BFF]/30 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#635BFF]/15 text-[#635BFF] font-bold text-xs flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#635BFF]/30 transition-all">
                {initials}
              </div>
            )}
            <span className="text-xs font-semibold text-[#172033] hidden sm:inline group-hover:text-[#635BFF] max-w-[80px] truncate">
              {isLoaded ? user?.firstName || "Student" : "..."}
            </span>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden z-50 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/50">
                <div className="flex items-start gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#635BFF]/15 text-[#635BFF] font-bold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-[#172033] truncate">
                        {displayName}
                      </p>
                      {isDemoUser && <DemoBadge label="Demo" />}
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                {isDemoUser && (
                  <div className="mt-3 p-2.5 bg-[#EEF0FF] border border-[#635BFF]/20 rounded-lg flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#635BFF] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#64748B] leading-relaxed">
                      Demo mode: edits apply locally and are not permanently stored.
                    </p>
                  </div>
                )}
              </div>

              <div className="py-1.5">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#172033] hover:bg-slate-50 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4 text-[#64748B]" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#172033] hover:bg-slate-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#64748B]" />
                  <span>Account Settings</span>
                </Link>
              </div>

              <div className="py-1.5 border-t border-[#E2E8F0]">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#635BFF]" />
              <input
                type="text"
                autoFocus
                placeholder="Search modules, roadmaps, placement tips..."
                className="w-full text-sm text-[#172033] focus:outline-none placeholder:text-[#64748B]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Quick Navigation
              </p>
              {[
                { title: "Career Dashboard", path: "/dashboard", desc: "Overall placement readiness metrics" },
                { title: "Full-Stack Roadmap", path: "/career-roadmap", desc: "Explore milestones and projects" },
                { title: "Resume ATS Score", path: "/resume-analysis", desc: "Upload and review resume strength" },
                { title: "GitHub & LeetCode Analytics", path: "/developer-progress", desc: "Track coding problem counts" },
                { title: "AI Mock Interview", path: "/mock-interview", desc: "Launch external interview environment" },
              ]
                .filter(
                  (item) =>
                    !searchQuery ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E2E8F0] transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#172033] group-hover:text-[#635BFF]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] text-[11px] text-[#64748B] flex justify-between items-center">
              <span>Press Esc or click outside to close</span>
              <span className="font-medium text-[#635BFF]">CareerBuddy AI Search</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
