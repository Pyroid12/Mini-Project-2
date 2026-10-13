"use client";

import React, { useEffect, useState } from "react";
import {
  GitBranch,
  Terminal,
  Star,
  GitFork,
  Flame,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Edit3,
  Loader2,
  Check,
  AlertCircle,
  Search,
  Users,
  MapPin,
  Building,
  Trash2,
  Plus,
  Trophy,
  Target,
  Award,
  BookOpen,
} from "lucide-react";
import { Github } from "@/components/common/Icons";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { LeetCodeWeeklyChart } from "@/components/charts/LeetCodeWeeklyChart";
import { aiFetch } from "@/lib/ai-client";

interface RepoItem {
  id?: number;
  name: string;
  description: string | null;
  language: string | null;
  languageColor: string;
  stars: number;
  forks: number;
  updated: string;
  url: string;
  isFork: boolean;
}

interface GitHubAnalysisData {
  username: string;
  name?: string | null;
  avatarUrl: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl?: string;
  location?: string | null;
  company?: string | null;
  createdAt?: string | null;
  totalStars: number;
  totalForks: number;
  languages: { name: string; percentage: number; color: string; count?: number }[];
  topRepos: RepoItem[];
  allRepos?: RepoItem[];
  inferredSkills: string[];
  qualitySuggestions: string[];
  recommendedSteps: string[];
  apiDisclaimer?: string;
  updatedAt?: string;
}

export interface LeetCodeRecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface LeetCodeProblemEntry {
  id: string;
  title: string;
  problemUrlOrId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  completedAt: string;
  topic?: string;
  notes?: string;
  createdAt: string;
}

export interface LeetCodeProgressData {
  id?: string;
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  reputation?: number | null;
  avatarUrl?: string | null;
  realName?: string | null;
  acceptanceRate?: string | null;
  totalSubmissions?: number | null;
  streak: number;
  isStreakVerified?: boolean;
  dailyGoalTarget: number;
  dailyGoalCurrent: number;
  weeklyGoalTarget: number;
  weeklyGoalCurrent: number;
  weeklyHistory?: { day: string; date: string; solved: number }[];
  problemEntries?: LeetCodeProblemEntry[];
  recentSubmissions?: LeetCodeRecentSubmission[];
  source: "synced" | "manual";
  lastSyncedAt?: string | null;
}

