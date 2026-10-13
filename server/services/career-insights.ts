// ============================================================
// CareerBuddy AI - Career Insights Service (Phase 4)
// Synthesizes profile, resume, roadmap, GitHub, and LeetCode
// ============================================================

import { gemini, type GeminiResult } from "./gemini";
import { validateCareerInsights, type CareerInsightsAI } from "../validators";
import type {
  StoredResumeAnalysis,
  StoredRoadmap,
  StoredGitHubAnalysis,
  StoredLeetCodeProgress,
} from "../lib/store";

export interface StudentCareerContext {
  targetCareer: string | null;
  profileSkills: string[];
  resume: StoredResumeAnalysis | null;
  roadmap: StoredRoadmap | null;
  github: StoredGitHubAnalysis | null;
  leetcode: StoredLeetCodeProgress | null;
}

export async function generateCareerInsights(
  ctx: StudentCareerContext
): Promise<GeminiResult<CareerInsightsAI>> {
  const systemPrompt = `You are an expert technical career advisor and placement preparation strategist.
Synthesize the student's background across their profile skills, resume analysis, active career roadmap, GitHub repositories, and LeetCode coding practice.
Provide practical, specific, and actionable career suggestions in understandable language.

CRITICAL RULES:
1. Do NOT claim to predict placement outcomes with certainty.
2. Identify missing technical skills for their target role.
3. Identify incomplete or high-priority roadmap milestones.
4. Point out weak project presentation aspects on GitHub/portfolio.
5. Highlight specific areas for additional coding practice (e.g. data structures or problem patterns).
6. Return structured JSON matching this exact schema:
{
  "missingSkills": ["string"],
  "roadmapInsights": ["string"],
  "projectAdvice": ["string"],
  "codingPracticeAreas": ["string"],
  "overallActionPlan": ["string"],
  "guidanceDisclaimer": "CareerBuddy AI recommendations provide educational guidance based on your current profile inputs and industry standards; placement outcomes depend on interview performance and hiring company criteria."
}`;

  const resumeSummary = ctx.resume
    ? `ATS Score: ${ctx.resume.atsScore}/100. Summary: ${ctx.resume.summary}. Identified Missing Skills: ${ctx.resume.missingSkills.join(", ")}`
    : "No resume uploaded yet.";

  const roadmapSummary = ctx.roadmap
    ? `Role: ${ctx.roadmap.roleTitle}. Completed Phases: ${
        ctx.roadmap.phases.filter((p) => p.status === "completed").length
      }/${ctx.roadmap.phases.length}. Active/Next Phase: ${
        ctx.roadmap.phases.find((p) => p.status === "in-progress" || p.status === "upcoming")?.title || "Complete"
      }`
    : "No active roadmap selected.";

  const githubSummary = ctx.github
    ? `Public Repos: ${ctx.github.publicRepos}. Total Stars: ${ctx.github.totalStars}. Languages: ${ctx.github.languages
        .map((l) => `${l.name} (${l.percentage}%)`)
        .join(", ")}. Inferred Skills: ${ctx.github.inferredSkills.join(", ")}`
    : "GitHub not connected yet.";

  const leetcodeSummary = ctx.leetcode
    ? `Total Solved: ${ctx.leetcode.totalSolved} (Easy: ${ctx.leetcode.easySolved}, Medium: ${ctx.leetcode.mediumSolved}, Hard: ${ctx.leetcode.hardSolved}). Streak: ${ctx.leetcode.streak} days.`
    : "LeetCode tracking not recorded yet.";

  const userPrompt = `Student Context:
Target Career Goal: ${ctx.targetCareer || "Software Developer"}
Profile Listed Skills: ${ctx.profileSkills.length > 0 ? ctx.profileSkills.join(", ") : "None specified"}

Resume Analysis Status:
${resumeSummary}

Career Roadmap Status:
${roadmapSummary}

GitHub Activity Status:
${githubSummary}

LeetCode Practice Status:
${leetcodeSummary}

Generate customized, actionable career recommendations for this student.`;

  return gemini.generateJson<CareerInsightsAI>(
    systemPrompt,
    userPrompt,
    validateCareerInsights
  );
}
