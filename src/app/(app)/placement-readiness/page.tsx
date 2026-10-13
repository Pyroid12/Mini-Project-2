"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  FileText,
  Code2,
  GitBranch,
  Compass,
  ArrowRight,
  Target,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Loader2,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { aiFetch } from "@/lib/ai-client";
import { mockPlacementReadiness } from "@/lib/mockData";

interface FactorDetail {
  name: string;
  weight: number;
  score: number;
  status: "Connected" | "Pending Data";
  explanation: string;
  recommendation: string;
}

interface CompanyTierFit {
  tier: string;
  readiness: number;
  description: string;
  targetRoles: string;
  status: "Ready" | "On Track" | "Needs Practice";
}

interface PlacementReadinessResponse {
  readiness: {
    overallScore: number;
    resumeScore: number;
    skillsScore: number;
    roadmapScore: number;
    codingScore: number;
    githubScore: number;
    assessmentConfidence: "High" | "Medium" | "Preliminary";
    factors: FactorDetail[];
    breakdown: {
      connectedPillars: number;
      totalPillars: number;
      weightFormula: string;
    };
    companyTiers: CompanyTierFit[];
    recommendedActions: {
      id: string;
      title: string;
      description: string;
      category: string;
      impact: "High" | "Medium";
      route: string;
    }[];
  };
}

interface CareerInsightsResponse {
  insights: {
    missingSkills: string[];
    roadmapInsights: string[];
    projectAdvice: string[];
    codingPracticeAreas: string[];
    overallActionPlan: string[];
    guidanceDisclaimer: string;
  } | null;
}

