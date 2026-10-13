export interface StoredResumeAnalysis {
  id: string;
  clerkUserId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  suggestedKeywords: string[];
  experienceTips: string[];
  projectTips: string[];
  targetRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredRoadmapPhase {
  id: string;
  phaseIndex: number;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  projects: string[];
  practiceTasks: string[];
  milestones: string[];
  resources: string[];
  status: string;
}

export interface StoredRoadmap {
  id: string;
  clerkUserId: string;
  roleTitle: string;
  roleId: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  isActive: boolean;
  phases: StoredRoadmapPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredLinkedInAnalysis {
  id: string;
  clerkUserId: string;
  headline: string;
  about: string;
  skills: string[];
  experience: string;
  projects: string;
  profileUrl: string | null;
  suggestedHeadline: string;
  suggestedAbout: string;
  suggestedExperience: string;
  suggestedProjects: string;
  aboutRecommendations: string[];
  skillGapRecommendations: string[];
  experienceTips: string[];
  projectTips: string[];
  actionRecommendations: string[];
  profileMatchScore: number;
  fullAnalysis?: any;
  createdAt: string;
  updatedAt: string;
}

export interface StoredGitHubAnalysis {
  id: string;
  clerkUserId: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  languages: { name: string; percentage: number; color: string; count?: number }[];
  topRepos: {
    name: string;
    description: string | null;
    language: string | null;
    languageColor: string;
    stars: number;
    forks: number;
    updated: string;
    url: string;
    isFork: boolean;
  }[];
  inferredSkills: string[];
  qualitySuggestions: string[];
  recommendedSteps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredLeetCodeProblemEntry {
  id: string;
  title: string;
  problemUrlOrId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  completedAt: string; // YYYY-MM-DD
  topic?: string;
  notes?: string;
  createdAt: string;
}

export interface StoredLeetCodeRecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface StoredLeetCodeProgress {
  id: string;
  clerkUserId: string;
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  reputation?: number | null;
  avatarUrl?: string | null;
  realName?: string | null;
  acceptanceRate?: string | null;
  totalSubmissions?: number | null;
  streak: number;
  isStreakVerified?: boolean;
  dailyGoalTarget: number;
  dailyGoalCurrent: number;
  weeklyGoalTarget: number;
  weeklyGoalCurrent: number;
  weeklyHistory: { day: string; date: string; solved: number }[];
  problemEntries?: StoredLeetCodeProblemEntry[];
  recentSubmissions?: StoredLeetCodeRecentSubmission[];
  source: "synced" | "manual";
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredPlacementReadiness {
  id: string;
  clerkUserId: string;
  overallScore: number;
  resumeScore: number;
  skillsScore: number;
  roadmapScore: number;
  codingScore: number;
  githubScore: number;
  assessmentConfidence: string;
  breakdown: Record<string, unknown>;
  factors: Record<string, unknown>;
  companyTiers: Record<string, unknown>[];
  recommendedActions: Record<string, unknown>[];
  createdAt: string;
}

export interface StoredCareerInsight {
  id: string;
  clerkUserId: string;
  missingSkills: string[];
  roadmapInsights: string[];
  projectAdvice: string[];
  codingPracticeAreas: string[];
  overallActionPlan: string[];
  guidanceDisclaimer: string;
  createdAt: string;
}

class InMemoryStore {
  private resumeAnalyses = new Map<string, StoredResumeAnalysis>();
  private roadmaps = new Map<string, StoredRoadmap>();
  private linkedinAnalyses = new Map<string, StoredLinkedInAnalysis>();
  private githubAnalyses = new Map<string, StoredGitHubAnalysis>();
  private leetcodeProgress = new Map<string, StoredLeetCodeProgress>();
  private placementReadiness = new Map<string, StoredPlacementReadiness>();
  private careerInsights = new Map<string, StoredCareerInsight>();

  // Resume Analyses
  addResumeAnalysis(a: StoredResumeAnalysis) {
    this.resumeAnalyses.set(a.id, a);
  }
  getResumeAnalysesForUser(userId: string): StoredResumeAnalysis[] {
    return Array.from(this.resumeAnalyses.values())
      .filter((a) => a.clerkUserId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  getResumeAnalysis(id: string): StoredResumeAnalysis | undefined {
    return this.resumeAnalyses.get(id);
  }

  // Roadmaps
  addRoadmap(r: StoredRoadmap) {
    this.roadmaps.set(r.id, r);
  }
  getRoadmapsForUser(userId: string): StoredRoadmap[] {
    return Array.from(this.roadmaps.values())
      .filter((r) => r.clerkUserId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  getRoadmap(id: string): StoredRoadmap | undefined {
    return this.roadmaps.get(id);
  }
  updateRoadmap(id: string, patch: Partial<StoredRoadmap>) {
    const existing = this.roadmaps.get(id);
    if (existing) {
      const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      this.roadmaps.set(id, updated);
      return updated;
    }
    return undefined;
  }
  updateRoadmapPhase(
    roadmapId: string,
    phaseId: string,
    patch: Partial<StoredRoadmapPhase>,
    userId?: string
  ) {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return undefined;
    if (userId && roadmap.clerkUserId !== userId) return undefined;
    roadmap.phases = roadmap.phases.map((p) =>
      p.id === phaseId ? { ...p, ...patch } : p
    );
    roadmap.updatedAt = new Date().toISOString();
    return roadmap;
  }

  // LinkedIn Analyses
  addLinkedInAnalysis(a: StoredLinkedInAnalysis) {
    this.linkedinAnalyses.set(a.id, a);
  }
  getLinkedInAnalysesForUser(userId: string): StoredLinkedInAnalysis[] {
    return Array.from(this.linkedinAnalyses.values())
      .filter((a) => a.clerkUserId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  // GitHub Analyses
  addGitHubAnalysis(g: StoredGitHubAnalysis) {
    this.githubAnalyses.set(g.id, g);
  }
  getGitHubAnalysesForUser(userId: string): StoredGitHubAnalysis[] {
    return Array.from(this.githubAnalyses.values())
      .filter((g) => g.clerkUserId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  getLatestGitHubAnalysis(userId: string): StoredGitHubAnalysis | undefined {
    return this.getGitHubAnalysesForUser(userId)[0];
  }

  // LeetCode Progress
  setLeetCodeProgress(p: StoredLeetCodeProgress) {
    this.leetcodeProgress.set(p.clerkUserId, p);
  }
  getLeetCodeProgress(userId: string): StoredLeetCodeProgress | undefined {
    return this.leetcodeProgress.get(userId);
  }

  // Placement Readiness
  addPlacementReadiness(r: StoredPlacementReadiness) {
    this.placementReadiness.set(r.id, r);
  }
  getPlacementReadinessForUser(userId: string): StoredPlacementReadiness[] {
    return Array.from(this.placementReadiness.values())
      .filter((r) => r.clerkUserId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  getLatestPlacementReadiness(userId: string): StoredPlacementReadiness | undefined {
    return this.getPlacementReadinessForUser(userId)[0];
  }

  // Career Insights
  addCareerInsight(ci: StoredCareerInsight) {
    this.careerInsights.set(ci.id, ci);
  }
  getCareerInsightsForUser(userId: string): StoredCareerInsight[] {
    return Array.from(this.careerInsights.values())
      .filter((ci) => ci.clerkUserId === userId)
      .sort((a, b) => (ci.createdAt < b.createdAt ? 1 : -1));
  }
  getLatestCareerInsight(userId: string): StoredCareerInsight | undefined {
    return this.getCareerInsightsForUser(userId)[0];
  }
}

export const inMemoryStore = new InMemoryStore();

export function generateId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}
