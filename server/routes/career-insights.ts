// ============================================================
// CareerBuddy AI - Career Insights Routes (Phase 4)
// ============================================================

import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser, getProfileSnapshot } from "../lib/user";
import {
  getLatestResumeAnalysis,
  getRoadmapsForUser,
  getLatestGitHubAnalysis,
  getLeetCodeProgressForUser,
  saveCareerInsight,
  getLatestCareerInsight,
} from "../lib/data";
import { generateCareerInsights } from "../services/career-insights";

const router = Router();

// GET /career-insights/latest
router.get(
  "/career-insights/latest",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const latest = await getLatestCareerInsight(userId);
      return res.status(200).json({
        insights: latest,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /career-insights/generate
router.post(
  "/career-insights/generate",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const [resume, profile, roadmaps, github, leetcode] = await Promise.all([
        getLatestResumeAnalysis(userId),
        getProfileSnapshot(userId),
        getRoadmapsForUser(userId),
        getLatestGitHubAnalysis(userId),
        getLeetCodeProgressForUser(userId),
      ]);

      const activeRoadmap = roadmaps.find((r) => r.isActive) || roadmaps[0] || null;
      const profileSkills = profile?.technicalSkills || [];
      const targetCareer = activeRoadmap?.roleTitle || profile?.careerGoal || "Software Developer";

      const result = await generateCareerInsights({
        targetCareer,
        profileSkills,
        resume,
        roadmap: activeRoadmap,
        github,
        leetcode,
      });

      if (!result.ok || !result.data) {
        return res.status(503).json({
          error:
            result.error ||
            "Unable to generate career insights at this time. Please try again shortly.",
        });
      }

      const saved = await saveCareerInsight({
        clerkUserId: userId,
        missingSkills: result.data.missingSkills,
        roadmapInsights: result.data.roadmapInsights,
        projectAdvice: result.data.projectAdvice,
        codingPracticeAreas: result.data.codingPracticeAreas,
        overallActionPlan: result.data.overallActionPlan,
        guidanceDisclaimer: result.data.guidanceDisclaimer,
      });

      return res.status(200).json({
        insights: saved,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