export default function DeveloperProgressPage() {
  const [activeTab, setActiveTab] = useState<"combined" | "github" | "leetcode">(
    "combined"
  );

  // GitHub State - initialized blank or from user profile, never hardcoded
  const [githubUser, setGithubUser] = useState("");
  const [githubData, setGithubData] = useState<GitHubAnalysisData | null>(null);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Repository search & pagination in GitHub Analytics tab
  const [repoSearchQuery, setRepoSearchQuery] = useState("");
  const [visibleRepoCount, setVisibleRepoCount] = useState(6);

  // LeetCode State
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeProgressData | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<
    { day: string; date: string; solved: number }[]
  >([]);
  const [loadingLeetCode, setLoadingLeetCode] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState<string | null>(null);

  // Feedback Notification
  const [notice, setNotice] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  // Problem Logging Modal State
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemTitle, setProblemTitle] = useState("");
  const [problemUrlOrId, setProblemUrlOrId] = useState("");
  const [problemDifficulty, setProblemDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [problemDate, setProblemDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [problemTopic, setProblemTopic] = useState("");
  const [problemNotes, setProblemNotes] = useState("");
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [savingProblem, setSavingProblem] = useState(false);

  // Daily Goal Configuration Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTargetInput, setGoalTargetInput] = useState(3);
  const [savingGoal, setSavingGoal] = useState(false);

  // Fetch initial profile handles & existing data without fabricating mock numbers
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch user profile to prefill saved handles
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (!cancelled && profileJson.profile) {
            if (profileJson.profile.githubUsername) {
              setGithubUser(profileJson.profile.githubUsername);
            }
            if (profileJson.profile.leetcodeUsername) {
              setLeetcodeUser(profileJson.profile.leetcodeUsername);
            }
          }
        }
      } catch {
        // Ignore fallback
      }

      // Fetch latest saved GitHub analysis
      try {
        const ghRes = await aiFetch<{ analysis: GitHubAnalysisData | null }>(
          "/api/github/latest"
        );
        if (!cancelled && ghRes.analysis) {
          setGithubData(ghRes.analysis);
          if (!githubUser && ghRes.analysis.username) {
            setGithubUser(ghRes.analysis.username);
          }
        }
      } catch {
        // Leave null so user sees empty state
      }

      // Fetch latest LeetCode progress
      try {
        const lcRes = await aiFetch<{
          progress: LeetCodeProgressData | null;
          weeklyActivity: { day: string; date: string; solved: number }[];
        }>("/api/leetcode/data");
        if (!cancelled && lcRes.progress) {
          setLeetcodeData(lcRes.progress);
          if (!leetcodeUser && lcRes.progress.username) {
            setLeetcodeUser(lcRes.progress.username);
          }
          if (lcRes.weeklyActivity) {
            setWeeklyActivity(lcRes.weeklyActivity);
          }
        }
      } catch {
        // Leave null
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync GitHub Live Analytics
  const handleSyncGitHub = async () => {
    let trimmed = githubUser.trim();
    // Allow pasting full URL like https://github.com/username or @username
    trimmed = trimmed.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
    trimmed = trimmed.replace(/^@/, "").replace(/\/.*$/, "").trim();

    // Validate username
    if (!trimmed) {
      setGithubError("Please enter a GitHub username to sync.");
      setNotice({
        type: "error",
        text: "Please enter a valid GitHub username.",
      });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!usernameRegex.test(trimmed)) {
      setGithubError(
        "Invalid username format. GitHub usernames only contain letters, numbers, and single hyphens."
      );
      setNotice({
        type: "error",
        text: "Invalid GitHub username format. Please check the spelling.",
      });
      return;
    }

    setLoadingGitHub(true);
    setGithubError(null);
    setNotice(null);

    try {
      const res = await aiFetch<{ analysis: GitHubAnalysisData }>(
        "/api/github/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: trimmed }),
        }
      );

      // Successfully synced
      setGithubData(res.analysis);
      setVisibleRepoCount(6);
      setNotice({
        type: "success",
        text: `Successfully synced public repositories for @${res.analysis.username} from official GitHub REST API!`,
      });
    } catch (err: any) {
      const message = err?.message || "Failed to analyze GitHub profile.";
      let userFriendlyMsg = message;

      if (message.includes("not found")) {
        userFriendlyMsg = "GitHub user not found. Please verify the username.";
      } else if (
        message.includes("rate limit") ||
        message.includes("request limit")
      ) {
        userFriendlyMsg =
          "GitHub's API request limit has been reached. Please wait a few minutes before trying again.";
      }

      setGithubError(userFriendlyMsg);
      setNotice({
        type: "error",
        text: userFriendlyMsg,
      });
    } finally {
      setLoadingGitHub(false);
    }
  };

  // Reset problem log form
  const resetProblemForm = () => {
    setProblemTitle("");
    setProblemUrlOrId("");
    setProblemDifficulty("Medium");
    setProblemDate(new Date().toISOString().split("T")[0]);
    setProblemTopic("");
    setProblemNotes("");
    setEditingProblemId(null);
  };

  // Sync LeetCode
  const handleSyncLeetCode = async () => {
    let clean = leetcodeUser.trim();
    // Support URLs, @handle, or plain usernames
    clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?/i, "");
    clean = clean.replace(/^@/, "").replace(/\/.*$/, "").trim();

    if (!clean) {
      setLeetcodeError("Please provide a valid LeetCode username.");
      setNotice({
        type: "error",
        text: "Please provide a valid LeetCode username.",
      });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_\-]{1,100}$/;
    if (!usernameRegex.test(clean)) {
      setLeetcodeError(
        "Invalid username format. Usernames should only contain letters, numbers, hyphens, or underscores."
      );
      setNotice({
        type: "error",
        text: "Invalid LeetCode username format.",
      });
      return;
    }

    setLoadingLeetCode(true);
    setLeetcodeError(null);
    setNotice(null);

    try {
      const res = await aiFetch<{
        progress: LeetCodeProgressData;
        weeklyActivity: { day: string; date: string; solved: number }[];
        message: string;
      }>("/api/leetcode/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: clean }),
      });
      setLeetcodeData(res.progress);
      if (res.weeklyActivity) setWeeklyActivity(res.weeklyActivity);
      setNotice({
        type: "success",
        text: res.message || `Successfully synced @${res.progress.username} from LeetCode!`,
      });
    } catch (err: any) {
      const message =
        err?.message ||
        "Automated sync failed. LeetCode restricts automated requests — use Manual Entry Mode to record your progress.";
      setLeetcodeError(message);
      setNotice({
        type: "error",
        text: message,
      });
    } finally {
      setLoadingLeetCode(false);
    }
  };

  // Log or Edit Manual Problem
  const handleLogProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim() || !problemUrlOrId.trim()) {
      setNotice({
        type: "error",
        text: "Problem title and URL/identifier are required.",
      });
      return;
    }

    setSavingProblem(true);
    try {
      const res = await aiFetch<{
        progress: LeetCodeProgressData;
        weeklyActivity: { day: string; date: string; solved: number }[];
        message: string;
      }>("/api/leetcode/problem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingProblemId || undefined,
          title: problemTitle.trim(),
          problemUrlOrId: problemUrlOrId.trim(),
          difficulty: problemDifficulty,
          completedAt: problemDate,
          topic: problemTopic.trim() || undefined,
          notes: problemNotes.trim() || undefined,
        }),
      });

      setLeetcodeData(res.progress);
      if (res.weeklyActivity) setWeeklyActivity(res.weeklyActivity);
      setShowProblemModal(false);
      resetProblemForm();
      setNotice({
        type: "success",
        text: res.message || "Problem logged successfully!",
      });
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err?.message || "Failed to log problem.",
      });
    } finally {
      setSavingProblem(false);
    }
  };

  // Edit Problem Action
  const handleEditProblem = (entry: LeetCodeProblemEntry) => {
    setEditingProblemId(entry.id);
    setProblemTitle(entry.title);
    setProblemUrlOrId(entry.problemUrlOrId);
    setProblemDifficulty(entry.difficulty);
    setProblemDate(entry.completedAt || new Date().toISOString().split("T")[0]);
    setProblemTopic(entry.topic || "");
    setProblemNotes(entry.notes || "");
    setShowProblemModal(true);
  };

  // Delete Problem Action
  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recorded problem?")) return;
    try {
      const res = await aiFetch<{
        progress: LeetCodeProgressData;
        weeklyActivity: { day: string; date: string; solved: number }[];
        message: string;
      }>(`/api/leetcode/problem/${id}`, {
        method: "DELETE",
      });
      setLeetcodeData(res.progress);
      if (res.weeklyActivity) setWeeklyActivity(res.weeklyActivity);
      setNotice({
        type: "success",
        text: res.message || "Problem entry deleted and statistics updated.",
      });
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err?.message || "Failed to delete problem.",
      });
    }
  };

  // Update Daily Goal Target
  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      const res = await aiFetch<{
        progress: LeetCodeProgressData;
        message: string;
      }>("/api/leetcode/goal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dailyGoalTarget: Number(goalTargetInput),
        }),
      });
      setLeetcodeData(res.progress);
      setShowGoalModal(false);
      setNotice({
        type: "success",
        text: res.message || `Daily goal updated to ${goalTargetInput} problems/day.`,
      });
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err?.message || "Failed to update daily goal.",
      });
    } finally {
      setSavingGoal(false);
    }
  };

  // Real GitHub metrics (no fabricated mock fallback)
  const hasGitHubData = Boolean(githubData);
  const reposCount = hasGitHubData ? githubData!.publicRepos : null;
  const starsCount = hasGitHubData ? githubData!.totalStars : null;
  const followersCount = hasGitHubData ? githubData!.followers : null;
  const languages = hasGitHubData ? githubData!.languages : [];
  const topRepos = hasGitHubData ? githubData!.topRepos : [];
  const allRepos = hasGitHubData
    ? githubData!.allRepos && githubData!.allRepos.length > 0
      ? githubData!.allRepos
      : githubData!.topRepos
    : [];
  const primaryLang =
    languages.length > 0 && ((languages[0]?.count ?? 0) > 0 || (languages[0]?.percentage ?? 0) > 0)
      ? languages[0]?.name
      : null;

  // Filtered all repos for the GitHub Analytics tab
  const filteredAllRepos = allRepos.filter((r) => {
    if (!repoSearchQuery.trim()) return true;
    const q = repoSearchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q))
    );
  });

  const visibleRepos = filteredAllRepos.slice(0, visibleRepoCount);

  // LeetCode metrics (kept completely separate from GitHub)
  const hasLeetCodeData = Boolean(leetcodeData);
  const totalSolved = hasLeetCodeData ? leetcodeData!.totalSolved : 0;
  const easySolved = hasLeetCodeData ? leetcodeData!.easySolved : 0;
  const mediumSolved = hasLeetCodeData ? leetcodeData!.mediumSolved : 0;
  const hardSolved = hasLeetCodeData ? leetcodeData!.hardSolved : 0;
  const streakDays = hasLeetCodeData ? leetcodeData!.streak : 0;
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todaySolvedInWeekly = weeklyActivity.find((w) => w.date === todayDateStr)?.solved;
  const dailyCurrent = hasLeetCodeData
    ? todaySolvedInWeekly !== undefined
      ? todaySolvedInWeekly
      : leetcodeData!.dailyGoalCurrent
    : 0;
  const dailyTarget = hasLeetCodeData ? leetcodeData!.dailyGoalTarget : 3;
  const leetcodeSource = leetcodeData?.source || "manual";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Progress"
        description="Track your GitHub repositories, code frequency, and LeetCode problem solving metrics in one unified dashboard."
      />

      {/* Status Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            notice.type === "success"
              ? "bg-green-50 border-green-200 text-[#16A34A]"
              : notice.type === "error"
              ? "bg-red-50 border-red-200 text-[#DC2626]"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-500 hover:text-slate-800 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Switcher: Unified Overview, GitHub Analytics, LeetCode Progress */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("combined")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "combined"
              ? "bg-[#635BFF] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Unified Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("github")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "github"
              ? "bg-[#635BFF] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab("leetcode")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "leetcode"
              ? "bg-[#635BFF] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>LeetCode Progress</span>
        </button>
      </div>

      {/* Connection Header Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Connection Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#172033] shrink-0">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#172033]">GitHub Account</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                    hasGitHubData
                      ? "bg-green-50 text-[#16A34A] border-green-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {hasGitHubData ? "Synced ✓" : "Live REST Sync"}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                {githubData ? `@${githubData.username}` : "Sync to view live repos"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSyncGitHub()}
              placeholder="github-username"
              className="text-xs px-3 py-1.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20 w-36"
            />
            <button
              type="button"
              onClick={handleSyncGitHub}
              disabled={loadingGitHub}
              className="px-3 py-1.5 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              {loadingGitHub ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>{loadingGitHub ? "Syncing..." : "Sync"}</span>
            </button>
          </div>
        </div>

        {/* LeetCode Connection Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#172033]">LeetCode Account</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                    leetcodeSource === "synced"
                      ? "bg-green-50 text-[#16A34A] border-green-200"
                      : "bg-amber-50 text-[#F59E0B] border-amber-200"
                  }`}
                >
                  {leetcodeSource === "synced" ? "Synced ✓" : "Manual Entry Mode"}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                {leetcodeUser ? `@${leetcodeUser}` : "Track problem solving"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={leetcodeUser}
              onChange={(e) => setLeetcodeUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSyncLeetCode()}
              placeholder="Username or profile URL"
              className="text-xs px-3 py-1.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20 w-36"
            />
            <button
              type="button"
              onClick={handleSyncLeetCode}
              disabled={loadingLeetCode}
              title="Sync from LeetCode"
              className="px-3 py-1.5 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              {loadingLeetCode ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>{loadingLeetCode ? "Syncing..." : "Sync"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetProblemForm();
                setShowProblemModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-[#F59E0B] border border-amber-200 flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards: 6-Card Layout Preserved with Real Data */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* GitHub Metrics */}
        <StatCard
          title="Repositories"
          value={hasGitHubData ? reposCount! : "—"}
          subtitle={hasGitHubData ? "Public repos" : "Sync account"}
          icon={GitBranch}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Stars"
          value={hasGitHubData ? starsCount! : "—"}
          subtitle="Stars received across repos"
          icon={Star}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Top Language"
          value={hasGitHubData ? primaryLang || "None" : "—"}
          subtitle={hasGitHubData ? "Primary language" : "Sync account"}
          icon={Sparkles}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        {/* LeetCode Metrics Kept Completely Separate */}
        <StatCard
          title="Problems Solved"
          value={hasLeetCodeData ? totalSolved : "—"}
          subtitle={
            hasLeetCodeData
              ? `${easySolved}E • ${mediumSolved}M • ${hardSolved}H`
              : "Sync or log"
          }
          icon={Terminal}
          iconBg="bg-green-100"
          iconColor="text-[#16A34A]"
        />
        <StatCard
          title="Coding Streak"
          value={hasLeetCodeData ? (streakDays > 0 ? `${streakDays} Days` : "0 Days") : "—"}
          subtitle={
            hasLeetCodeData
              ? leetcodeData?.isStreakVerified
                ? "Verified streak ✓"
                : "Manual streak"
              : "Sync or log"
          }
          icon={Flame}
          iconBg="bg-amber-100"
          iconColor="text-[#F59E0B]"
        />
        <StatCard
          title="Daily Goal"
          value={hasLeetCodeData ? `${dailyCurrent}/${dailyTarget}` : `0/${dailyTarget}`}
          subtitle={
            hasLeetCodeData
              ? dailyCurrent >= dailyTarget
                ? "Completed ✓"
                : "In progress"
              : "Daily target"
          }
          icon={CheckCircle2}
          iconBg="bg-[#635BFF]/10"
          iconColor="text-[#635BFF]"
        />
      </div>

      {/* ========================================================
          TAB 1: UNIFIED OVERVIEW (Combined view)
          ======================================================== */}
      {activeTab === "combined" && (
        <div className="space-y-6">
          {/* GitHub Overview: Languages & Featured Repos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Language Breakdown */}
            <SectionCard
              title="Language Distribution"
              description="Proportion of public repositories by primary language"
            >
              {hasGitHubData && languages.length > 0 ? (
                <div className="space-y-4">
                  <div className="w-full h-3 rounded-full flex overflow-hidden bg-slate-100">
                    {languages.map((lang, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: `${lang.percentage}%`,
                          backgroundColor: lang.color,
                        }}
                        title={`${lang.name}: ${lang.percentage}% (${lang.count} repos)`}
                      />
                    ))}
                  </div>

                  <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                    {languages.map((lang, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: lang.color }}
                          />
                          <span className="font-medium text-[#172033]">
                            {lang.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <span>{lang.count} repos</span>
                          <span className="font-semibold text-[#172033]">
                            {lang.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <GitBranch className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-[#64748B]">
                    No GitHub data synced yet. Enter your GitHub username above
                    and click <span className="font-semibold text-[#635BFF]">Sync</span>.
                  </p>
                </div>
              )}
            </SectionCard>

            {/* Featured Repositories List */}
            <div className="lg:col-span-2">
              <SectionCard
                title="Featured Repositories"
                description="Live public repositories sorted by stars and recency"
              >
                {hasGitHubData && topRepos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topRepos.slice(0, 4).map((repo, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#635BFF]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-[#172033] hover:text-[#635BFF] flex items-center gap-1 truncate"
                            >
                              <span>{repo.name}</span>
                              <ExternalLink className="w-3 h-3 text-[#64748B] shrink-0" />
                            </a>
                            <span className="text-[10px] text-[#64748B] shrink-0">
                              {repo.updated}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                            {repo.description || "No description provided."}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: repo.languageColor }}
                            />
                            {repo.language || "Plain"}
                          </span>
                          <div className="flex items-center gap-3">
                            <span
                              className="flex items-center gap-1"
                              title="Stars received"
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {repo.stars}
                            </span>
                            <span
                              className="flex items-center gap-1"
                              title="Forks"
                            >
                              <GitFork className="w-3 h-3 text-slate-500" />
                              {repo.forks}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <Star className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-[#64748B]">
                      {hasGitHubData
                        ? "No public repositories found for this account."
                        : "Sync your GitHub account above to display your real repositories."}
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>
          </div>

          {/* LeetCode Section on Unified Overview */}
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Difficulty Breakdown */}
              <SectionCard
                title="Problem Difficulty Split"
                description="Solved vs target benchmark"
                action={
                  <button
                    onClick={() => {
                      resetProblemForm();
                      setShowProblemModal(true);
                    }}
                    className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Log Today</span>
                  </button>
                }
              >
                <div className="space-y-4">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#16A34A]">Easy</span>
                      <span className="text-[#172033] font-bold">
                        {easySolved} solved
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#16A34A] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (easySolved / 80) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#F59E0B]">Medium</span>
                      <span className="text-[#172033] font-bold">
                        {mediumSolved} solved
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#F59E0B] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (mediumSolved / 80) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Hard */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#DC2626]">Hard</span>
                      <span className="text-[#172033] font-bold">
                        {hardSolved} solved
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#DC2626] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (hardSolved / 25) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#E2E8F0] text-[11px] text-[#64748B] leading-relaxed">
                    <span className="font-semibold text-[#172033]">
                      Placement Benchmark:
                    </span>{" "}
                    Target 60+ Medium problems to clear product company technical
                    screenings.
                  </div>
                </div>
              </SectionCard>

              {/* Weekly Problems Solved Chart */}
              <div className="lg:col-span-2">
                <SectionCard
                  title="Weekly Problem Practice Distribution"
                  description="Problems solved by day this week"
                >
                  <LeetCodeWeeklyChart data={weeklyActivity} />
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: GITHUB ANALYTICS (Full dedicated GitHub dashboard)
          ======================================================== */}
      {activeTab === "github" && (
        <div className="space-y-6">
          {hasGitHubData && githubData ? (
            <>
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {githubData.avatarUrl ? (
                    <img
                      src={githubData.avatarUrl}
                      alt={githubData.username}
                      className="w-16 h-16 rounded-2xl border border-[#E2E8F0] object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Github className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#172033]">
                        {githubData.name || githubData.username}
                      </h2>
                      <a
                        href={
                          githubData.htmlUrl ||
                          `https://github.com/${githubData.username}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
                      >
                        <span>@{githubData.username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {githubData.bio && (
                      <p className="text-xs text-[#64748B] max-w-xl">
                        {githubData.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] pt-0.5">
                      {githubData.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{githubData.location}</span>
                        </span>
                      )}
                      {githubData.company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{githubData.company}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>
                          <strong className="text-[#172033]">
                            {githubData.followers}
                          </strong>{" "}
                          followers •{" "}
                          <strong className="text-[#172033]">
                            {githubData.following}
                          </strong>{" "}
                          following
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-3 md:pt-0 md:pl-5 shrink-0">
                  <div className="text-center px-2">
                    <div className="text-lg font-bold text-[#172033]">
                      {githubData.publicRepos}
                    </div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                      Public Repos
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{githubData.totalStars}</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                      Total Stars
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg font-bold text-[#635BFF]">
                      {githubData.totalForks}
                    </div>
                    <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                      Total Forks
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Distribution & Quality Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectionCard
                  title="Language Distribution"
                  description="Primary language calculated across all retrieved repositories"
                >
                  <div className="space-y-4">
                    <div className="w-full h-3 rounded-full flex overflow-hidden bg-slate-100">
                      {languages.map((lang, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: lang.color,
                          }}
                          title={`${lang.name}: ${lang.percentage}% (${lang.count} repos)`}
                        />
                      ))}
                    </div>

                    <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                      {languages.map((lang, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: lang.color }}
                            />
                            <span className="font-medium text-[#172033]">
                              {lang.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#64748B]">
                            <span>{lang.count} repos</span>
                            <span className="font-semibold text-[#172033]">
                              {lang.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionCard>

                {/* Suggestions & Next Steps */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
                    <h4 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Project Quality Suggestions</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#64748B]">
                      {githubData.qualitySuggestions.map((sug, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#635BFF] font-bold">•</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
                    <h4 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" />
                      <span>Recommended Next Steps</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#64748B]">
                      {githubData.recommendedSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#635BFF] font-bold">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Complete Repository List with Search & Pagination */}
              <SectionCard
                title={
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div>
                      <h2 className="text-base font-semibold text-[#172033]">
                        All Accessible Public Repositories ({allRepos.length})
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Fetched live from GitHub REST API with full pagination
                      </p>
                    </div>

                    <div className="relative sm:w-64">
                      <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={repoSearchQuery}
                        onChange={(e) => {
                          setRepoSearchQuery(e.target.value);
                          setVisibleRepoCount(6);
                        }}
                        placeholder="Search repositories..."
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#172033] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
                      />
                    </div>
                  </div>
                }
              >
                {visibleRepos.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {visibleRepos.map((repo, idx) => (
                        <div
                          key={repo.id || idx}
                          className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#635BFF]/40 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#172033] hover:text-[#635BFF] flex items-center gap-1 truncate"
                              >
                                <span className="truncate">{repo.name}</span>
                                <ExternalLink className="w-3 h-3 text-[#64748B] shrink-0" />
                              </a>
                              <span className="text-[10px] text-[#64748B] shrink-0">
                                {repo.updated}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                              {repo.description || "No description provided."}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: repo.languageColor }}
                              />
                              {repo.language || "Plain"}
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className="flex items-center gap-1"
                                title="Stars received"
                              >
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {repo.stars}
                              </span>
                              <span
                                className="flex items-center gap-1"
                                title="Forks"
                              >
                                <GitFork className="w-3 h-3 text-slate-500" />
                                {repo.forks}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Pagination */}
                    {filteredAllRepos.length > visibleRepoCount && (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleRepoCount((prev) => prev + 6)
                          }
                          className="px-5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 text-xs font-semibold text-[#172033] transition-colors"
                        >
                          Load More Repositories ({visibleRepoCount} of{" "}
                          {filteredAllRepos.length})
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-xs text-[#64748B]">
                      {repoSearchQuery
                        ? `No repositories matched "${repoSearchQuery}".`
                        : "No repositories found for this account."}
                    </p>
                  </div>
                )}
              </SectionCard>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
              <Github className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#172033]">
                No GitHub Account Synced
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                Enter your public GitHub username in the input box above and click{" "}
                <span className="font-semibold text-[#635BFF]">Sync</span> to
                retrieve your live repositories, stars, language distribution, and
                campus placement profile insights.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: LEETCODE PROGRESS (Dedicated LeetCode dashboard)
          ======================================================== */}
      {activeTab === "leetcode" && (
        <div className="space-y-6">
          {hasLeetCodeData && leetcodeData ? (
            <>
              {/* LeetCode Profile Header Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {leetcodeData.avatarUrl ? (
                    <img
                      src={leetcodeData.avatarUrl}
                      alt={leetcodeData.username}
                      className="w-16 h-16 rounded-2xl border border-[#E2E8F0] object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
                      <Terminal className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#172033]">
                        {leetcodeData.realName || leetcodeData.username}
                      </h2>
                      <a
                        href={`https://leetcode.com/u/${leetcodeData.username}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
                      >
                        <span>@{leetcodeData.username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          leetcodeData.source === "synced"
                            ? "bg-green-50 text-[#16A34A] border-green-200"
                            : "bg-amber-50 text-[#F59E0B] border-amber-200"
                        }`}
                      >
                        {leetcodeData.source === "synced"
                          ? "Live Synced ✓"
                          : "Manual Mode"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] pt-0.5">
                      {leetcodeData.ranking ? (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            Global Rank:{" "}
                            <strong className="text-[#172033]">
                              #{leetcodeData.ranking.toLocaleString()}
                            </strong>
                          </span>
                        </span>
                      ) : null}

                      {leetcodeData.acceptanceRate ? (
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-blue-500" />
                          <span>
                            Acceptance Rate:{" "}
                            <strong className="text-[#172033]">
                              {leetcodeData.acceptanceRate}
                            </strong>
                          </span>
                        </span>
                      ) : null}

                      {leetcodeData.totalSubmissions ? (
                        <span className="flex items-center gap-1">
                          <span>
                            Total Submissions:{" "}
                            <strong className="text-[#172033]">
                              {leetcodeData.totalSubmissions.toLocaleString()}
                            </strong>
                          </span>
                        </span>
                      ) : null}

                      {leetcodeData.lastSyncedAt ? (
                        <span className="text-[10px] text-slate-400">
                          Last updated:{" "}
                          {new Date(leetcodeData.lastSyncedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-3 md:pt-0 md:pl-5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setGoalTargetInput(dailyTarget);
                      setShowGoalModal(true);
                    }}
                    className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#172033] flex items-center gap-1.5 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5 text-[#635BFF]" />
                    <span>Set Daily Target ({dailyTarget})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetProblemForm();
                      setShowProblemModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Problem</span>
                  </button>
                </div>
              </div>

              {/* Main Grid: Difficulty Breakdown + Daily Goal + Weekly Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Difficulty Split + Daily Goal */}
                <div className="space-y-6">
                  {/* Difficulty Breakdown */}
                  <SectionCard
                    title="Problem Difficulty Split"
                    description="Solved vs placement benchmark"
                  >
                    <div className="space-y-4">
                      {/* Easy */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-[#16A34A]">Easy</span>
                          <span className="text-[#172033] font-bold">
                            {easySolved} solved
                          </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#16A34A] h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (easySolved / 80) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Medium */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-[#F59E0B]">Medium</span>
                          <span className="text-[#172033] font-bold">
                            {mediumSolved} solved
                          </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#F59E0B] h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (mediumSolved / 80) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Hard */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-[#DC2626]">Hard</span>
                          <span className="text-[#172033] font-bold">
                            {hardSolved} solved
                          </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#DC2626] h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (hardSolved / 25) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#E2E8F0] text-[11px] text-[#64748B] leading-relaxed">
                        <span className="font-semibold text-[#172033]">
                          Placement Benchmark:
                        </span>{" "}
                        Aim for 60+ Medium problems to pass product company online coding
                        assessments.
                      </div>
                    </div>
                  </SectionCard>

                  {/* Daily Goal Card */}
                  <SectionCard
                    title="Daily Practice Goal"
                    description={`Configured target: ${dailyTarget} problems/day`}
                    action={
                      <button
                        onClick={() => {
                          setGoalTargetInput(dailyTarget);
                          setShowGoalModal(true);
                        }}
                        className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
                      >
                        <Target className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    }
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#64748B]">Today&apos;s Progress</span>
                        <span className="font-bold text-[#172033]">
                          {dailyCurrent} / {dailyTarget} completed
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#635BFF] h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (dailyCurrent / dailyTarget) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            dailyCurrent >= dailyTarget
                              ? "text-[#16A34A]"
                              : "text-[#64748B]"
                          }`}
                        >
                          {dailyCurrent >= dailyTarget
                            ? "Goal Achieved Today! 🎉"
                            : `${dailyTarget - dailyCurrent} more to hit today's goal`}
                        </span>
                        <span className="text-slate-400">
                          Streak: {streakDays} days
                        </span>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                {/* Right Column: Weekly Activity Chart + Recent Submissions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Weekly Chart */}
                  <SectionCard
                    title="Weekly Problem Practice Distribution"
                    description="Verified problems solved per day this week"
                  >
                    <LeetCodeWeeklyChart data={weeklyActivity} />
                  </SectionCard>

                  {/* Recent Activity (when available from sync) */}
                  {leetcodeData.recentSubmissions &&
                  leetcodeData.recentSubmissions.length > 0 ? (
                    <SectionCard
                      title="Recent Submissions"
                      description="Last public submissions verified from LeetCode"
                    >
                      <div className="divide-y divide-[#E2E8F0]">
                        {leetcodeData.recentSubmissions.map((sub, idx) => (
                          <div
                            key={idx}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  sub.statusDisplay === "Accepted"
                                    ? "bg-[#16A34A]"
                                    : "bg-red-500"
                                }`}
                              />
                              <a
                                href={
                                  sub.titleSlug
                                    ? `https://leetcode.com/problems/${sub.titleSlug}/`
                                    : `https://leetcode.com/u/${leetcodeData.username}/`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#172033] hover:text-[#635BFF] truncate flex items-center gap-1"
                              >
                                <span className="truncate">{sub.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              </a>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#64748B]">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px]">
                                {sub.lang}
                              </span>
                              <span
                                className={`font-semibold ${
                                  sub.statusDisplay === "Accepted"
                                    ? "text-[#16A34A]"
                                    : "text-red-500"
                                }`}
                              >
                                {sub.statusDisplay}
                              </span>
                              {sub.timestamp ? (
                                <span className="text-slate-400">{sub.timestamp}</span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  ) : null}
                </div>
              </div>

              {/* Logged Problems History Section */}
              <SectionCard
                title={
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div>
                      <h2 className="text-base font-semibold text-[#172033]">
                        Manual Problem Entries ({(leetcodeData.problemEntries || []).length})
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Problems tracked manually with verified completion dates & streaks
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        resetProblemForm();
                        setShowProblemModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Problem</span>
                    </button>
                  </div>
                }
              >
                {leetcodeData.problemEntries && leetcodeData.problemEntries.length > 0 ? (
                  <div className="divide-y divide-[#E2E8F0]">
                    {leetcodeData.problemEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                entry.difficulty === "Easy"
                                  ? "bg-green-50 text-[#16A34A] border border-green-200"
                                  : entry.difficulty === "Medium"
                                  ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                                  : "bg-red-50 text-[#DC2626] border border-red-200"
                              }`}
                            >
                              {entry.difficulty}
                            </span>

                            {entry.problemUrlOrId.startsWith("http") ? (
                              <a
                                href={entry.problemUrlOrId}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-[#172033] hover:text-[#635BFF] truncate flex items-center gap-1"
                              >
                                <span>{entry.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ) : (
                              <span className="font-bold text-[#172033] truncate">
                                {entry.title}
                              </span>
                            )}

                            {entry.topic ? (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {entry.topic}
                              </span>
                            ) : null}
                          </div>

                          {entry.notes ? (
                            <p className="text-[11px] text-[#64748B] italic">
                              &quot;{entry.notes}&quot;
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#64748B]">
                          <span>Completed: {entry.completedAt}</span>
                          <button
                            type="button"
                            onClick={() => handleEditProblem(entry)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#172033] transition-colors"
                            title="Edit entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProblem(entry.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-[#64748B]">
                      No manual problems logged yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        resetProblemForm();
                        setShowProblemModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Your First Problem</span>
                    </button>
                  </div>
                )}
              </SectionCard>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
              <Terminal className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#172033]">
                No LeetCode Progress Recorded
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                Enter your public LeetCode username in the box above and click{" "}
                <span className="font-semibold text-[#635BFF]">Sync</span> to retrieve
                your live solved metrics, streak, and difficulty split, or use{" "}
                <span className="font-semibold text-[#F59E0B]">Log</span> to track
                problems manually.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetProblemForm();
                    setShowProblemModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log a Solved Problem</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Problem Logging & Edit Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#172033]">
                  {editingProblemId ? "Edit LeetCode Problem" : "Log Solved Problem"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowProblemModal(false);
                  resetProblemForm();
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogProblem} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  Problem Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g. Two Sum"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  LeetCode URL or Problem ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={problemUrlOrId}
                  onChange={(e) => setProblemUrlOrId(e.target.value)}
                  placeholder="e.g. two-sum or https://leetcode.com/problems/two-sum"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#172033] block mb-1">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setProblemDifficulty(diff)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          problemDifficulty === diff
                            ? diff === "Easy"
                              ? "bg-green-50 border-green-300 text-[#16A34A]"
                              : diff === "Medium"
                              ? "bg-amber-50 border-amber-300 text-[#F59E0B]"
                              : "bg-red-50 border-red-300 text-[#DC2626]"
                            : "border-[#E2E8F0] text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#172033] block mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={problemDate}
                    onChange={(e) => setProblemDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  Topic / Tag (Optional)
                </label>
                <input
                  type="text"
                  value={problemTopic}
                  onChange={(e) => setProblemTopic(e.target.value)}
                  placeholder="e.g. Arrays & Hashing, Dynamic Programming, Graphs"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  Notes / Approach (Optional)
                </label>
                <textarea
                  rows={2}
                  value={problemNotes}
                  onChange={(e) => setProblemNotes(e.target.value)}
                  placeholder="e.g. Used two-pointer method with O(n) time and O(1) space."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20 resize-none"
                />
              </div>

              <p className="text-[11px] text-[#64748B]">
                Logging problems records verified completion dates and automatically
                updates your practice streak without duplicate counting.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setShowProblemModal(false);
                    resetProblemForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProblem}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingProblem && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{editingProblemId ? "Update Problem" : "Save Problem"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Goal Configuration Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#635BFF] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#172033]">
                  Configure Daily Coding Goal
                </h3>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">
                  Problems Target per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={goalTargetInput}
                  onChange={(e) => setGoalTargetInput(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
                  required
                />
                <p className="text-[11px] text-[#64748B] mt-1.5">
                  Standard recommendation: 2 to 4 problems per day during campus placement preparation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingGoal && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Save Target</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
