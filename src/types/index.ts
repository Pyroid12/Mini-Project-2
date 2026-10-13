export interface StudentProfile {
  fullName: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  currentAcademicYear: string;
  graduationYear: string;
  careerGoal: string;
  technicalSkills: string[];
  githubUsername: string;
  linkedinUrl: string;
  leetcodeUsername: string;
  avatarUrl?: string;
  completionPercentage: number;
}

export interface RoadmapPhase {
  title: string;
  description: string;
  duration: string;
  skills: string[];
  projects: string[];
  practiceTasks?: string[];
  milestones: string[];
  resources?: string[];
  status: "completed" | "in-progress" | "upcoming";
}

export interface JobRoleRoadmap {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner Friendly" | "Intermediate" | "Advanced";
  estimatedTime: string;
  skills: string[];
  tags: string[];
  phases: RoadmapPhase[];
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  updated: string;
  url: string;
}

export interface GitHubData {
  username: string;
  reposCount: number;
  contributionsCount: number;
  starsCount: number;
  followersCount: number;
  languages: { name: string; percentage: number; color: string }[];
  recentRepos: GitHubRepo[];
}

export interface LeetCodeData {
  username: string;
  totalSolved: number;
  totalProblems: number;
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
  currentStreak: number;
  maxStreak: number;
  dailyGoal: { current: number; target: number };
  weeklyActivity: { day: string; problems: number; minutes: number }[];
}

export interface ResumeAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  suggestedKeywords: string[];
}

export interface PlacementReadinessData {
  overallScore: number;
  resumeScore: number;
  technicalScore: number;
  developerScore: number;
  roadmapScore: number;
  companyTiers: {
    tier: string;
    readiness: number;
    description: string;
    targetRoles: string;
    status: "Ready" | "On Track" | "Needs Practice";
  }[];
  recommendedActions: {
    id: string;
    title: string;
    description: string;
    category: "Resume" | "Coding" | "Profile" | "Roadmap";
    impact: "High" | "Medium" | "Low";
    completed: boolean;
    route: string;
  }[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  iconType: "resume" | "coding" | "roadmap" | "interview" | "profile";
}
