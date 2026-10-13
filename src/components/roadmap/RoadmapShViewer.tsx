"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  BookOpen,
  Search,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Code2,
  Check,
  Compass,
} from "lucide-react";
import type {
  PopularRoadmapTemplate,
  RoadmapNode,
  RoadmapSection,
} from "@/lib/roadmapData";

interface RoadmapShViewerProps {
  roadmap: PopularRoadmapTemplate;
  onBack: () => void;
}

export function RoadmapShViewer({ roadmap, onBack }: RoadmapShViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [nodeStatus, setNodeStatus] = useState<
    Record<string, "completed" | "in-progress" | "unstarted">
  >({});
  const [viewMode, setViewMode] = useState<"flowchart" | "compact">("flowchart");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Local storage persistence for user progress
  const storageKey = `careerbuddy_roadmap_progress_${roadmap.id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNodeStatus(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const updateStatus = (
    nodeId: string,
    status: "completed" | "in-progress" | "unstarted"
  ) => {
    const updated = { ...nodeStatus, [nodeId]: status };
    setNodeStatus(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Calculate overall metrics
  const allNodes = roadmap.sections.flatMap((s) => s.nodes);
  const totalNodesCount = allNodes.length;
  const completedNodesCount = allNodes.filter(
    (n) => nodeStatus[n.id] === "completed"
  ).length;
  const inProgressNodesCount = allNodes.filter(
    (n) => nodeStatus[n.id] === "in-progress"
  ).length;
  const progressPercentage = Math.round(
    (completedNodesCount / (totalNodesCount || 1)) * 100
  );

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Filtered sections based on search query
  const filteredSections = roadmap.sections.map((sec) => {
    if (!searchQuery.trim()) return sec;
    const query = searchQuery.toLowerCase();
    const matchedNodes = sec.nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.skills.some((sk) => sk.toLowerCase().includes(query))
    );
    return {
      ...sec,
      nodes: matchedNodes,
    };
  }).filter((sec) => sec.nodes.length > 0 || !searchQuery.trim());

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar (roadmap.sh style) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-xs font-semibold text-[#172033] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Roadmaps</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#635BFF]/10 text-[#635BFF]">
              roadmap.sh guide
            </span>
            <span className="text-xs text-[#64748B]">
              {roadmap.difficulty} • {roadmap.estimatedDuration}
            </span>
          </div>

          {/* View Toggles & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics in roadmap..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#172033] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
              />
            </div>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-[#E2E8F0] text-xs">
              <button
                onClick={() => setViewMode("flowchart")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === "flowchart"
                    ? "bg-white text-[#172033] shadow-2xs"
                    : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Flowchart
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  viewMode === "compact"
                    ? "bg-white text-[#172033] shadow-2xs"
                    : "text-[#64748B] hover:text-[#172033]"
                }`}
              >
                Checklist
              </button>
            </div>
          </div>
        </div>

        {/* Roadmap Title & Progress */}
        <div className="mt-5 pt-5 border-t border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2">
              <span>{roadmap.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">
                2026 Edition
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
              {roadmap.tagline}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] min-w-[260px]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#172033] mb-1.5">
              <span>Your Preparation Progress</span>
              <span className="text-[#635BFF] font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#635BFF] to-[#10B981] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5">
              <span>
                {completedNodesCount} of {totalNodesCount} completed
              </span>
              {inProgressNodesCount > 0 && (
                <span className="text-amber-600 font-medium">
                  {inProgressNodesCount} in progress
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#E2E8F0]/70 flex flex-wrap items-center gap-4 text-[11px] text-[#64748B]">
          <span className="font-semibold text-[#172033]">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Essential
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Recommended
          </span>
          <span className="text-slate-400">💡 Click any topic node for in-depth guides and links</span>
        </div>
      </div>

      {/* Main Roadmap Canvas / View */}
      {viewMode === "flowchart" ? (
        /* ROADMAP.SH VISUAL FLOWCHART VIEW */
        <div className="relative py-4">
          <div className="max-w-4xl mx-auto space-y-8 relative">
            {/* Center Timeline Connector Line */}
            <div className="absolute left-6 sm:left-1/2 top-4 bottom-8 w-1 -translate-x-1/2 bg-gradient-to-b from-[#635BFF] via-slate-300 to-slate-200 hidden sm:block" />

            {filteredSections.map((section, sIndex) => {
              const isCollapsed = collapsedSections[section.id];
              return (
                <div key={section.id} className="relative space-y-4">
                  {/* Stage Milestone Hub */}
                  <div className="flex items-center justify-center relative z-10">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="px-5 py-2.5 rounded-2xl bg-[#172033] text-white shadow-md hover:bg-slate-800 transition-all flex items-center gap-3 border-2 border-white ring-2 ring-slate-200 text-xs sm:text-sm font-bold tracking-wide"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#635BFF] flex items-center justify-center text-white text-xs">
                        {section.order}
                      </span>
                      <span>{section.title}</span>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Nodes Grid for this Stage */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-2">
                      {section.nodes.map((node) => {
                        const status = nodeStatus[node.id] || "unstarted";
                        const isDone = status === "completed";
                        const isInProg = status === "in-progress";

                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer bg-white hover:-translate-y-0.5 hover:shadow-md ${
                              isDone
                                ? "border-green-500 bg-green-50/20"
                                : isInProg
                                ? "border-amber-400 bg-amber-50/20"
                                : node.importance === "essential"
                                ? "border-purple-300 hover:border-[#635BFF]"
                                : "border-[#E2E8F0] hover:border-slate-400"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                                    isDone
                                      ? "bg-green-500 text-white"
                                      : isInProg
                                      ? "bg-amber-500 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {isDone ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : isInProg ? (
                                    <Clock className="w-3.5 h-3.5" />
                                  ) : (
                                    <Circle className="w-3 h-3" />
                                  )}
                                </span>
                                <h3 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#635BFF] transition-colors">
                                  {node.title}
                                </h3>
                              </div>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                                  node.importance === "essential"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {node.importance}
                              </span>
                            </div>

                            <p className="text-xs text-[#64748B] mt-2 line-clamp-2">
                              {node.description}
                            </p>

                            <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/80 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1">
                                {node.skills.slice(0, 3).map((sk) => (
                                  <span
                                    key={sk}
                                    className="text-[10px] bg-slate-100 text-[#172033] px-1.5 py-0.5 rounded font-medium"
                                  >
                                    {sk}
                                  </span>
                                ))}
                                {node.skills.length > 3 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{node.skills.length - 3}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus(
                                    node.id,
                                    isDone ? "unstarted" : "completed"
                                  );
                                }}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                                  isDone
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-[#635BFF] hover:text-white"
                                }`}
                              >
                                {isDone ? "Mark Unread" : "Mark Done"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Flow Arrow down */}
                  {sIndex < filteredSections.length - 1 && !isCollapsed && (
                    <div className="flex justify-center my-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        ↓
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* COMPACT CHECKLIST VIEW */
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs"
            >
              <h3 className="text-sm font-bold text-[#172033] mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#635BFF] text-white flex items-center justify-center text-xs">
                  {sec.order}
                </span>
                <span>{sec.title}</span>
              </h3>

              <div className="divide-y divide-[#E2E8F0]">
                {sec.nodes.map((node) => {
                  const status = nodeStatus[node.id] || "unstarted";
                  const isDone = status === "completed";

                  return (
                    <div
                      key={node.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(
                              node.id,
                              isDone ? "unstarted" : "completed"
                            );
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isDone
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-slate-300 hover:border-[#635BFF]"
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <h4
                            className={`text-xs font-semibold ${
                              isDone
                                ? "line-through text-slate-400"
                                : "text-[#172033]"
                            }`}
                          >
                            {node.title}
                          </h4>
                          <span className="text-[11px] text-[#64748B]">
                            {node.skills.join(" • ")}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          node.importance === "essential"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {node.importance}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROADMAP.SH TOPIC DETAILS SLIDE-OVER DRAWER / MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div>
                <span className="text-xs font-bold text-[#635BFF] uppercase tracking-wider">
                  Roadmap Topic Guide
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#172033] mt-0.5">
                  {selectedNode.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#172033] hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Switcher Buttons */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-[#E2E8F0] flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#172033]">
                Your Progress:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateStatus(selectedNode.id, "unstarted")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    (nodeStatus[selectedNode.id] || "unstarted") === "unstarted"
                      ? "bg-white text-[#172033] shadow-xs border border-slate-300"
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  To Learn
                </button>
                <button
                  onClick={() => updateStatus(selectedNode.id, "in-progress")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    nodeStatus[selectedNode.id] === "in-progress"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(selectedNode.id, "completed")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    nodeStatus[selectedNode.id] === "completed"
                      ? "bg-green-600 text-white shadow-xs"
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  Completed ✓
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                Overview & Why It Matters
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Key Skills Checklist */}
            <div>
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Core Concepts To Master
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedNode.skills.map((skill) => (
                  <div
                    key={skill}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2 text-xs text-[#172033] font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#635BFF] shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Project Task */}
            {selectedNode.projectIdea && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Hands-on Practice Task</span>
                </div>
                <p className="text-xs text-amber-900">
                  {selectedNode.projectIdea}
                </p>
              </div>
            )}

            {/* Learning Resources */}
            {selectedNode.resources && selectedNode.resources.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                  Curated Official Resources
                </h4>
                <div className="space-y-2">
                  {selectedNode.resources.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs hover:border-[#635BFF] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#635BFF]" />
                        <span className="font-semibold text-[#172033]">
                          {res.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {res.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-5 py-2 bg-[#635BFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5348E8] transition-colors shadow-xs"
              >
                Close & Return to Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
