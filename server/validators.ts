import { z } from "zod";

// ============================================================
// Resume Analysis
// ============================================================

export const resumeAnalysisSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  summary: z.string().min(10).max(1000),
  strengths: z.array(z.string().min(1).max(500)).min(1).max(20),
  weaknesses: z.array(z.string().min(1).max(500)).min(1).max(20),
  missingSkills: z.array(z.string().min(1).max(100)).max(30),
  recommendations: z.array(z.string().min(1).max(500)).min(1).max(20),
  suggestedKeywords: z.array(z.string().min(1).max(100)).max(50),
  experienceTips: z.array(z.string().min(1).max(500)).max(15),
  projectTips: z.array(z.string().min(1).max(500)).max(15),
});

export type ResumeAnalysisAI = z.infer<typeof resumeAnalysisSchema>;

export function validateResumeAnalysis(raw: unknown): ResumeAnalysisAI | null {
  const result = resumeAnalysisSchema.safeParse(raw);
  return result.success ? result.data : null;
}

// ============================================================
// Career Roadmap
// ============================================================

const roadmapPhaseSchema = z.object({
  phaseIndex: z.number().int().min(0),
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(1000),
  duration: z.string().min(1).max(100),
  skills: z.array(z.string().min(1).max(100)).max(30),
  projects: z.array(z.string().min(1).max(300)).max(15),
  practiceTasks: z.array(z.string().min(1).max(300)).max(15).default([]),
  milestones: z.array(z.string().min(1).max(300)).max(15),
  resources: z.array(z.string().min(1).max(300)).max(20),
});

export const roadmapSchema = z.object({
  roleTitle: z.string().min(2).max(200),
  roleId: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  difficulty: z.enum(["Beginner Friendly", "Intermediate", "Advanced"]),
  estimatedTime: z.string().min(1).max(100),
  phases: z.array(roadmapPhaseSchema).min(2).max(8),
});

export type RoadmapAI = z.infer<typeof roadmapSchema>;

export function validateRoadmap(raw: unknown): RoadmapAI | null {
  const result = roadmapSchema.safeParse(raw);
  return result.success ? result.data : null;
}

// ============================================================
// LinkedIn Analysis (8-Criteria Rubric Evaluation)
// ============================================================

export const criterionEvaluationSchema = z.object({
  id: z.enum([
    "headline",
    "photo_banner",
    "about",
    "skills",
    "experience",
    "projects",
    "posts_activity",
    "education_completeness",
  ]),
  name: z.string().min(1).max(100),
  maxScore: z.number().int().min(1).max(20),
  earnedScore: z.number().int().min(0).max(20).nullable(),
  isAvailable: z.boolean(),
  status: z.enum(["available", "unavailable"]),
  explanation: z.string().min(1).max(1000),
});

export const actionPlanItemSchema = z.object({
  priority: z.enum(["High", "Medium", "Low"]),
  action: z.string().min(1).max(600),
  benefit: z.string().min(1).max(600),
  criterion: z.string().min(1).max(100),
});

export const fullLinkedInAnalysisSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  availableEarnedScore: z.number().int().min(0).max(100),
  availableMaxScore: z.number().int().min(1).max(100),
  evaluatedCount: z.number().int().min(0).max(8),
  totalCount: z.number().int().default(8),
  evidenceCoverage: z.string().min(1).max(100),
  ratingExplanation: z.string().min(10).max(1000),
  criteriaBreakdown: z.array(criterionEvaluationSchema),
  strengths: z.array(z.string().min(1).max(500)).min(1).max(10),
  weaknesses: z.array(z.string().min(1).max(500)).min(1).max(10),
  headlineImprovement: z.object({
    currentHeadline: z.string().max(500).optional().nullable(),
    suggestedHeadline: z.string().min(5).max(400),
    explanation: z.string().min(10).max(1000),
  }),
  aboutSuggestions: z.object({
    recommendations: z.array(z.string().min(1).max(500)).min(1).max(10),
    suggestedRewrite: z.string().min(20).max(4000),
  }),
  contentRecommendations: z.array(z.string().min(1).max(500)).min(1).max(10),
  actionPlan: z.array(actionPlanItemSchema).min(1).max(10),
  profileUrl: z.string().max(500).nullable().optional(),
  extractedHeadline: z.string().max(500).optional().nullable(),
  extractedAbout: z.string().max(4000).optional().nullable(),
  extractedSkills: z.union([z.string(), z.array(z.string())]).optional(),
  extractedExperience: z.string().max(5000).optional().nullable(),
  extractedProjects: z.string().max(5000).optional().nullable(),
  dataSource: z.enum(["live_url", "supplied_content", "verified_profile"]).default("live_url"),
  analyzedAt: z.string().optional(),
});

export type CriterionEvaluation = z.infer<typeof criterionEvaluationSchema>;
export type ActionPlanItem = z.infer<typeof actionPlanItemSchema>;
export type FullLinkedInAnalysisAI = z.infer<typeof fullLinkedInAnalysisSchema>;

export function validateFullLinkedInAnalysis(raw: unknown): FullLinkedInAnalysisAI | null {
  const result = fullLinkedInAnalysisSchema.safeParse(raw);
  return result.success ? result.data : null;
}

