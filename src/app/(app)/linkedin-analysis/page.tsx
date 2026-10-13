"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  FileText,
  User,
  Image as ImageIcon,
  Briefcase,
  Layers,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Send,
  HelpCircle,
} from "lucide-react";
import { Linkedin } from "@/components/common/Icons";
import { PageHeader } from "@/components/common/PageHeader";
import { aiFetch } from "@/lib/ai-client";

export interface CriterionEvaluation {
  id:
    | "headline"
    | "photo_banner"
    | "about"
    | "skills"
    | "experience"
    | "projects"
    | "posts_activity"
    | "education_completeness";
  name: string;
  maxScore: number;
  earnedScore: number | null;
  isAvailable: boolean;
  status: "available" | "unavailable";
  explanation: string;
}

export interface ActionPlanItem {
  priority: "High" | "Medium" | "Low";
  action: string;
  benefit: string;
  criterion: string;
}

export interface FullLinkedInAnalysisResult {
  overallScore: number;
  availableEarnedScore: number;
  availableMaxScore: number;
  evaluatedCount: number;
  totalCount: number;
  evidenceCoverage: string;
  ratingExplanation: string;
  criteriaBreakdown: CriterionEvaluation[];
  strengths: string[];
  weaknesses: string[];
  headlineImprovement: {
    currentHeadline?: string | null;
    suggestedHeadline: string;
    explanation: string;
  };
  aboutSuggestions: {
    recommendations: string[];
    suggestedRewrite: string;
  };
  contentRecommendations: string[];
  actionPlan: ActionPlanItem[];
  profileUrl?: string | null;
  dataSource: "live_url" | "supplied_content" | "verified_profile";
  analyzedAt?: string;
}

const CRITERION_ICONS: Record<string, React.ElementType> = {
  headline: User,
  photo_banner: ImageIcon,
  about: FileText,
  skills: CheckCircle2,
  experience: Briefcase,
  projects: Layers,
  posts_activity: MessageSquare,
  education_completeness: GraduationCap,
};

