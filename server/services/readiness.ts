// ============================================================
// CareerBuddy AI - Placement Readiness Engine (Phase 4)
// Transparent mathematical weights & adaptive normalization
// ============================================================

import type { StoredResumeAnalysis, StoredRoadmap, StoredGitHubAnalysis, StoredLeetCodeProgress } from "../lib/store";

export interface ReadinessInput {
  resume: StoredResumeAnalysis | null;
  profileSkills: string[];
  roadmap: StoredRoadmap | null;
  leetcode: StoredLeetCodeProgress | null;
  github: StoredGitHubAnalysis | null;
}

export interface FactorDetail {
  name: string;
  weight: number;
  score: number;
  status: "Connected" | "Pending Data";
  explanation: string;
  recommendation: string;
}

export interface CompanyTierFit {
  tier: string;
  readiness: number;
  description: string;
  targetRoles: string;
  status: "Ready" | "On Track" | "Needs Practice";
}

export interface PlacementReadinessOutput {
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
}

export function calculatePlacementReadiness(data: ReadinessInput): PlacementReadinessOutput {
  const { resume, profileSkills, roadmap, leetcode, github } = data;

  // 1. Resume Quality Pillar (Weight: 25%)
  let resumeScore = 0;
  let hasResume = false;
  let resumeExplanation = "No resume uploaded yet. Upload your PDF/DOCX to benchmark ATS readability.";
  if (resume) {
    hasResume = true;
    resumeScore = Math.max(0, Math.min(100, resume.atsScore));
    resumeExplanation = `ATS score: ${resumeScore}/100. Evaluated for section structure, keyword density, and technical achievements.`;
  }

  // 2. Technical Skills Pillar (Weight: 20%)
  let skillsScore = 0;
  let hasSkills = false;
  let skillsExplanation = "No technical skills listed in profile.";
  const combinedSkills = new Set<string>();
  profileSkills.forEach((s) => combinedSkills.add(s.toLowerCase()));
  if (github?.inferredSkills) {
    github.inferredSkills.forEach((s) => combinedSkills.add(s.toLowerCase()));
  }

  if (combinedSkills.size > 0) {
    hasSkills = true;
    // Benchmark: 8+ relevant technical skills yields ~85-95 score
    const skillCount = combinedSkills.size;
    skillsScore = Math.min(100, Math.round(40 + Math.min(skillCount, 12) * 5));
    skillsExplanation = `${skillCount} technical skills verified across profile and repositories.`;
  }

  // 3. Career Roadmap Pillar (Weight: 20%)
  let roadmapScore = 0;
  let hasRoadmap = false;
  let roadmapExplanation = "No active career roadmap selected.";
  if (roadmap && roadmap.phases && roadmap.phases.length > 0) {
    hasRoadmap = true;
    const completedPhases = roadmap.phases.filter((p) => p.status === "completed").length;
    const inProgressPhases = roadmap.phases.filter((p) => p.status === "in-progress").length;
    const totalPhases = roadmap.phases.length;

    // Completed gives full phase weight, in-progress gives 50%
    const progressRatio = (completedPhases + inProgressPhases * 0.5) / totalPhases;
    roadmapScore = Math.min(100, Math.round(50 + progressRatio * 50));
    roadmapExplanation = `${completedPhases}/${totalPhases} phases completed for ${roadmap.roleTitle} roadmap.`;
  }

  // 4. DSA / LeetCode Coding Pillar (Weight: 20%)
  let codingScore = 0;
  let hasCoding = false;
  let codingExplanation = "No coding practice data recorded yet.";
  if (leetcode && (leetcode.totalSolved > 0 || leetcode.streak > 0)) {
    hasCoding = true;
    // Benchmark: 150+ problems with 60+ Mediums is target
    const solved = leetcode.totalSolved;
    const mediums = leetcode.mediumSolved;
    const streakBonus = Math.min(10, leetcode.streak * 2);

    let base = Math.min(75, Math.round((solved / 150) * 75));
    let mediumBonus = Math.min(15, Math.round((mediums / 50) * 15));
    codingScore = Math.min(100, base + mediumBonus + streakBonus);
    codingExplanation = `${solved} problems solved (${mediums} Mediums) with ${leetcode.streak}-day streak.`;
  }

  // 5. GitHub & Project Activity Pillar (Weight: 15%)
  let githubScore = 0;
  let hasGithub = false;
  let githubExplanation = "No GitHub account connected yet.";
  if (github && github.publicRepos > 0) {
    hasGithub = true;
    const repoBonus = Math.min(40, github.publicRepos * 4);
    const starBonus = Math.min(25, github.totalStars * 3);
    const langBonus = Math.min(25, github.languages.length * 6);
    githubScore = Math.min(100, Math.max(30, 20 + repoBonus + starBonus + langBonus));
    githubExplanation = `${github.publicRepos} public repos, ${github.totalStars} stars, and ${github.languages.length} programming languages verified.`;
  }

  // Factor definitions with documented base weights
  const factors: FactorDetail[] = [
    {
      name: "Resume Quality (ATS)",
      weight: 25,
      score: resumeScore,
      status: hasResume ? "Connected" : "Pending Data",
      explanation: resumeExplanation,
      recommendation: hasResume
        ? resumeScore < 75
          ? "Incorporate Google X-Y-Z quantifiable metrics to raise ATS score"
          : "Resume format meets high campus recruiting standards"
        : "Upload your resume to calibrate ATS scoring",
    },
    {
      name: "Relevant Technical Skills",
      weight: 20,
      score: skillsScore,
      status: hasSkills ? "Connected" : "Pending Data",
      explanation: skillsExplanation,
      recommendation: hasSkills
        ? "Ensure high-demand cloud and containerization skills (Docker, AWS) are included"
        : "List technical skills in your student profile",
    },
    {
      name: "Career Roadmap Progress",
      weight: 20,
      score: roadmapScore,
      status: hasRoadmap ? "Connected" : "Pending Data",
      explanation: roadmapExplanation,
      recommendation: hasRoadmap
        ? "Continue completing project milestones in your active roadmap"
        : "Generate a career roadmap for your target job role",
    },
    {
      name: "DSA & Problem Solving",
      weight: 20,
      score: codingScore,
      status: hasCoding ? "Connected" : "Pending Data",
      explanation: codingExplanation,
      recommendation: hasCoding
        ? leetcode && leetcode.mediumSolved < 50
          ? "Aim for 50+ Medium difficulty problems to qualify for Tier 1 screening"
          : "Maintain regular daily coding streaks"
        : "Sync or record your LeetCode problem solving metrics",
    },
    {
      name: "Project & GitHub Activity",
      weight: 15,
      score: githubScore,
      status: hasGithub ? "Connected" : "Pending Data",
      explanation: githubExplanation,
      recommendation: hasGithub
        ? "Add descriptive READMEs and deployment links to your featured projects"
        : "Analyze your GitHub profile to showcase open source work",
    },
  ];

  // ADAPTIVE NORMALIZATION (Per Requirement: "Do not calculate missing data as if it were zero performance")
  const activeFactors = factors.filter((f) => f.status === "Connected");
  let overallScore = 0;

  if (activeFactors.length === 0) {
    // If no data has been connected at all yet, provide an initial baseline of 50 with Preliminary confidence
    overallScore = 50;
  } else {
    const totalActiveWeight = activeFactors.reduce((sum, f) => sum + f.weight, 0);
    const weightedSum = activeFactors.reduce((sum, f) => sum + f.score * f.weight, 0);
    overallScore = Math.round(weightedSum / totalActiveWeight);
  }

  // Assessment Confidence
  const connectedPillars = activeFactors.length;
  let assessmentConfidence: "High" | "Medium" | "Preliminary" = "Preliminary";
  if (connectedPillars >= 4) {
    assessmentConfidence = "High";
  } else if (connectedPillars >= 2) {
    assessmentConfidence = "Medium";
  }

  // Company Tier Fits
  const companyTiers: CompanyTierFit[] = [
    {
      tier: "Tier 1 Product Companies (FAANG / Big Tech)",
      readiness: Math.max(30, Math.min(95, Math.round(overallScore * 0.9))),
      description: "Requires advanced Graph/Tree DSA mastery, strong ATS resume, and clean architectural design.",
      targetRoles: "Software Development Engineer, Systems Engineer",
      status: overallScore >= 82 ? "Ready" : overallScore >= 65 ? "On Track" : "Needs Practice",
    },
    {
      tier: "Tier 2 Mid-Size & Tech Unicorns",
      readiness: Math.max(35, Math.min(98, Math.round(overallScore * 1.05))),
      description: "Great fit for balanced full-stack engineering, API design, and solid problem-solving fundamentals.",
      targetRoles: "Full-Stack Engineer, Backend Engineer",
      status: overallScore >= 75 ? "Ready" : overallScore >= 55 ? "On Track" : "Needs Practice",
    },
    {
      tier: "High-Growth Tech & AI Startups",
      readiness: Math.max(40, Math.min(99, Math.round(overallScore * 1.12))),
      description: "Prioritizes practical project shipping speed, GitHub portfolio, and modern framework proficiency.",
      targetRoles: "Product Engineer, Founding Engineer",
      status: overallScore >= 70 ? "Ready" : "On Track",
    },
  ];

  // Recommended Next Actions
  const recommendedActions: {
    id: string;
    title: string;
    description: string;
    category: string;
    impact: "High" | "Medium";
    route: string;
  }[] = [];

  if (!hasResume || resumeScore < 75) {
    recommendedActions.push({
      id: "act-resume",
      title: hasResume ? "Boost Resume ATS Score" : "Upload & Analyze Resume",
      description: hasResume
        ? `Your resume scored ${resumeScore}/100. Review missing skills and keyword tips to increase ranking.`
        : "Upload your resume in PDF/DOCX format to calibrate your index.",
      category: "Resume",
      impact: "High",
      route: "/resume-analysis",
    });
  }

  if (!hasCoding || (leetcode && leetcode.mediumSolved < 40)) {
    recommendedActions.push({
      id: "act-leetcode",
      title: "Level Up LeetCode Medium Problems",
      description: "Campus interview filters heavily favor candidates with 40+ Medium solved questions.",
      category: "Coding",
      impact: "High",
      route: "/developer-progress",
    });
  }

  if (!hasGithub) {
    recommendedActions.push({
      id: "act-github",
      title: "Connect & Analyze GitHub Profile",
      description: "Showcase your open source projects, languages, and commit frequency.",
      category: "Portfolio",
      impact: "Medium",
      route: "/developer-progress",
    });
  }

  if (!hasRoadmap) {
    recommendedActions.push({
      id: "act-roadmap",
      title: "Activate a Career Roadmap",
      description: "Pick your target engineering role to unlock milestone progress tracking.",
      category: "Roadmap",
      impact: "Medium",
      route: "/career-roadmap",
    });
  }

  return {
    overallScore,
    resumeScore,
    skillsScore,
    roadmapScore,
    codingScore,
    githubScore,
    assessmentConfidence,
    factors,
    breakdown: {
      connectedPillars,
      totalPillars: 5,
      weightFormula:
        "Adaptive proportional weighting: each connected pillar is evaluated based on documented weights (Resume: 25%, Skills: 20%, Roadmap: 20%, DSA: 20%, GitHub: 15%) without penalizing missing inputs as zeroes.",
    },
    companyTiers,
    recommendedActions,
  };
}