export default function PlacementReadinessPage() {
  const [readinessData, setReadinessData] = useState<PlacementReadinessResponse["readiness"] | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(true);
  const [readinessError, setReadinessError] = useState<string | null>(null);

  // Career Insights State
  const [careerInsights, setCareerInsights] = useState<CareerInsightsResponse["insights"] | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Load readiness data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await aiFetch<PlacementReadinessResponse>("/api/placement-readiness");
        if (!cancelled && res.readiness) {
          setReadinessData(res.readiness);
        }
      } catch (err: any) {
        if (!cancelled) {
          setReadinessError(err?.message || "Failed to load placement readiness index.");
        }
      } finally {
        if (!cancelled) setLoadingReadiness(false);
      }

      // Load latest career insights
      try {
        const insRes = await aiFetch<CareerInsightsResponse>("/api/career-insights/latest");
        if (!cancelled && insRes.insights) {
          setCareerInsights(insRes.insights);
        }
      } catch {
        // Fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Generate / Refresh AI Career Insights
  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    try {
      const res = await aiFetch<{ insights: CareerInsightsResponse["insights"] }>(
        "/api/career-insights/generate",
        { method: "POST" }
      );
      if (res.insights) {
        setCareerInsights(res.insights);
      }
    } catch (err: any) {
      setInsightsError(err?.message || "Failed to generate AI career insights.");
    } finally {
      setLoadingInsights(false);
    }
  };

  // Fallback values if API is loading or initial setup
  const readiness = readinessData || {
    overallScore: mockPlacementReadiness.overallScore,
    resumeScore: mockPlacementReadiness.resumeScore,
    skillsScore: 78,
    roadmapScore: mockPlacementReadiness.roadmapScore,
    codingScore: mockPlacementReadiness.technicalScore,
    githubScore: mockPlacementReadiness.developerScore,
    assessmentConfidence: "Medium" as const,
    factors: [
      {
        name: "Resume Quality (ATS)",
        weight: 25,
        score: mockPlacementReadiness.resumeScore,
        status: "Connected" as const,
        explanation: "Evaluated using ATS parsing guidelines and quantifiable impact metrics.",
        recommendation: "Ensure key technical achievements highlight measurable metrics.",
      },
      {
        name: "Relevant Technical Skills",
        weight: 20,
        score: 78,
        status: "Connected" as const,
        explanation: "10 technical skills verified across profile and repositories.",
        recommendation: "Add containerization and cloud infrastructure competencies.",
      },
      {
        name: "Career Roadmap Progress",
        weight: 20,
        score: mockPlacementReadiness.roadmapScore,
        status: "Connected" as const,
        explanation: "Phase 2 in progress for Software Engineering learning path.",
        recommendation: "Complete active milestones to boost roadmap score.",
      },
      {
        name: "DSA & Problem Solving",
        weight: 20,
        score: mockPlacementReadiness.technicalScore,
        status: "Connected" as const,
        explanation: "145 problems solved with continuous practice streak.",
        recommendation: "Reach 60+ Medium problems to pass product company rounds.",
      },
      {
        name: "Project & GitHub Activity",
        weight: 15,
        score: mockPlacementReadiness.developerScore,
        status: "Connected" as const,
        explanation: "Active repository history with verified languages and stars.",
        recommendation: "Pin flagship repositories with live deployment links.",
      },
    ],
    breakdown: {
      connectedPillars: 5,
      totalPillars: 5,
      weightFormula:
        "Adaptive proportional weighting: each connected pillar is evaluated based on documented weights (Resume: 25%, Skills: 20%, Roadmap: 20%, DSA: 20%, GitHub: 15%) without penalizing missing inputs as zeroes.",
    },
    companyTiers: mockPlacementReadiness.companyTiers.map((t) => ({
      ...t,
      status: (t.status === "On Track" ? "On Track" : "Ready") as "Ready" | "On Track" | "Needs Practice",
    })),
    recommendedActions: mockPlacementReadiness.recommendedActions.map((a) => ({
      ...a,
      impact: (a.impact === "High" ? "High" : "Medium") as "High" | "Medium",
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Readiness Index"
        description="Comprehensive evaluation benchmarking your technical skills, resume strength, and developer portfolio against recruiting standards."
      />

      {/* Transparent Weighting Disclosure Banner */}
      <div className="bg-[#EEF0FF] border border-[#635BFF]/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#635BFF] shrink-0 mt-0.5" />
        <div className="text-xs text-[#172033] leading-relaxed">
          <p className="font-semibold text-[#635BFF]">
            Transparent Scoring Formula & Adaptive Normalization
          </p>
          <p className="text-[#64748B] mt-0.5">
            Your readiness score is evaluated across 5 documented pillars:{" "}
            <span className="font-semibold text-[#172033]">
              Resume (25%), Skills (20%), Roadmap (20%), DSA (20%), and GitHub (15%)
            </span>
            . To ensure fair evaluation, unlinked modules are dynamically scaled among your
            connected pillars so missing data is never penalized as zero performance.
          </p>
        </div>
      </div>

      {loadingReadiness ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-[#635BFF] animate-spin" />
          <p className="text-sm text-[#64748B]">Calculating live placement readiness…</p>
        </div>
      ) : readinessError ? (
        <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
          <p className="text-sm font-semibold text-[#DC2626]">Could not load live readiness data</p>
          <p className="text-xs text-[#64748B] mt-1">{readinessError}</p>
        </div>
      ) : (
        <>
          {/* Hero Readiness Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Circular Ring Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#635BFF"
                    strokeWidth="8"
                    strokeDasharray="263.9"
                    strokeDashoffset={263.9 * (1 - readiness.overallScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#172033]">
                    {readiness.overallScore}%
                  </span>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase">Ready</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#16A34A] border border-green-200">
                    {readiness.overallScore >= 75
                      ? "Placement Qualified"
                      : readiness.overallScore >= 60
                      ? "On Track"
                      : "Developing"}
                  </span>
                  <span className="text-xs text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                    Confidence: {readiness.assessmentConfidence}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#172033] mt-1.5">
                  Overall Campus Placement Readiness
                </h3>
                <p className="text-xs text-[#64748B] max-w-xl mt-1 leading-relaxed">
                  Synthesized across {readiness.breakdown.connectedPillars} of{" "}
                  {readiness.breakdown.totalPillars} available data sources. Completing roadmap
                  phases and increasing LeetCode Medium problem practice will qualify you for top-bracket
                  Tier 1 product engineering roles.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex md:flex-col gap-2 w-full md:w-auto">
              <Link
                href="/resume-analysis"
                className="px-4 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-bold transition-all shadow-xs text-center flex-1 md:flex-initial"
              >
                Review Resume ATS
              </Link>
              <Link
                href="/developer-progress"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] border border-[#E2E8F0] text-xs font-semibold transition-all text-center flex-1 md:flex-initial"
              >
                Coding Analytics
              </Link>
            </div>
          </div>

          {/* 5 Pillar Breakdown Cards */}
          <div>
            <h3 className="text-sm font-bold text-[#172033] mb-3">
              5 Documented Evaluation Pillars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {readiness.factors.map((factor, idx) => {
                const getIcon = () => {
                  if (factor.name.includes("Resume")) return FileText;
                  if (factor.name.includes("Skills")) return Code2;
                  if (factor.name.includes("Roadmap")) return Compass;
                  if (factor.name.includes("DSA")) return Target;
                  return GitBranch;
                };
                const Icon = getIcon();
                const isConnected = factor.status === "Connected";

                return (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[#172033] flex items-center gap-1.5 truncate">
                          <Icon className="w-3.5 h-3.5 text-[#635BFF] shrink-0" />
                          <span className="truncate">{factor.name}</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#64748B] bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                          {factor.weight}%
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-2 mb-1.5">
                        <span className="text-xl font-black text-[#172033]">
                          {isConnected ? `${factor.score}%` : "—"}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            isConnected
                              ? "bg-green-50 text-[#16A34A] border border-green-200"
                              : "bg-amber-50 text-[#F59E0B] border border-amber-200"
                          }`}
                        >
                          {factor.status}
                        </span>
                      </div>

                      <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#635BFF] h-full rounded-full transition-all"
                          style={{ width: `${isConnected ? factor.score : 0}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#64748B] line-clamp-3 leading-relaxed border-t border-[#E2E8F0] pt-2">
                      {factor.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Career Insights Section (Gemini Synthesized) */}
          <SectionCard
            title="AI Career Insights"
            description="Personalized recommendations synthesized across your profile, resume, GitHub, and LeetCode activity"
            action={
              <button
                onClick={handleGenerateInsights}
                disabled={loadingInsights}
                className="px-3.5 py-1.5 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loadingInsights ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{careerInsights ? "Refresh Insights" : "Generate Insights"}</span>
              </button>
            }
          >
            {insightsError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded-xl mb-4">
                {insightsError}
              </div>
            )}

            {careerInsights ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Missing Technical Skills */}
                  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-red-500" />
                      <span>Missing Technical Skills</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {careerInsights.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Coding Practice Focus */}
                  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#635BFF]" />
                      <span>Coding Practice Priority Areas</span>
                    </h4>
                    <ul className="space-y-1 text-xs text-[#64748B]">
                      {careerInsights.codingPracticeAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#635BFF] font-bold">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Project Presentation Advice */}
                  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                      <span>Project & Portfolio Presentation</span>
                    </h4>
                    <ul className="space-y-1 text-xs text-[#64748B]">
                      {careerInsights.projectAdvice.map((adv, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Roadmap Milestones */}
                  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Incomplete Roadmap Milestones</span>
                    </h4>
                    <ul className="space-y-1 text-xs text-[#64748B]">
                      {careerInsights.roadmapInsights.map((rm, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#F59E0B] font-bold">•</span>
                          <span>{rm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Overall Action Plan */}
                <div className="p-4 rounded-xl border border-[#635BFF]/30 bg-[#635BFF]/5 space-y-2">
                  <h4 className="text-xs font-bold text-[#635BFF] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Priority Action Steps</span>
                  </h4>
                  <ol className="space-y-1.5 text-xs text-[#172033]">
                    {careerInsights.overallActionPlan.map((plan, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-[#635BFF]">{i + 1}.</span>
                        <span>{plan}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Guidance Disclaimer */}
                <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-[#64748B] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{careerInsights.guidanceDisclaimer}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-[#E2E8F0] space-y-3">
                <Sparkles className="w-8 h-8 text-[#635BFF] mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-[#172033]">No AI insights generated yet</h4>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                    Click &quot;Generate Insights&quot; to synthesize your resume ATS score, roadmap
                    progress, GitHub repositories, and LeetCode problem solving into personalized
                    recommendations.
                  </p>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  disabled={loadingInsights}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {loadingInsights && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Career Insights</span>
                </button>
              </div>
            )}
          </SectionCard>

          {/* Company Tier Benchmarks */}
          <SectionCard
            title="Company Tier Benchmarks"
            description="Target qualification thresholds by corporate hiring segment"
          >
            <div className="space-y-4">
              {readiness.companyTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E2E8F0] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[#172033]">{tier.tier}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tier.status === "Ready"
                            ? "bg-green-100 text-[#16A34A]"
                            : tier.status === "On Track"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {tier.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B]">{tier.description}</p>
                    <div className="text-[11px] text-[#635BFF] font-medium pt-0.5">
                      Target Roles: {tier.targetRoles}
                    </div>
                  </div>

                  <div className="w-full md:w-52 shrink-0 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Fit Rating</span>
                      <span className="font-bold text-[#172033]">{tier.readiness}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          tier.readiness >= 80 ? "bg-[#16A34A]" : "bg-[#635BFF]"
                        }`}
                        style={{ width: `${tier.readiness}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Recommended Next Actions */}
          <SectionCard
            title="Recommended Next Steps"
            description="Priority interventions calculated to increase your placement score"
          >
            <div className="space-y-3">
              {readiness.recommendedActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#635BFF]/30 transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0 mt-0.5">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#172033]">{action.title}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            action.impact === "High"
                              ? "bg-red-50 text-[#DC2626] border border-red-200"
                              : "bg-amber-50 text-[#F59E0B] border border-amber-200"
                          }`}
                        >
                          {action.impact} Impact
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={action.route}
                    className="shrink-0 text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1 mt-1"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