export default function LinkedInAnalysisPage() {
  const [profileUrl, setProfileUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Evaluating profile data...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authwall restriction fallback modal/form
  const [authwallState, setAuthwallState] = useState<{
    normalizedUrl: string;
    username: string;
    message: string;
  } | null>(null);
  const [suppliedContent, setSuppliedContent] = useState("");

  // Result state
  const [result, setResult] = useState<FullLinkedInAnalysisResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalize and validate URL on frontend
  const validateAndNormalizeUrl = (input: string) => {
    let clean = input.trim();
    if (!clean) {
      return { isValid: false, error: "Please enter your LinkedIn profile URL." };
    }
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }

    try {
      const parsed = new URL(clean);
      if (!parsed.hostname.toLowerCase().includes("linkedin.com")) {
        return { isValid: false, error: "URL must be from linkedin.com." };
      }
      const match = parsed.pathname.match(/\/in\/([a-zA-Z0-9_\-%]+)/i);
      if (!match || !match[1]) {
        return {
          isValid: false,
          error:
            "Please provide a personal profile URL containing /in/ (e.g. https://www.linkedin.com/in/your-profile/).",
        };
      }
      const username = decodeURIComponent(match[1]).replace(/\/$/, "");
      return {
        isValid: true,
        normalizedUrl: `https://www.linkedin.com/in/${username}`,
        username,
      };
    } catch {
      return { isValid: false, error: "Invalid URL format. Please check the URL and try again." };
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError(null);
    setErrorMessage(null);

    const validation = validateAndNormalizeUrl(profileUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      setUrlError(validation.error || "Please enter a valid LinkedIn profile URL.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep("Connecting to LinkedIn profile and checking authorized access...");

    try {
      const response = await aiFetch<{
        ok?: boolean;
        requiresContent?: boolean;
        authwallBlocked?: boolean;
        normalizedUrl?: string;
        username?: string;
        message?: string;
        analysis?: FullLinkedInAnalysisResult;
        error?: string;
      }>("/api/ai/linkedin-analyze", {
        method: "POST",
        body: JSON.stringify({ profileUrl: validation.normalizedUrl }),
      });

      if (response.requiresContent) {
        setAuthwallState({
          normalizedUrl: response.normalizedUrl || validation.normalizedUrl,
          username: response.username || validation.username || "profile",
          message:
            response.message ||
            "LinkedIn restricts direct automated access with a sign-in security wall (HTTP 999/Authwall).",
        });
        setIsAnalyzing(false);
        return;
      }

      if (response.ok && response.analysis) {
        setResult(response.analysis);
        setAuthwallState(null);
      } else {
        setErrorMessage(
          response.error || "LinkedIn analysis could not be completed. Please try again."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to analyze LinkedIn profile. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeSupplied = async (useVerifiedProfile = false) => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setLoadingStep(
      useVerifiedProfile
        ? "Evaluating verified CareerBuddy engineering profile across 8 rubric criteria..."
        : "Analyzing supplied profile text across 8 rubric criteria..."
    );

    try {
      const response = await aiFetch<{
        ok?: boolean;
        analysis?: FullLinkedInAnalysisResult;
        error?: string;
      }>("/api/ai/linkedin-analyze", {
        method: "POST",
        body: JSON.stringify({
          profileUrl: authwallState?.normalizedUrl || profileUrl,
          suppliedContent: useVerifiedProfile ? "" : suppliedContent,
          useVerifiedProfile,
        }),
      });

      if (response.ok && response.analysis) {
        setResult(response.analysis);
        setAuthwallState(null);
      } else {
        setErrorMessage(
          response.error || "Analysis failed. Please check the supplied content."
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to complete evaluation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleReset = () => {
    setResult(null);
    setAuthwallState(null);
    setUrlError(null);
    setErrorMessage(null);
    setSuppliedContent("");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <PageHeader
        title="LinkedIn Profile Analysis"
        description="Analyze your professional presence and discover how to improve your profile for recruiters."
      >
        {result && (
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Analyze Another Profile</span>
          </button>
        )}
      </PageHeader>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-300">Analysis Error</p>
            <p className="mt-0.5 text-red-200/90">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. INITIAL STATE: Centered, Compact LinkedIn URL Input Card     */}
      {/* ============================================================== */}
      {!result && !authwallState && (
        <div className="flex items-center justify-center pt-8 pb-12">
          <div className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Subtle purple gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#635BFF] via-purple-500 to-indigo-500" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0 border border-[#635BFF]/20">
                <Linkedin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Enter LinkedIn Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive 8-criteria recruiter audit & optimization
                </p>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileUrl}
                    onChange={(e) => {
                      setProfileUrl(e.target.value);
                      if (urlError) setUrlError(null);
                    }}
                    placeholder="https://www.linkedin.com/in/your-profile/"
                    disabled={isAnalyzing}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border ${
                      urlError
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700/80 focus:border-[#635BFF] focus:ring-[#635BFF]/20"
                    } text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all`}
                  />
                  {profileUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {urlError && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{urlError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !profileUrl.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] active:bg-[#4338CA] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#635BFF]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Profile</span>
                  </>
                )}
              </button>
            </form>

            {isAnalyzing && (
              <div className="mt-4 p-3 rounded-xl bg-[#635BFF]/5 border border-[#635BFF]/15 flex items-center gap-2.5 text-xs text-[#635BFF] dark:text-purple-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#635BFF]" />
                <span className="animate-pulse">{loadingStep}</span>
              </div>
            )}

            {/* Note required by prompt */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Profile must be publicly accessible or its content
                must be available through a supported integration. LinkedIn protects
                authenticated member data behind sign-in security controls.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. AUTHWALL RESTRICTION: Transparent fallback & content intake  */}
      {/* ============================================================== */}
      {!result && authwallState && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0F172A] rounded-2xl border border-amber-500/30 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Direct Profile Access Restricted by LinkedIn
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  HTTP 999 / Sign-in Wall
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                LinkedIn blocks automated web scrapers from viewing private profile
                sections (About, Experience, Skills) for{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {authwallState.normalizedUrl}
                </span>
                . In accordance with platform terms, we never bypass login credentials or
                anti-bot restrictions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Choose an Honest Evaluation Method:
            </h4>

            {/* Option A: Paste profile export or text */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Option A: Paste Profile Content or PDF Export
              </label>
              <textarea
                value={suppliedContent}
                onChange={(e) => setSuppliedContent(e.target.value)}
                placeholder="Paste your Headline, About summary, Experience bullets, or Skills here (from your LinkedIn profile or 'Save to PDF' export)..."
                rows={5}
                className="w-full p-3 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20 resize-y"
              />
              <button
                type="button"
                onClick={() => handleAnalyzeSupplied(false)}
                disabled={isAnalyzing || !suppliedContent.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Analyze Supplied Content Across 8 Criteria</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200 dark:border-slate-800" />
              <span className="shrink mx-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                OR
              </span>
              <div className="grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            {/* Option B: Use CareerBuddy verified candidate profile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Option B: Evaluate with Verified CareerBuddy Profile Records
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Use your verified technical skills, college background, and career target
                already configured in CareerBuddy to run the complete recruiter rubric.
              </p>
              <button
                type="button"
                onClick={() => handleAnalyzeSupplied(true)}
                disabled={isAnalyzing}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-400" />
                )}
                <span>Evaluate with CareerBuddy Records</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setAuthwallState(null)}
              className="text-xs text-slate-500 hover:text-slate-300 underline font-medium"
            >
              ← Enter a different URL
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. RESULTS DASHBOARD: Complete 8-Criteria Recruiter Audit        */}
      {/* ============================================================== */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Section A: Overall Score Card with Circular Gauge */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Circular Gauge */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={
                      result.overallScore >= 80
                        ? "#10B981"
                        : result.overallScore >= 60
                        ? "#635BFF"
                        : "#F59E0B"
                    }
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 - (2 * Math.PI * 40 * result.overallScore) / 100
                    }
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {result.overallScore}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Score text & Coverage */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Profile Quality Score
                  </h2>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      result.overallScore >= 80
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : result.overallScore >= 60
                        ? "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {result.overallScore >= 80
                      ? "High Recruiter Appeal"
                      : result.overallScore >= 60
                      ? "Moderate Strength"
                      : "Needs Optimization"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {result.ratingExplanation}
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap justify-center md:justify-start">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium border border-slate-200 dark:border-slate-700/60">
                    Evidence Coverage:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {result.evidenceCoverage}
                    </strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium border border-slate-200 dark:border-slate-700/60">
                    Data Source:{" "}
                    <strong className="text-slate-800 dark:text-slate-200 capitalize">
                      {result.dataSource.replace("_", " ")}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
              {result.profileUrl && (
                <a
                  href={result.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Public Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze Another</span>
              </button>
            </div>
          </div>

          {/* Section B: Criterion Breakdown across 8 Criteria */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Criterion Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluated across 8 verified criteria totaling 100 points
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {result.evaluatedCount} of {result.totalCount} evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {result.criteriaBreakdown.map((criterion) => {
                const Icon = CRITERION_ICONS[criterion.id] || CheckCircle2;
                const percentage =
                  criterion.isAvailable && criterion.earnedScore !== null
                    ? Math.round((criterion.earnedScore / criterion.maxScore) * 100)
                    : 0;

                return (
                  <div
                    key={criterion.id}
                    className={`p-4 rounded-xl border transition-all ${
                      criterion.isAvailable
                        ? "bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                        : "bg-slate-100/40 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            criterion.isAvailable
                              ? "bg-[#635BFF]/10 text-[#635BFF]"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {criterion.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Max {criterion.maxScore} points
                          </span>
                        </div>
                      </div>

                      {/* Points / Availability Status */}
                      {criterion.isAvailable && criterion.earnedScore !== null ? (
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {criterion.earnedScore} / {criterion.maxScore}
                          </span>
                          <span className="block text-[10px] font-semibold text-emerald-500">
                            {percentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
                          Not available
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          criterion.isAvailable
                            ? percentage >= 80
                              ? "bg-emerald-500"
                              : percentage >= 50
                              ? "bg-[#635BFF]"
                              : "bg-amber-500"
                            : "bg-transparent"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {criterion.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C & D: Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Key Strengths
                </h3>
              </div>
              <ul className="space-y-2.5">
                {result.strengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Areas for Improvement
                </h3>
              </div>
              <ul className="space-y-2.5">
                {result.weaknesses.map((weak, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section E: Headline Improvement */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#635BFF]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Headline Improvement
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(result.headlineImprovement.suggestedHeadline, "headline")
                }
                className="px-3 py-1.5 rounded-xl bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#635BFF]/20"
              >
                {copiedKey === "headline" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Improved Headline</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {result.headlineImprovement.currentHeadline && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Current Headline
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {result.headlineImprovement.currentHeadline}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-purple-500/5 dark:bg-[#635BFF]/10 border border-[#635BFF]/30">
                <span className="text-[10px] font-bold text-[#635BFF] dark:text-purple-400 uppercase tracking-wider block mb-1">
                  Suggested Recruiter-Optimized Headline
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white font-mono leading-relaxed">
                  {result.headlineImprovement.suggestedHeadline}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                <strong>Why this is better:</strong>{" "}
                {result.headlineImprovement.explanation}
              </p>
            </div>
          </div>

          {/* Section F: About Section Suggestions & Rewrite */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#635BFF]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  About Section Optimization
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(result.aboutSuggestions.suggestedRewrite, "about")
                }
                className="px-3 py-1.5 rounded-xl bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#635BFF]/20"
              >
                {copiedKey === "about" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Example Rewrite</span>
                  </>
                )}
              </button>
            </div>

            {/* Actionable recommendations */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Key Improvements
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {result.aboutSuggestions.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example rewrite */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recruiter-Ready Example Rewrite (Based on verified evidence)
              </span>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-line leading-relaxed">
                {result.aboutSuggestions.suggestedRewrite}
              </div>
            </div>
          </div>

          {/* Section G: Content & Posting Recommendations */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#635BFF]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Content & Technical Posting Recommendations
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-engagement technical topics tailored to your engineering specialization
              to boost recruiter profile visits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {result.contentRecommendations.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {topic}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section H: Top 5 Prioritized Action Plan */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#635BFF]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Prioritized Action Plan
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top 5 prioritized changes to implement in order of recruiting impact.
            </p>

            <div className="space-y-3 pt-1">
              {result.actionPlan.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 mt-0.5 ${
                        item.priority === "High"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : item.priority === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.action}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        <strong className="text-slate-700 dark:text-slate-300">
                          Benefit:
                        </strong>{" "}
                        {item.benefit}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium text-slate-400 px-2 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 shrink-0">
                    {item.criterion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
