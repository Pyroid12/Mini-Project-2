import { prisma, isDatabaseConnected } from "./prisma";
import type { Prisma } from "@prisma/client";
import {
  inMemoryStore,
  generateId,
  type StoredResumeAnalysis,
  type StoredRoadmap,
  type StoredRoadmapPhase,
  type StoredLinkedInAnalysis,
  type StoredGitHubAnalysis,
  type StoredLeetCodeProgress,
  type StoredPlacementReadiness,
  type StoredCareerInsight,
} from "./store";

// ============================================================
// Resume Analyses
// ============================================================

export interface ResumeAnalysisInput {
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
}

export async function saveResumeAnalysis(
  input: ResumeAnalysisInput
): Promise<StoredResumeAnalysis> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const record: StoredResumeAnalysis = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  if (dbAvailable) {
    try {
      const saved = await prisma.resumeAnalysis.create({
        data: {
          clerkUserId: input.clerkUserId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          atsScore: input.atsScore,
          summary: input.summary,
          strengths: input.strengths,
          weaknesses: input.weaknesses,
          missingSkills: input.missingSkills,
          recommendations: input.recommendations,
          suggestedKeywords: input.suggestedKeywords,
          experienceTips: input.experienceTips,
          projectTips: input.projectTips,
          targetRole: input.targetRole,
        },
      });
      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        fileName: saved.fileName,
        fileType: saved.fileType,
        fileSize: saved.fileSize,
        atsScore: saved.atsScore,
        summary: saved.summary,
        strengths: saved.strengths,
        weaknesses: saved.weaknesses,
        missingSkills: saved.missingSkills,
        recommendations: saved.recommendations,
        suggestedKeywords: saved.suggestedKeywords,
        experienceTips: saved.experienceTips,
        projectTips: saved.projectTips,
        targetRole: saved.targetRole,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] resume DB save failed, using memory:", err);
    }
  }

  inMemoryStore.addResumeAnalysis(record);
  return record;
}

