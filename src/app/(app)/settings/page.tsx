"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Palette,
  Link as LinkIcon,
  Save,
  Check,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { Github, Linkedin } from "@/components/common/Icons";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import {
  applyTheme,
  getInitialTheme,
  THEME_CHANGE_EVENT,
  type ThemeMode,
} from "@/lib/theme";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "account" | "appearance" | "connected"
  >("account");

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Settings State initialized from Clerk
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");

  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [compactDensity, setCompactDensity] = useState(false);

  useEffect(() => {
    if (user) {
      setName(
        user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Student"
      );
      setEmail(
        user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          ""
      );
    }
  }, [user]);

  // Synchronize theme and user preferences from storage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("cb_user_preferences");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (typeof parsed.compactDensity === "boolean") setCompactDensity(parsed.compactDensity);
      }
    } catch {
      // ignore
    }

    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: ThemeMode }>;
      if (customEvent.detail?.mode) {
        setThemeMode(customEvent.detail.mode);
      } else {
        setThemeMode(getInitialTheme());
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
  };

  const handleSave = (msg = "Settings preferences successfully saved.") => {
    try {
      localStorage.setItem(
        "cb_user_preferences",
        JSON.stringify({ timezone, compactDensity, themeMode })
      );
    } catch (err) {
      console.warn("Could not persist settings to storage:", err);
    }
    setSavedNotice(msg);
    setTimeout(() => {
      setSavedNotice(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Settings"
        description="Configure account preferences, appearance, and connected developer integrations."
      />

      {savedNotice && (
        <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
          <button
            onClick={() => setSavedNotice(null)}
            className="text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-1 overflow-x-auto">
        {[
          { id: "account", label: "Account Preferences", icon: User },
          { id: "appearance", label: "Appearance", icon: Palette },
          { id: "connected", label: "Connected Accounts", icon: LinkIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#635BFF] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ACCOUNT PREFERENCES */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <SectionCard
            title="Account Details"
            description="Personal contact and regional settings"
          >
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Managed via Clerk authentication.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 bg-white"
                >
                  <option value="Asia/Kolkata (IST)">
                    Asia/Kolkata (IST) GMT+5:30
                  </option>
                  <option value="America/New_York (EST)">
                    America/New_York (EST) GMT-5
                  </option>
                  <option value="Europe/London (GMT)">
                    Europe/London (GMT) GMT+0
                  </option>
                  <option value="Asia/Singapore (SGT)">
                    Asia/Singapore (SGT) GMT+8
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave("Account preferences saved.")}
                  className="px-5 py-2.5 bg-[#635BFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5348E8] transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Account Settings</span>
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* SECTION 2: APPEARANCE */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          <SectionCard
            title="Theme & Display"
            description="Customize interface visual mode across CareerBuddy"
          >
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-2">
                  Theme Palette
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: "light",
                      label: "Light Mode",
                      desc: "Clean & Spacious",
                    },
                    {
                      id: "dark",
                      label: "Dark Mode",
                      desc: "Sleek Dark Theme",
                    },
                    {
                      id: "system",
                      label: "System Default",
                      desc: "Follow OS preference",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleSelectTheme(mode.id as ThemeMode)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        themeMode === mode.id
                          ? "border-[#635BFF] bg-[#635BFF]/10 ring-2 ring-[#635BFF]/30"
                          : "border-[#E2E8F0] hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#172033]">
                        {mode.label}
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        {mode.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#172033]">
                    Compact Dashboard Cards
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Reduce padding for high-density screens
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={compactDensity}
                  onChange={(e) => setCompactDensity(e.target.checked)}
                  className="w-4 h-4 accent-[#635BFF] rounded"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSave("Appearance preferences saved successfully.")
                  }
                  className="px-5 py-2.5 bg-[#635BFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5348E8] transition-colors shadow-xs"
                >
                  Save Appearance
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* SECTION 3: CONNECTED ACCOUNTS */}
      {activeTab === "connected" && (
        <div className="space-y-6">
          <SectionCard
            title="Connected Third-Party Accounts"
            description="Manage authorization tokens & handles"
          >
            <div className="space-y-3 max-w-xl">
              {/* GitHub */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#172033]">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033]">
                      GitHub Integration
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Public REST API analysis
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-green-100 px-2.5 py-0.5 rounded-full">
                  Configured ✓
                </span>
              </div>

              {/* LeetCode */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center font-bold">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033]">
                      LeetCode Problem Tracker
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      GraphQL sync & manual logging
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-green-100 px-2.5 py-0.5 rounded-full">
                  Configured ✓
                </span>
              </div>

              {/* LinkedIn */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0077B5] flex items-center justify-center">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033]">
                      LinkedIn Profile Optimization
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      AI content advisor
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-green-100 px-2.5 py-0.5 rounded-full">
                  Configured ✓
                </span>
              </div>

              {/* Clerk User Authentication */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033]">
                      Clerk Authentication
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      {user?.primaryEmailAddress?.emailAddress ||
                        "Authenticated session"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-0.5 rounded-full">
                  Active & Secure ✓
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
