"use client";

import React, { useState } from "react";
import {
  Mic,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  Cpu,
  Layers,
  Users,
  ShieldCheck,
  Radio,
  ArrowRight,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";

export default function MockInterviewPage() {
  const configuredUrl = process.env.NEXT_PUBLIC_MOCK_INTERVIEW_URL;
  const isUrlConfigured = Boolean(configuredUrl && configuredUrl.trim() !== "");
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  const practiceCategories = [
    {
      title: "Data Structures & Algorithms",
      icon: Code2,
      duration: "45 Mins",
      difficulty: "Medium / Hard",
      description: "Live problem solving, algorithmic complexity analysis, and edge case handling.",
      topics: ["Trees & Graphs", "Dynamic Programming", "Sliding Window", "Hash Tables"],
    },
    {
      title: "System Design & Architecture",
      icon: Cpu,
      duration: "45 Mins",
      difficulty: "Senior / Tier-1",
      description: "Distributed caching, database sharding, rate limiting, and microservice decoupling.",
      topics: ["API Design", "CAP Theorem", "Message Queues", "Load Balancing"],
    },
    {
      title: "Full-Stack Technical Round",
      icon: Layers,
      duration: "60 Mins",
      difficulty: "Intermediate",
      description: "React lifecycles, REST APIs, database transactions, and browser performance optimization.",
      topics: ["React SSR/CSR", "SQL Indexes", "OAuth & JWT", "WebSockets"],
    },
    {
      title: "Behavioral & STAR Method",
      icon: Users,
      duration: "30 Mins",
      difficulty: "All Levels",
      description: "Leadership principles, handling engineering conflicts, and impact storytelling.",
      topics: ["Conflict Resolution", "Project Ownership", "Failure Retrospectives", "Teamwork"],
    },
  ];

  const handleStartInterview = (categoryTitle?: string) => {
    if (isUrlConfigured) {
      window.open(configuredUrl, "_blank", "noopener,noreferrer");
    } else {
      setShowConfigNotice(true);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Mock Interview"
        description="Launch an interactive mock technical interview session to practice live problem solving and behavioral communication."
        badge="External Engine Integration"
      />

      {/* External Application Status Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#172033]">
                AI Mock Interview Engine Status
              </h3>
              {isUrlConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#16A34A] border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  Engine Linked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-[#F59E0B] border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Configuration Required
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {isUrlConfigured ? (
                <span>
                  Target Endpoint: <code className="text-xs text-[#635BFF] bg-slate-100 px-1.5 py-0.5 rounded font-mono">{configuredUrl}</code>
                </span>
              ) : (
                "Set NEXT_PUBLIC_MOCK_INTERVIEW_URL in your environment to launch your external interview application."
              )}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => handleStartInterview()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#635BFF] hover:bg-[#5348E8] text-white transition-all shadow-xs hover:shadow-md"
          >
            <span>Start Interview Session</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Helpful Warning if URL is not configured */}
      {showConfigNotice && !isUrlConfigured && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
            <span>Mock Interview Engine URL is Not Configured</span>
          </div>
          <p className="leading-relaxed">
            The variable <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">NEXT_PUBLIC_MOCK_INTERVIEW_URL</code> is currently unset in your environment.
            Please add this variable to your <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">.env.local</code> file pointing to your separate mock interview application.
          </p>
          <div className="pt-1">
            <button
              onClick={() => setShowConfigNotice(false)}
              className="text-xs font-semibold text-amber-800 underline hover:text-amber-950"
            >
              Dismiss Notice
            </button>
          </div>
        </div>
      )}

      {/* Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-3">
            <Radio className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#172033]">Realistic Simulation</h4>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Practice in a timed high-pressure environment mimicking FAANG and campus drive technical rounds.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-[#16A34A] flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#172033]">Instant Feedback</h4>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Get structured evaluation on code correctness, communication clarity, and problem decomposition.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#172033]">Tailored Question Sets</h4>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Questions adapt to your target career role, university batch, and prior experience levels.
          </p>
        </div>
      </div>

      {/* Practice Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Interview Practice Categories</h3>
            <p className="text-xs text-[#64748B]">Choose a specialized domain to practice today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {practiceCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#635BFF]/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#635BFF] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                        {cat.duration}
                      </span>
                      <span className="text-[10px] font-semibold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-full border border-[#635BFF]/20">
                        {cat.difficulty}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-[#172033]">{cat.title}</h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cat.topics.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-slate-50 border border-[#E2E8F0] text-[#172033] px-2 py-0.5 rounded-md font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">Includes live code sandbox</span>
                  <button
                    type="button"
                    onClick={() => handleStartInterview(cat.title)}
                    className="text-xs font-bold text-[#635BFF] hover:text-[#5348E8] flex items-center gap-1 group transition-colors"
                  >
                    <span>Launch Interview</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