export async function getResumeAnalysesForUser(
  userId: string
): Promise<StoredResumeAnalysis[]> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const rows = await prisma.resumeAnalysis.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((r) => ({
        id: r.id,
        clerkUserId: r.clerkUserId,
        fileName: r.fileName,
        fileType: r.fileType,
        fileSize: r.fileSize,
        atsScore: r.atsScore,
        summary: r.summary,
        strengths: r.strengths,
        weaknesses: r.weaknesses,
        missingSkills: r.missingSkills,
        recommendations: r.recommendations,
        suggestedKeywords: r.suggestedKeywords,
        experienceTips: r.experienceTips,
        projectTips: r.projectTips,
        targetRole: r.targetRole,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error("[data] resume DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getResumeAnalysesForUser(userId);
}

export async function getLatestResumeAnalysis(
  userId: string
): Promise<StoredResumeAnalysis | null> {
  const all = await getResumeAnalysesForUser(userId);
  return all[0] ?? null;
}

// ============================================================
// Career Roadmaps
// ============================================================

export interface RoadmapPhaseInput {
  phaseIndex: number;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  projects: string[];
  practiceTasks?: string[];
  milestones: string[];
  resources: string[];
}

export interface RoadmapInput {
  clerkUserId: string;
  roleTitle: string;
  roleId: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  phases: RoadmapPhaseInput[];
}

export async function saveRoadmap(
  input: RoadmapInput
): Promise<StoredRoadmap> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const roadmapId = generateId();
  const phases: StoredRoadmapPhase[] = input.phases.map((p) => ({
    id: generateId(),
    phaseIndex: p.phaseIndex,
    title: p.title,
    description: p.description,
    duration: p.duration,
    skills: p.skills,
    projects: p.projects,
    practiceTasks: p.practiceTasks ?? [],
    milestones: p.milestones,
    resources: p.resources,
    status: "upcoming",
  }));

  const record: StoredRoadmap = {
    id: roadmapId,
    clerkUserId: input.clerkUserId,
    roleTitle: input.roleTitle,
    roleId: input.roleId,
    description: input.description,
    difficulty: input.difficulty,
    estimatedTime: input.estimatedTime,
    isActive: true,
    phases,
    createdAt: now,
    updatedAt: now,
  };

  if (dbAvailable) {
    try {
      const saved = await prisma.careerRoadmap.create({
        data: {
          clerkUserId: input.clerkUserId,
          roleTitle: input.roleTitle,
          roleId: input.roleId,
          description: input.description,
          difficulty: input.difficulty,
          estimatedTime: input.estimatedTime,
          phases: {
            create: phases.map((p) => ({
              phaseIndex: p.phaseIndex,
              title: p.title,
              description: p.description,
              duration: p.duration,
              skills: p.skills,
              projects: p.projects,
              practiceTasks: p.practiceTasks,
              milestones: p.milestones,
              resources: p.resources,
              status: "upcoming",
            })),
          },
        },
        include: { phases: { orderBy: { phaseIndex: "asc" } } },
      });
      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        roleTitle: saved.roleTitle,
        roleId: saved.roleId,
        description: saved.description,
        difficulty: saved.difficulty,
        estimatedTime: saved.estimatedTime,
        isActive: saved.isActive,
        phases: saved.phases.map((p) => ({
          id: p.id,
          phaseIndex: p.phaseIndex,
          title: p.title,
          description: p.description,
          duration: p.duration,
          skills: p.skills,
          projects: p.projects,
          practiceTasks: p.practiceTasks ?? [],
          milestones: p.milestones,
          resources: p.resources,
          status: p.status,
        })),
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] roadmap DB save failed, using memory:", err);
    }
  }

  inMemoryStore.addRoadmap(record);
  return record;
}

export async function getRoadmapsForUser(
  userId: string
): Promise<StoredRoadmap[]> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const rows = await prisma.careerRoadmap.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: "desc" },
        include: { phases: { orderBy: { phaseIndex: "asc" } } },
      });
      return rows.map((r) => ({
        id: r.id,
        clerkUserId: r.clerkUserId,
        roleTitle: r.roleTitle,
        roleId: r.roleId,
        description: r.description,
        difficulty: r.difficulty,
        estimatedTime: r.estimatedTime,
        isActive: r.isActive,
        phases: r.phases.map((p) => ({
          id: p.id,
          phaseIndex: p.phaseIndex,
          title: p.title,
          description: p.description,
          duration: p.duration,
          skills: p.skills,
          projects: p.projects,
          practiceTasks: p.practiceTasks ?? [],
          milestones: p.milestones,
          resources: p.resources,
          status: p.status,
        })),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error("[data] roadmap DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getRoadmapsForUser(userId);
}

export async function getRoadmapById(
  id: string,
  userId: string
): Promise<StoredRoadmap | null> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const r = await prisma.careerRoadmap.findFirst({
        where: { id, clerkUserId: userId },
        include: { phases: { orderBy: { phaseIndex: "asc" } } },
      });
      if (!r) return null;
      return {
        id: r.id,
        clerkUserId: r.clerkUserId,
        roleTitle: r.roleTitle,
        roleId: r.roleId,
        description: r.description,
        difficulty: r.difficulty,
        estimatedTime: r.estimatedTime,
        isActive: r.isActive,
        phases: r.phases.map((p) => ({
          id: p.id,
          phaseIndex: p.phaseIndex,
          title: p.title,
          description: p.description,
          duration: p.duration,
          skills: p.skills,
          projects: p.projects,
          practiceTasks: p.practiceTasks ?? [],
          milestones: p.milestones,
          resources: p.resources,
          status: p.status,
        })),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] roadmap DB find failed, using memory:", err);
    }
  }
  const mem = inMemoryStore.getRoadmap(id);
  if (mem && mem.clerkUserId === userId) return mem;
  return null;
}

export async function updateRoadmapPhaseStatus(
  roadmapId: string,
  phaseId: string,
  status: string,
  userId: string
): Promise<StoredRoadmap | null> {
  const roadmap = await getRoadmapById(roadmapId, userId);
  if (!roadmap) return null;

  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      await prisma.roadmapPhase.updateMany({
        where: { id: phaseId, roadmapId },
        data: { status },
      });
      return getRoadmapById(roadmapId, userId);
    } catch (err) {
      console.error("[data] phase DB update failed, using memory:", err);
    }
  }

  return inMemoryStore.updateRoadmapPhase(roadmapId, phaseId, { status }, userId);
}

export function getRoadmapProgress(roadmap: StoredRoadmap): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = roadmap.phases.length;
  const completed = roadmap.phases.filter((p) => p.status === "completed").length;
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

