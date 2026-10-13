import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  Compass,
  FileText,
  GitBranch,
  Mic,
  Award,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col font-sans selection:bg-[#635BFF]/20 selection:text-[#635BFF]">
      {/* 1. Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#5348E8] transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#172033] tracking-tight">
                CareerBuddy <span className="text-[#635BFF] text-xs px-1.5 py-0.5 bg-[#635BFF]/10 rounded font-bold">AI</span>
              </span>
              <p className="text-[10px] text-[#64748B] font-medium leading-none">
                Placement Companion
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <a href="#features" className="hover:text-[#635BFF] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#635BFF] transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-[#635BFF] transition-colors">
              Benefits
            </a>
            <Link href="/dashboard" className="hover:text-[#635BFF] transition-colors">
              Dashboard
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-semibold text-[#64748B] hover:text-[#172033] px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#635BFF] text-white hover:bg-[#5348E8] transition-all shadow-xs hover:shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#635BFF]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your AI-Powered Career Companion</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
              Build Your Career. <br className="hidden sm:inline" />
              <span className="text-[#635BFF]">Become Placement Ready.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto">
              Empowering engineering students with structured career roadmaps, intelligent resume analysis, developer activity analytics, and personalized placement readiness tracking.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-[#635BFF] text-white hover:bg-[#5348E8] transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white text-[#172033] border border-[#E2E8F0] hover:bg-slate-50 transition-all shadow-2xs"
              >
                <span>Explore Features</span>
              </a>
            </div>
          </div>

          {/* Abstract Dashboard UI Preview */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-3 sm:p-5 transition-all">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs font-semibold text-[#64748B]">careerbuddy.ai/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Readiness Workspace</span>
                </div>
              </div>

              {/* Mock Dashboard Preview Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <div className="text-xs font-medium text-[#64748B]">Placement Readiness</div>
                  <div className="text-2xl font-bold text-[#172033] mt-1">72%</div>
                  <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2">
                    <div className="w-[72%] bg-[#635BFF] h-full rounded-full" />
                  </div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <div className="text-xs font-medium text-[#64748B]">ATS Resume Score</div>
                  <div className="text-2xl font-bold text-[#172033] mt-1">78 / 100</div>
                  <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2">
                    <div className="w-[78%] bg-[#16A34A] h-full rounded-full" />
                  </div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <div className="text-xs font-medium text-[#64748B]">GitHub Activity</div>
                  <div className="text-2xl font-bold text-[#172033] mt-1">24 Repos</div>
                  <div className="text-[11px] text-[#64748B] mt-2">482 public commits</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <div className="text-xs font-medium text-[#64748B]">LeetCode Solved</div>
                  <div className="text-2xl font-bold text-[#172033] mt-1">145 Problems</div>
                  <div className="text-[11px] text-[#16A34A] font-semibold mt-2">14-day streak</div>
                </div>
              </div>

              {/* Secondary Preview Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-[#172033]">Active Roadmap: Full-Stack Developer</div>
                    <span className="text-[10px] bg-green-100 text-[#16A34A] px-2 py-0.5 rounded-full font-bold">Phase 2: In Progress</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                      <span className="font-medium text-[#172033]">Phase 1: Modern Web Foundations</span>
                      <span className="text-[#16A34A] font-semibold">Completed ✓</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#635BFF]/30 flex items-center justify-between">
                      <span className="font-medium text-[#172033]">Phase 2: Front-End Architecture & State Management</span>
                      <span className="text-[#635BFF] font-semibold">60% Mastered</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#172033]">Next Priority Action</div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Improve resume project descriptions with quantitative performance metrics.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="mt-3 text-xs font-bold text-[#635BFF] flex items-center gap-1 hover:underline"
                  >
                    <span>Open Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Overview Section */}
      <section id="features" className="py-20 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">
              Comprehensive Toolkit
            </span>
            <h2 className="text-3xl font-extrabold text-[#172033] tracking-tight mt-2">
              Everything Needed for Placement Success
            </h2>
            <p className="text-sm text-[#64748B] mt-3">
              Engineered specifically for computer science and engineering undergraduates navigating campus recruiting and off-campus tech drives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-4 group-hover:bg-[#635BFF] group-hover:text-white transition-colors">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Structured Career Roadmaps</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Step-by-step technical roadmaps for Software Developers, Full-Stack Engineers, Data Scientists, and AI Specialists with practical milestones.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mb-4 group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">ATS Resume Evaluation</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Evaluate formatting, detect missing technical keywords, and receive actionable suggestions to pass applicant tracking filters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Developer Analytics</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Consolidate your GitHub repositories, programming language distribution, and LeetCode problem difficulty breakdowns in one spot.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">AI Mock Interview Integration</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Connect directly with interactive AI interview simulations covering DSA, System Design, Full-Stack architecture, and behavioral STAR rounds.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#F59E0B] flex items-center justify-center mb-4 group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Placement Readiness Scoring</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                A unified index benchmarking your profile across Tier-1 tech firms, unicorns, and high-growth venture-backed startups.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">Personalized Action Items</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Receive high-impact recommendations prioritized by placement urgency to maximize your campus placement conversion rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">
              Simple & Systematic
            </span>
            <h2 className="text-3xl font-extrabold text-[#172033] tracking-tight mt-2">
              How CareerBuddy AI Works
            </h2>
            <p className="text-sm text-[#64748B] mt-3">
              Follow a proven path from your university classroom to your dream technical offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-xl bg-[#635BFF] text-white font-bold text-xs flex items-center justify-center mb-4">
                  01
                </span>
                <h4 className="text-base font-bold text-[#172033]">Setup Student Profile</h4>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Enter your branch, target career role, university graduation year, and connect your GitHub & LeetCode usernames.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#635BFF]">
                Takes &lt; 2 minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-xl bg-[#635BFF] text-white font-bold text-xs flex items-center justify-center mb-4">
                  02
                </span>
                <h4 className="text-base font-bold text-[#172033]">Follow Role Roadmap</h4>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Select your targeted engineering specialization and follow vetted project milestones and skill checkpoints.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#635BFF]">
                Curated learning phases
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-xl bg-[#635BFF] text-white font-bold text-xs flex items-center justify-center mb-4">
                  03
                </span>
                <h4 className="text-base font-bold text-[#172033]">Audit & Refine</h4>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Upload your resume for structural ATS audits, identify missing competencies, and polish your LinkedIn profile.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#635BFF]">
                Continuous feedback
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-xl bg-[#16A34A] text-white font-bold text-xs flex items-center justify-center mb-4">
                  04
                </span>
                <h4 className="text-base font-bold text-[#172033]">Placement Ready</h4>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Track your readiness score, practice mock interviews, and apply with confidence to top-tier campus recruitment drives.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#16A34A]">
                Target offer secured
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Benefits for Engineering Students */}
      <section id="benefits" className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">
                Designed For Undergrads
              </span>
              <h2 className="text-3xl font-extrabold text-[#172033] tracking-tight mt-2">
                Why Engineering Students Choose CareerBuddy AI
              </h2>
              <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                Navigating placements can be overwhelming with disconnected advice. CareerBuddy AI unifies your preparation strategy into one cohesive dashboard.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "No More Guesswork",
                    desc: "Clear, sequential learning phases prevent tutorial hell and keep you focused on skills recruiters actually test.",
                  },
                  {
                    title: "ATS-Optimized Resumes",
                    desc: "Identify formatting errors and missing tech keywords before your resume is reviewed by corporate screeners.",
                  },
                  {
                    title: "Coding Consistency Tracking",
                    desc: "Monitor your LeetCode problem distribution and GitHub commits to build the daily practice habit needed for online tests.",
                  },
                  {
                    title: "Targeted Company Tier Benchmarks",
                    desc: "Know exactly where you stand against the preparation standards of Tier-1 product giants, unicorns, and high-growth startups.",
                  },
                ].map((b, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">{b.title}</h4>
                      <p className="text-xs text-[#64748B] mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#635BFF] text-white hover:bg-[#5348E8] transition-colors shadow-xs"
                >
                  <span>Start Free Preparation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Feature Metric Cards */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#172033]">Placement Readiness Modules</h4>
                <span className="text-xs font-semibold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-0.5 rounded-full">
                  All-in-One Platform
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B]">Technical Roles</div>
                  <div className="text-xl font-bold text-[#172033] mt-1">6 Roadmaps</div>
                  <div className="text-[11px] text-[#635BFF] mt-1">Full-Stack, AI, ML, Data</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B]">Resume Checks</div>
                  <div className="text-xl font-bold text-[#172033] mt-1">ATS Parser</div>
                  <div className="text-[11px] text-[#16A34A] mt-1">Keywords & Strengths</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B]">Platform Tracking</div>
                  <div className="text-xl font-bold text-[#172033] mt-1">GitHub + LC</div>
                  <div className="text-[11px] text-[#64748B] mt-1">Combined Insights</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B]">Interview Prep</div>
                  <div className="text-xl font-bold text-[#172033] mt-1">AI Mock</div>
                  <div className="text-[11px] text-purple-600 mt-1">External Engine Link</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#172033]">Ready to explore the dashboard?</div>
                  <p className="text-[11px] text-[#64748B]">Prepare for engineering campus placements with CareerBuddy AI.</p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 rounded-lg bg-[#635BFF] text-white text-xs font-semibold hover:bg-[#5348E8] shrink-0"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-white border-t border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-[#172033]">CareerBuddy AI</span>
                <p className="text-[11px] text-[#64748B]">Your AI-Powered Career Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#64748B]">
              <Link href="/dashboard" className="hover:text-[#635BFF] transition-colors">
                Dashboard
              </Link>
              <Link href="/career-roadmap" className="hover:text-[#635BFF] transition-colors">
                Roadmaps
              </Link>
              <Link href="/resume-analysis" className="hover:text-[#635BFF] transition-colors">
                Resume Analyzer
              </Link>
              <Link href="/developer-progress" className="hover:text-[#635BFF] transition-colors">
                Developer Analytics
              </Link>
              <Link href="/sign-in" className="hover:text-[#635BFF] transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
            <p>© 2025 CareerBuddy AI. Built for engineering students.</p>
            <div className="flex items-center gap-4">
              <span>Phase 1 Frontend Foundation</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