// Legacy schema for backward-compatibility with store
export const linkedinAnalysisSchema = z.object({
  suggestedHeadline: z.string().min(5).max(400),
  suggestedAbout: z.string().min(20).max(4000),
  suggestedExperience: z.string().min(10).max(5000),
  suggestedProjects: z.string().min(10).max(5000),
  aboutRecommendations: z.array(z.string().min(1).max(500)).min(1).max(15),
  skillGapRecommendations: z.array(z.string().min(1).max(200)).max(20),
  experienceTips: z.array(z.string().min(1).max(500)).max(15),
  projectTips: z.array(z.string().min(1).max(500)).max(15),
  actionRecommendations: z.array(z.string().min(1).max(500)).min(1).max(15),
  profileMatchScore: z.number().int().min(0).max(100),
  extractedHeadline: z.string().max(500).optional(),
  extractedAbout: z.string().max(4000).optional(),
  extractedSkills: z.union([z.string(), z.array(z.string())]).optional(),
  extractedExperience: z.string().max(5000).optional(),
  extractedProjects: z.string().max(5000).optional(),
});

export type LinkedInAnalysisAI = z.infer<typeof linkedinAnalysisSchema>;

export function validateLinkedInAnalysis(raw: unknown): LinkedInAnalysisAI | null {
  const result = linkedinAnalysisSchema.safeParse(raw);
  return result.success ? result.data : null;
}

// ============================================================
// Request payloads
// ============================================================

export const resumeUploadMetaSchema = z.object({
  targetRole: z.string().max(200).optional().or(z.literal("")),
});

export const roadmapGenerateSchema = z.object({
  roleId: z.string().min(2).max(100),
  roleTitle: z.string().min(2).max(200),
  careerGoal: z.string().max(500).optional().or(z.literal("")),
  skills: z.array(z.string().max(100)).max(50).default([]),
  resumeSummary: z.string().max(2000).optional().or(z.literal("")),
  resumeScore: z.number().int().min(0).max(100).optional(),
});

export const roadmapProgressSchema = z.object({
  phaseId: z.string().min(1),
  status: z.enum(["upcoming", "in-progress", "completed"]),
});

export const linkedinAnalyzeSchema = z.object({
  profileUrl: z.string().max(500).optional().or(z.literal("")),
  suppliedContent: z.string().max(25000).optional().or(z.literal("")),
  headline: z.string().max(500).optional().default(""),
  about: z.string().max(4000).optional().default(""),
  skills: z.string().max(2000).optional().default(""),
  experience: z.string().max(5000).optional().default(""),
  projects: z.string().max(5000).optional().default(""),
  education: z.string().max(3000).optional().default(""),
  useVerifiedProfile: z.boolean().optional().default(false),
}).refine(
  (data) =>
    Boolean(
      (data.profileUrl && data.profileUrl.trim().length > 0) ||
      (data.suppliedContent && data.suppliedContent.trim().length > 0) ||
      (data.headline && data.headline.trim().length > 0) ||
      data.useVerifiedProfile
    ),
  { message: "Please provide a LinkedIn profile URL or supply profile content to analyze." }
);

// ============================================================
// Career Insights (Phase 4)
// ============================================================

export const careerInsightsSchema = z.object({
  missingSkills: z.array(z.string().min(1).max(100)).max(20),
  roadmapInsights: z.array(z.string().min(1).max(500)).max(15),
  projectAdvice: z.array(z.string().min(1).max(500)).max(15),
  codingPracticeAreas: z.array(z.string().min(1).max(500)).max(15),
  overallActionPlan: z.array(z.string().min(1).max(500)).min(1).max(10),
  guidanceDisclaimer: z.string().min(10).max(1000),
});

export type CareerInsightsAI = z.infer<typeof careerInsightsSchema>;

export function validateCareerInsights(raw: unknown): CareerInsightsAI | null {
  const result = careerInsightsSchema.safeParse(raw);
  return result.success ? result.data : null;
}

// ============================================================
// GitHub & LeetCode Request Payloads (Phase 4)
// ============================================================

export const githubAnalyzeRequestSchema = z.object({
  username: z.string().min(1).max(100),
});

export const leetcodeSyncRequestSchema = z.object({
  username: z.string().min(1).max(100),
});

export const leetcodeManualRequestSchema = z.object({
  username: z.string().max(100).optional(),
  totalSolved: z.number().int().min(0).max(5000),
  easySolved: z.number().int().min(0).max(2000),
  mediumSolved: z.number().int().min(0).max(3000),
  hardSolved: z.number().int().min(0).max(2000),
  dailyGoalTarget: z.number().int().min(1).max(20).default(3),
  dailyGoalCurrent: z.number().int().min(0).max(50).default(0),
  weeklyGoalTarget: z.number().int().min(1).max(100).default(20),
  weeklyGoalCurrent: z.number().int().min(0).max(200).default(0),
  solvedToday: z.number().int().min(0).max(50).optional(),
});

export const leetcodeLogProblemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Problem title is required").max(200),
  problemUrlOrId: z.string().min(1, "Problem URL or identifier is required").max(300),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  completedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  topic: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const leetcodeUpdateGoalSchema = z.object({
  dailyGoalTarget: z.number().int().min(1).max(50),
  weeklyGoalTarget: z.number().int().min(1).max(200).optional(),
});