// ============================================================
// LinkedIn Analyses
// ============================================================

export interface LinkedInAnalysisInput {
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
}

export async function saveLinkedInAnalysis(
  input: LinkedInAnalysisInput
): Promise<StoredLinkedInAnalysis> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const record: StoredLinkedInAnalysis = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  if (dbAvailable) {
    try {
      const saved = await prisma.linkedinAnalysis.create({
        data: input,
      });
      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        headline: saved.headline,
        about: saved.about,
        skills: saved.skills,
        experience: saved.experience,
        projects: saved.projects,
        profileUrl: saved.profileUrl,
        suggestedHeadline: saved.suggestedHeadline,
        suggestedAbout: saved.suggestedAbout,
        suggestedExperience: saved.suggestedExperience,
        suggestedProjects: saved.suggestedProjects,
        aboutRecommendations: saved.aboutRecommendations,
        skillGapRecommendations: saved.skillGapRecommendations,
        experienceTips: saved.experienceTips,
        projectTips: saved.projectTips,
        actionRecommendations: saved.actionRecommendations,
        profileMatchScore: saved.profileMatchScore,
        fullAnalysis: saved.fullAnalysis,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] linkedin DB save failed, using memory:", err);
    }
  }

  inMemoryStore.addLinkedInAnalysis(record);
  return record;
}

