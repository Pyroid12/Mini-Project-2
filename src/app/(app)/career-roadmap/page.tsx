"use client";

import React, { useState } from "react";
import {
  Layout,
  Server,
  Layers,
  GitMerge,
  BrainCircuit,
  Database,
  Smartphone,
  ShieldAlert,
  Cloud,
  TrendingUp,
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
  Clock,
  Code2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { POPULAR_ROADMAPS, type PopularRoadmapTemplate } from "@/lib/roadmapData";
import { RoadmapShViewer } from "@/components/roadmap/RoadmapShViewer";

export default function CareerRoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] =
    useState<PopularRoadmapTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case "Layout":
        return Layout;
      case "Server":
        return Server;
      case "Layers":
        return Layers;
      case "GitMerge":
        return GitMerge;
      case "BrainCircuit":
        return BrainCircuit;
      case "Database":
        return Database;
      case "Smartphone":
        return Smartphone;
      case "ShieldAlert":
        return ShieldAlert;
      case "Cloud":
        return Cloud;
      case "TrendingUp":
        return TrendingUp;
      default:
        return Compass;
    }
  };

  // Filter 10 roadmaps by search query or category
  const filteredRoadmaps = POPULAR_ROADMAPS.filter((rm) => {
    const matchesSearch =
      rm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.popularTech.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (selectedCategory === "all") return true;
    if (selectedCategory === "web")
      return ["frontend", "backend", "full-stack"].includes(rm.id);
    if (selectedCategory === "ai-data")
      return ["ai-ml", "data-engineer", "data-scientist"].includes(rm.id);
    if (selectedCategory === "cloud-devops")
      return ["devops", "cloud"].includes(rm.id);
    if (selectedCategory === "mobile-sec")
      return ["android", "cybersecurity"].includes(rm.id);
    return true;
  });

  // If a template is selected, render the roadmap.sh visual interactive view
  if (selectedRoadmap) {
    return (
      <RoadmapShViewer
        roadmap={selectedRoadmap}
        onBack={() => setSelectedRoadmap(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Curated • roadmap.sh Templates</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
            Developer Career Roadmaps
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Choose a role below to view its complete step-by-step visual flowchart,
            essential technologies, learning resources, and progress tracking
            inspired by <span className="font-semibold text-[#172033]">roadmap.sh</span>.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-6 pt-6 border-t border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "All 10 Roles" },
              { id: "web", label: "Web Development" },
              { id: "ai-data", label: "AI & Data" },
              { id: "cloud-devops", label: "Cloud & DevOps" },
              { id: "mobile-sec", label: "Mobile & Security" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#635BFF] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or tech (React, Python...)"
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172033] placeholder:text-[#64748B] focus:outline-hidden focus:ring-2 focus:ring-[#635BFF]/20"
            />
          </div>
        </div>
      </div>

      {/* 10 Popular Roadmap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoadmaps.map((item, index) => {
          const Icon = getRoleIcon(item.iconName);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedRoadmap(item)}
              className="group bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md hover:border-[#635BFF]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: item.primaryColor }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#172033]">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-300">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-base font-bold text-[#172033] group-hover:text-[#635BFF] transition-colors flex items-center gap-2">
                  <span>{item.title}</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                  {item.tagline}
                </p>

                {/* Tech Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.popularTech.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] px-2 py-0.5 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.popularTech.length > 4 && (
                    <span className="text-[10px] text-slate-400 font-semibold py-0.5">
                      +{item.popularTech.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Metadata & CTA */}
              <div className="mt-5 pt-4 border-t border-[#E2E8F0]/80 flex items-center justify-between">
                <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.estimatedDuration}</span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#635BFF] group-hover:translate-x-0.5 transition-transform">
                  <span>View Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
