"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, FolderGit2, Target, Sparkles, ChevronDown, ChevronUp, ExternalLink, ListChecks } from "lucide-react";
import { RoadmapPhase } from "@/types";
import { cn } from "@/lib/utils";

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
  roleTitle: string;
  interactive?: boolean;
  onPhaseStatusChange?: (phaseIndex: number, status: "upcoming" | "in-progress" | "completed") => void;
}

export function RoadmapTimeline({
  phases,
  roleTitle,
  interactive = false,
  onPhaseStatusChange,
}: RoadmapTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const cycleStatus = (current: string) => {
    if (current === "upcoming") return "in-progress";
    if (current === "in-progress") return "completed";
    return "upcoming";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-base font-bold text-[#172033]">
            Curriculum & Learning Milestones
          </h3>
          <p className="text-xs text-[#64748B]">
            Structured phases for {roleTitle} preparation
          </p>
        </div>
        <span className="text-xs font-semibold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-1 rounded-full border border-[#635BFF]/20">
          {phases.length} Structured Phases
        </span>
      </div>

      {interactive && (
        <p className="text-[11px] text-[#64748B] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" />
          Click the status badge on any phase to update your progress.
        </p>
      )}

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E8F0]">
        {phases.map((phase, index) => {
          const isExpanded = expandedIndex === index;
          const isCompleted = phase.status === "completed";
          const isInProgress = phase.status === "in-progress";

          return (
            <div key={index} className="relative group">
              <div
                className={cn(
                  "absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ring-4 ring-white z-10 transition-colors",
                  isCompleted
                    ? "bg-[#16A34A] text-white"
                    : isInProgress
                    ? "bg-[#635BFF] text-white shadow-xs"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isInProgress ? (
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </div>

              <div
                className={cn(
                  "bg-white rounded-xl border transition-all duration-200 overflow-hidden",
                  isInProgress
                    ? "border-[#635BFF]/40 shadow-xs"
                    : "border-[#E2E8F0] hover:border-slate-300"
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedIndex(isExpanded ? -1 : index);
                    }
                  }}
                  className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                        {phase.duration}
                      </span>
                      {interactive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPhaseStatusChange?.(index, cycleStatus(phase.status) as "upcoming" | "in-progress" | "completed");
                          }}
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors",
                            isCompleted
                              ? "bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20"
                              : isInProgress
                              ? "bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20"
                              : "bg-slate-100 text-[#64748B] hover:bg-slate-200"
                          )}
                        >
                          {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Upcoming"}
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            isCompleted
                              ? "bg-[#16A34A]/10 text-[#16A34A]"
                              : isInProgress
                              ? "bg-[#635BFF]/10 text-[#635BFF]"
                              : "bg-slate-100 text-[#64748B]"
                          )}
                        >
                          {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Upcoming"}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#172033]">
                      {phase.title}
                    </h4>
                    <p className="text-xs text-[#64748B] line-clamp-1">
                      {phase.description}
                    </p>
                  </div>
                  <div className="shrink-0 p-1 text-[#64748B]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-[#E2E8F0] bg-slate-50/30 space-y-4 text-xs">
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {phase.description}
                    </p>

                    <div>
                      <h5 className="font-semibold text-[#172033] mb-2 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#635BFF]" />
                        Key Competencies to Master:
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {phase.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-white border border-[#E2E8F0] text-[#172033] px-2.5 py-1 rounded-md text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {phase.projects.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-[#172033] mb-2 flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          Suggested Portfolio Projects:
                        </h5>
                        <ul className="space-y-1.5">
                          {phase.projects.map((proj, pIdx) => (
                            <li
                              key={pIdx}
                              className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-lg border border-[#E2E8F0]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                              <span className="font-medium">{proj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.practiceTasks && phase.practiceTasks.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-[#172033] mb-2 flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-[#635BFF]" />
                          Practice Tasks:
                        </h5>
                        <ul className="space-y-1.5">
                          {phase.practiceTasks.map((task, tIdx) => (
                            <li
                              key={tIdx}
                              className="flex items-start gap-2 text-slate-700 bg-white p-2 rounded-lg border border-[#E2E8F0]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] mt-1.5 shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.milestones.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-[#172033] mb-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                          Verification Milestones:
                        </h5>
                        <ul className="space-y-1">
                          {phase.milestones.map((ms, mIdx) => (
                            <li key={mIdx} className="flex items-center gap-2 text-[#64748B]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{ms}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.resources && phase.resources.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-[#172033] mb-2 flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-[#635BFF]" />
                          Suggested Resources:
                        </h5>
                        <ul className="space-y-1.5">
                          {phase.resources.map((res, rIdx) => (
                            <li
                              key={rIdx}
                              className="flex items-start gap-2 text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]"
                            >
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5",
                                  res.startsWith("[Official]")
                                    ? "bg-green-100 text-[#16A34A] border border-green-200"
                                    : "bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20"
                                )}
                              >
                                {res.startsWith("[Official]") ? "Official Resource" : "AI Recommendation"}
                              </span>
                              <div className="text-[11px] leading-relaxed break-words flex-1">
                                {(() => {
                                  const textOnly = res.replace(/^\[(Official|AI-generated|AI)\]\s*/i, "");
                                  const urlMatch = textOnly.match(/https?:\/\/[^\s)]+/);
                                  if (urlMatch) {
                                    const url = urlMatch[0];
                                    const before = textOnly.slice(0, urlMatch.index);
                                    const after = textOnly.slice((urlMatch.index ?? 0) + url.length);
                                    return (
                                      <>
                                        {before}
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#635BFF] hover:underline font-medium inline-flex items-center gap-1 mx-0.5"
                                        >
                                          <span>{url}</span>
                                          <ExternalLink className="w-3 h-3 inline" />
                                        </a>
                                        {after}
                                      </>
                                    );
                                  }
                                  return <span>{textOnly}</span>;
                                })()}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
