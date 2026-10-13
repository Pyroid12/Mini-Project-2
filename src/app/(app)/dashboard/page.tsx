"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  Compass,
  ArrowRight,
  ArrowUpRight,
  Target,
  Award,
  Loader2,
  Terminal,
} from "lucide-react";
import { Linkedin } from "@/components/common/Icons";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { aiFetch } from "@/lib/ai-client";

interface RoadmapProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface DashboardSummary {
  latestResumeScore: number | null;
  latestResume: {
    id: string;
    fileName: string;
    atsScore: number;
    targetRole: string | null;
    createdAt: string;
  } | null;
  targetCareer: string | null;
  roadmapProgress: RoadmapProgress;
  activeRoadmap: {
    id: string;
    roleTitle: string;
    roleId: string;
  } | null;
  linkedinStatus: {
    id: string;
    profileMatchScore: number;
    createdAt: string;
  } | null;
  readinessScore?: number | null;
  githubRepos?: number | null;
  leetcodeSolved?: number | null;
  recommendedActions: {
    id: string;
    title: string;
    description: string;
    category: string;
    route: string;
  }[];
}

export default function DashboardPage() {
  const { user } = useUser();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName =
    user?.firstName ||
    (user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]) ||
    "there";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await aiFetch<{ summary: DashboardSummary }>(
          "/api/dashboard/summary"
        );
        if (cancelled) return;
        setSummary(res.summary);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
              Welcome back, {firstName}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Here is your personalized placement preparation status and today&apos;s priority milestones.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-[#635BFF]">
            <Target className="w-4 h-4" />
            <span>
              Target Goal:{" "}
              {summary?.targetCareer ? summary.targetCareer : "No target career set yet"}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/career-roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Career Roadmap</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-[#635BFF] animate-spin" />
          <p className="text-sm text-[#64748B]">Loading your dashboard…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
          <p className="text-sm font-semibold text-[#DC2626]">Could not load dashboard</p>
          <p className="text-xs text-[#64748B] mt-1">{error}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="ATS Resume Score"
              value={summary?.latestResumeScore != null ? `${summary.latestResumeScore} / 100` : "—"}
              subtitle={summary?.latestResumeScore != null ? "Latest analysis" : "Not analyzed yet"}
              icon={FileText}
              iconBg="bg-green-100"
              iconColor="text-[#16A34A]"
              href="/resume-analysis"
            />

            <StatCard
              title="Target Career"
              value={summary?.targetCareer || "Not set"}
              subtitle={summary?.targetCareer ? "Active roadmap" : "Choose a target role"}
              icon={Target}
              iconBg="bg-[#635BFF]/10"
              iconColor="text-[#635BFF]"
              href="/career-roadmap"
            />

            <StatCard
              title="Roadmap Progress"
              value={`${summary?.roadmapProgress.percentage ?? 0}%`}
              subtitle={
                summary && summary.roadmapProgress.total > 0
                  ? `${summary.roadmapProgress.completed}/${summary.roadmapProgress.total} phases`
                  : "No roadmap in progress"
              }
              icon={Compass}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              href="/career-roadmap"
            />

            <StatCard
              title="LinkedIn Profile"
              value={
                summary?.linkedinStatus
                  ? `${summary.linkedinStatus.profileMatchScore} / 100`
                  : "—"
              }
              subtitle={summary?.linkedinStatus ? "Profile match score" : "Not analyzed yet"}
              icon={Linkedin}
              iconBg="bg-sky-100"
              iconColor="text-[#0077B5]"
              href="/linkedin-analysis"
            />
          </div>

          {/* Roadmap Progress Ring + Recommended Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roadmap Progress Gauge */}
            <div>
              <SectionCard
                title="Roadmap Progress"
                description="Completion status of your active learning path"
                action={
                  <Link
                    href="/career-roadmap"
                    className="text-xs font-semibold text-[#635BFF] hover:underline"
                  >
                    Details
                  </Link>
                }
              >
                {summary?.activeRoadmap ? (
                  <div className="flex flex-col items-center justify-center py-2 text-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="9" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#635BFF"
                          strokeWidth="9"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - (summary.roadmapProgress.percentage / 100))}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-[#172033]">
                          {summary.roadmapProgress.percentage}%
                        </span>
                        <span className="text-[10px] text-[#64748B] font-semibold uppercase">
                          Complete
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 w-full text-left text-xs">
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span>Target Role</span>
                        <span className="font-semibold text-[#172033]">{summary.activeRoadmap.roleTitle}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span>Phases Completed</span>
                        <span className="font-semibold text-[#172033]">
                          {summary.roadmapProgress.completed} / {summary.roadmapProgress.total}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 w-full p-2.5 rounded-lg bg-[#635BFF]/5 border border-[#635BFF]/20 text-left">
                      <span className="text-[11px] font-semibold text-[#635BFF] block">
                        {summary.roadmapProgress.percentage >= 100
                          ? "Roadmap complete — congratulations!"
                          : summary.roadmapProgress.percentage >= 50
                            ? "Great progress — keep going!"
                            : "Getting started — focus on the first phases."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Compass}
                    title="No active roadmap"
                    description="Generate a personalized career roadmap to start tracking your learning progress."
                    action={{ label: "Explore Roadmaps", href: "/career-roadmap" }}
                  />
                )}
              </SectionCard>
            </div>

            {/* Recommended Actions */}
            <div className="lg:col-span-2">
              <SectionCard
                title="Recommended Actions"
                description="Priority tasks to improve your placement readiness"
                action={
                  summary && summary.recommendedActions.length > 0 ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {summary.recommendedActions.length} High Impact
                    </span>
                  ) : null
                }
              >
                {summary && summary.recommendedActions.length > 0 ? (
                  <div className="space-y-3">
                    {summary.recommendedActions.map((action) => (
                      <Link
                        key={action.id}
                        href={action.route}
                        className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#635BFF]/30 hover:bg-slate-50/50 transition-all flex items-start justify-between gap-3 group block"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] bg-[#635BFF]/10 px-1.5 py-0.2 rounded">
                              {action.category}
                            </span>
                            <span className="text-xs font-bold text-[#172033] group-hover:text-[#635BFF] transition-colors">
                              {action.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#635BFF] shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Award}
                    title="All caught up!"
                    description="You've completed the key setup steps. Continue refining your skills and roadmap."
                  />
                )}
              </SectionCard>
            </div>
          </div>

          {/* Quick Navigation Actions */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-[#172033] mb-3">Quick Navigation Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <Link
                href="/resume-analysis"
                className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#635BFF] hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-100 text-[#16A34A] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033] group-hover:text-[#635BFF]">
                      Resume ATS
                    </h4>
                    <p className="text-[10px] text-[#64748B]">Analyze score</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/career-roadmap"
                className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#635BFF] hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033] group-hover:text-[#635BFF]">
                      Roadmap
                    </h4>
                    <p className="text-[10px] text-[#64748B]">6 target roles</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/linkedin-analysis"
                className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#635BFF] hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0077B5] flex items-center justify-center shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033] group-hover:text-[#635BFF]">
                      LinkedIn
                    </h4>
                    <p className="text-[10px] text-[#64748B]">Headline tips</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/developer-progress"
                className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#635BFF] hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033] group-hover:text-[#635BFF]">
                      Coding Activity
                    </h4>
                    <p className="text-[10px] text-[#64748B]">GitHub & LeetCode</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/placement-readiness"
                className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#635BFF] hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#172033] group-hover:text-[#635BFF]">
                      Placement Index
                    </h4>
                    <p className="text-[10px] text-[#64748B]">5-pillar score</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