export async function getLinkedInAnalysesForUser(
  userId: string
): Promise<StoredLinkedInAnalysis[]> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const rows = await prisma.linkedinAnalysis.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((r) => ({
        id: r.id,
        clerkUserId: r.clerkUserId,
        headline: r.headline,
        about: r.about,
        skills: r.skills,
        experience: r.experience,
        projects: r.projects,
        profileUrl: r.profileUrl,
        suggestedHeadline: r.suggestedHeadline,
        suggestedAbout: r.suggestedAbout,
        suggestedExperience: r.suggestedExperience,
        suggestedProjects: r.suggestedProjects,
        aboutRecommendations: r.aboutRecommendations,
        skillGapRecommendations: r.skillGapRecommendations,
        experienceTips: r.experienceTips,
        projectTips: r.projectTips,
        actionRecommendations: r.actionRecommendations,
        profileMatchScore: r.profileMatchScore,
        fullAnalysis: r.fullAnalysis,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error("[data] linkedin DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getLinkedInAnalysesForUser(userId);
}

export async function getLatestLinkedInAnalysis(
  userId: string
): Promise<StoredLinkedInAnalysis | null> {
  const all = await getLinkedInAnalysesForUser(userId);
  return all[0] ?? null;
}

// ============================================================
// GitHub Analyses (Phase 4)
// ============================================================

export interface GitHubAnalysisInput {
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
}

export async function saveGitHubAnalysis(
  input: GitHubAnalysisInput
): Promise<StoredGitHubAnalysis> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const record: StoredGitHubAnalysis = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  if (dbAvailable) {
    try {
      const saved = await prisma.githubAnalysis.create({
        data: {
          clerkUserId: input.clerkUserId,
          username: input.username,
          avatarUrl: input.avatarUrl,
          bio: input.bio,
          publicRepos: input.publicRepos,
          followers: input.followers,
          following: input.following,
          totalStars: input.totalStars,
          totalForks: input.totalForks,
          languages: input.languages as unknown as Prisma.InputJsonValue,
          topRepos: input.topRepos as unknown as Prisma.InputJsonValue,
          inferredSkills: input.inferredSkills,
          qualitySuggestions: input.qualitySuggestions,
          recommendedSteps: input.recommendedSteps,
        },
      });
      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        username: saved.username,
        avatarUrl: saved.avatarUrl,
        bio: saved.bio,
        publicRepos: saved.publicRepos,
        followers: saved.followers,
        following: saved.following,
        totalStars: saved.totalStars,
        totalForks: saved.totalForks,
        languages: (saved.languages as unknown as { name: string; percentage: number; color: string; count?: number }[]) || [],
        topRepos: (saved.topRepos as unknown as StoredGitHubAnalysis["topRepos"]) || [],
        inferredSkills: saved.inferredSkills,
        qualitySuggestions: saved.qualitySuggestions,
        recommendedSteps: saved.recommendedSteps,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] github DB save failed, using memory:", err);
    }
  }

  inMemoryStore.addGitHubAnalysis(record);
  return record;
}

export async function getGitHubAnalysesForUser(
  userId: string
): Promise<StoredGitHubAnalysis[]> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const rows = await prisma.githubAnalysis.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((r) => ({
        id: r.id,
        clerkUserId: r.clerkUserId,
        username: r.username,
        avatarUrl: r.avatarUrl,
        bio: r.bio,
        publicRepos: r.publicRepos,
        followers: r.followers,
        following: r.following,
        totalStars: r.totalStars,
        totalForks: r.totalForks,
        languages: (r.languages as unknown as { name: string; percentage: number; color: string; count?: number }[]) || [],
        topRepos: (r.topRepos as unknown as StoredGitHubAnalysis["topRepos"]) || [],
        inferredSkills: r.inferredSkills,
        qualitySuggestions: r.qualitySuggestions,
        recommendedSteps: r.recommendedSteps,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error("[data] github DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getGitHubAnalysesForUser(userId);
}

export async function getLatestGitHubAnalysis(
  userId: string
): Promise<StoredGitHubAnalysis | null> {
  const all = await getGitHubAnalysesForUser(userId);
  return all[0] ?? null;
}

// ============================================================
// LeetCode Progress (Phase 4)
// ============================================================

export interface LeetCodeProgressInput {
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
  weeklyHistory?: { day: string; date: string; solved: number }[];
  problemEntries?: StoredLeetCodeProblemEntry[];
  recentSubmissions?: StoredLeetCodeRecentSubmission[];
  source: "synced" | "manual";
  lastSyncedAt?: string | null;
}

export async function saveLeetCodeProgress(
  input: LeetCodeProgressInput
): Promise<StoredLeetCodeProgress> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const record: StoredLeetCodeProgress = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    weeklyHistory: input.weeklyHistory || [],
    problemEntries: input.problemEntries || [],
    recentSubmissions: input.recentSubmissions || [],
    lastSyncedAt: input.lastSyncedAt || (input.source === "synced" ? now : null),
    ...input,
  };

  if (dbAvailable) {
    try {
      // Upsert: check if record already exists for user
      const existing = await prisma.leetcodeProgress.findFirst({
        where: { clerkUserId: input.clerkUserId },
        orderBy: { createdAt: "desc" },
      });

      let saved;
      if (existing) {
        saved = await prisma.leetcodeProgress.update({
          where: { id: existing.id },
          data: {
            username: input.username,
            totalSolved: input.totalSolved,
            easySolved: input.easySolved,
            mediumSolved: input.mediumSolved,
            hardSolved: input.hardSolved,
            ranking: input.ranking,
            streak: input.streak,
            dailyGoalTarget: input.dailyGoalTarget,
            dailyGoalCurrent: input.dailyGoalCurrent,
            weeklyGoalTarget: input.weeklyGoalTarget,
            weeklyGoalCurrent: input.weeklyGoalCurrent,
            weeklyHistory: (input.weeklyHistory || []) as unknown as Prisma.InputJsonValue,
            problemEntries: (input.problemEntries || []) as unknown as Prisma.InputJsonValue,
            recentSubmissions: (input.recentSubmissions || []) as unknown as Prisma.InputJsonValue,
            acceptanceRate: input.acceptanceRate || null,
            totalSubmissions: input.totalSubmissions || null,
            source: input.source,
            lastSyncedAt: input.source === "synced" ? new Date() : existing.lastSyncedAt,
          },
        });
      } else {
        saved = await prisma.leetcodeProgress.create({
          data: {
            clerkUserId: input.clerkUserId,
            username: input.username,
            totalSolved: input.totalSolved,
            easySolved: input.easySolved,
            mediumSolved: input.mediumSolved,
            hardSolved: input.hardSolved,
            ranking: input.ranking,
            streak: input.streak,
            dailyGoalTarget: input.dailyGoalTarget,
            dailyGoalCurrent: input.dailyGoalCurrent,
            weeklyGoalTarget: input.weeklyGoalTarget,
            weeklyGoalCurrent: input.weeklyGoalCurrent,
            weeklyHistory: (input.weeklyHistory || []) as unknown as Prisma.InputJsonValue,
            problemEntries: (input.problemEntries || []) as unknown as Prisma.InputJsonValue,
            recentSubmissions: (input.recentSubmissions || []) as unknown as Prisma.InputJsonValue,
            acceptanceRate: input.acceptanceRate || null,
            totalSubmissions: input.totalSubmissions || null,
            source: input.source,
            lastSyncedAt: input.source === "synced" ? new Date() : null,
          },
        });
      }

      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        username: saved.username,
        totalSolved: saved.totalSolved,
        easySolved: saved.easySolved,
        mediumSolved: saved.mediumSolved,
        hardSolved: saved.hardSolved,
        ranking: saved.ranking,
        reputation: input.reputation ?? null,
        avatarUrl: input.avatarUrl ?? null,
        realName: input.realName ?? null,
        acceptanceRate: saved.acceptanceRate ?? null,
        totalSubmissions: saved.totalSubmissions ?? null,
        streak: saved.streak,
        isStreakVerified: input.isStreakVerified ?? (saved.source === "synced"),
        dailyGoalTarget: saved.dailyGoalTarget,
        dailyGoalCurrent: saved.dailyGoalCurrent,
        weeklyGoalTarget: saved.weeklyGoalTarget,
        weeklyGoalCurrent: saved.weeklyGoalCurrent,
        weeklyHistory: (saved.weeklyHistory as unknown as StoredLeetCodeProgress["weeklyHistory"]) || [],
        problemEntries: (saved.problemEntries as unknown as StoredLeetCodeProblemEntry[]) || [],
        recentSubmissions: (saved.recentSubmissions as unknown as StoredLeetCodeRecentSubmission[]) || [],
        source: saved.source as "synced" | "manual",
        lastSyncedAt: saved.lastSyncedAt ? saved.lastSyncedAt.toISOString() : null,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] leetcode DB save failed, using memory:", err);
    }
  }

  inMemoryStore.setLeetCodeProgress(record);
  return record;
}

export async function getLeetCodeProgressForUser(
  userId: string
): Promise<StoredLeetCodeProgress | null> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const row = await prisma.leetcodeProgress.findFirst({
        where: { clerkUserId: userId },
        orderBy: { updatedAt: "desc" },
      });
      if (row) {
        return {
          id: row.id,
          clerkUserId: row.clerkUserId,
          username: row.username,
          totalSolved: row.totalSolved,
          easySolved: row.easySolved,
          mediumSolved: row.mediumSolved,
          hardSolved: row.hardSolved,
          ranking: row.ranking,
          streak: row.streak,
          isStreakVerified: row.source === "synced",
          acceptanceRate: row.acceptanceRate ?? null,
          totalSubmissions: row.totalSubmissions ?? null,
          dailyGoalTarget: row.dailyGoalTarget,
          dailyGoalCurrent: row.dailyGoalCurrent,
          weeklyGoalTarget: row.weeklyGoalTarget,
          weeklyGoalCurrent: row.weeklyGoalCurrent,
          weeklyHistory: (row.weeklyHistory as unknown as StoredLeetCodeProgress["weeklyHistory"]) || [],
          problemEntries: (row.problemEntries as unknown as StoredLeetCodeProblemEntry[]) || [],
          recentSubmissions: (row.recentSubmissions as unknown as StoredLeetCodeRecentSubmission[]) || [],
          source: row.source as "synced" | "manual",
          lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("[data] leetcode DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getLeetCodeProgress(userId) || null;
}

// ============================================================
// Placement Readiness (Phase 4)
// ============================================================

export interface PlacementReadinessInput {
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
}

export async function savePlacementReadiness(
  input: PlacementReadinessInput
): Promise<StoredPlacementReadiness> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const record: StoredPlacementReadiness = {
    id: generateId(),
    createdAt: now,
    ...input,
  };

  if (dbAvailable) {
    try {
      const saved = await prisma.placementReadinessResult.create({
        data: {
          clerkUserId: input.clerkUserId,
          overallScore: input.overallScore,
          resumeScore: input.resumeScore,
          skillsScore: input.skillsScore,
          roadmapScore: input.roadmapScore,
          codingScore: input.codingScore,
          githubScore: input.githubScore,
          assessmentConfidence: input.assessmentConfidence,
          breakdown: input.breakdown as unknown as Prisma.InputJsonValue,
          factors: input.factors as unknown as Prisma.InputJsonValue,
          companyTiers: input.companyTiers as unknown as Prisma.InputJsonValue,
          recommendedActions: input.recommendedActions as unknown as Prisma.InputJsonValue,
        },
      });
      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        overallScore: saved.overallScore,
        resumeScore: saved.resumeScore,
        skillsScore: saved.skillsScore,
        roadmapScore: saved.roadmapScore,
        codingScore: saved.codingScore,
        githubScore: saved.githubScore,
        assessmentConfidence: saved.assessmentConfidence,
        breakdown: saved.breakdown as Record<string, unknown>,
        factors: saved.factors as Record<string, unknown>,
        companyTiers: saved.companyTiers as Record<string, unknown>[],
        recommendedActions: saved.recommendedActions as Record<string, unknown>[],
        createdAt: saved.createdAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] placement DB save failed, using memory:", err);
    }
  }

  inMemoryStore.addPlacementReadiness(record);
  return record;
}

export async function getLatestPlacementReadiness(
  userId: string
): Promise<StoredPlacementReadiness | null> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const row = await prisma.placementReadinessResult.findFirst({
        where: { clerkUserId: userId },
        orderBy: { createdAt: "desc" },
      });
      if (row) {
        return {
          id: row.id,
          clerkUserId: row.clerkUserId,
          overallScore: row.overallScore,
          resumeScore: row.resumeScore,
          skillsScore: row.skillsScore,
          roadmapScore: row.roadmapScore,
          codingScore: row.codingScore,
          githubScore: row.githubScore,
          assessmentConfidence: row.assessmentConfidence,
          breakdown: row.breakdown as Record<string, unknown>,
          factors: row.factors as Record<string, unknown>,
          companyTiers: row.companyTiers as Record<string, unknown>[],
          recommendedActions: row.recommendedActions as Record<string, unknown>[],
          createdAt: row.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("[data] placement DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getLatestPlacementReadiness(userId) || null;
}

// ============================================================
// Career Insights (Phase 4)
// ============================================================

export interface CareerInsightInput {
  clerkUserId: string;
  missingSkills: string[];
  roadmapInsights: string[];
  projectAdvice: string[];
  codingPracticeAreas: string[];
  overallActionPlan: string[];
  guidanceDisclaimer: string;
}

export async function saveCareerInsight(
  input: CareerInsightInput
): Promise<StoredCareerInsight> {
  const dbAvailable = await isDatabaseConnected();
  const now = new Date().toISOString();
  const record: StoredCareerInsight = {
    id: generateId(),
    createdAt: now,
    ...input,
  };

  if (dbAvailable) {
    try {
      const saved = await prisma.careerInsightResult.create({
        data: input,
      });
      return {
        id: saved.id,
        clerkUserId: saved.clerkUserId,
        missingSkills: saved.missingSkills,
        roadmapInsights: saved.roadmapInsights,
        projectAdvice: saved.projectAdvice,
        codingPracticeAreas: saved.codingPracticeAreas,
        overallActionPlan: saved.overallActionPlan,
        guidanceDisclaimer: saved.guidanceDisclaimer,
        createdAt: saved.createdAt.toISOString(),
      };
    } catch (err) {
      console.error("[data] career insights DB save failed, using memory:", err);
    }
  }

  inMemoryStore.addCareerInsight(record);
  return record;
}

export async function getLatestCareerInsight(
  userId: string
): Promise<StoredCareerInsight | null> {
  const dbAvailable = await isDatabaseConnected();
  if (dbAvailable) {
    try {
      const row = await prisma.careerInsightResult.findFirst({
        where: { clerkUserId: userId },
        orderBy: { createdAt: "desc" },
      });
      if (row) {
        return {
          id: row.id,
          clerkUserId: row.clerkUserId,
          missingSkills: row.missingSkills,
          roadmapInsights: row.roadmapInsights,
          projectAdvice: row.projectAdvice,
          codingPracticeAreas: row.codingPracticeAreas,
          overallActionPlan: row.overallActionPlan,
          guidanceDisclaimer: row.guidanceDisclaimer,
          createdAt: row.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("[data] career insight DB read failed, using memory:", err);
    }
  }
  return inMemoryStore.getLatestCareerInsight(userId) || null;
}
