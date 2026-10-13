// ============================================================
// CareerBuddy AI - Placement Readiness Routes (Phase 4)
// ============================================================

import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser, getProfileSnapshot } from "../lib/user";
import {
  getLatestResumeAnalysis,
  getRoadmapsForUser,
  getLatestGitHubAnalysis,
  getLeetCodeProgressForUser,
  savePlacementReadiness,
} from "../lib/data";
import { calculatePlacementReadiness } from "../services/readiness";

const router = Router();

// GET /placement-readiness
router.get(
  "/placement-readiness",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName, isDemoUser } = req.auth;
      await ensureUser(userId, email, fullName, isDemoUser);

      const [resume, profile, roadmaps, github, leetcode] = await Promise.all([
        getLatestResumeAnalysis(userId),
        getProfileSnapshot(userId),
        getRoadmapsForUser(userId),
        getLatestGitHubAnalysis(userId),
        getLeetCodeProgressForUser(userId),
      ]);

      const activeRoadmap = roadmaps.find((r) => r.isActive) || roadmaps[0] || null;
      const profileSkills = profile?.technicalSkills || [];

      const readiness = calculatePlacementReadiness({
        resume,
        profileSkills,
        roadmap: activeRoadmap,
        github,
        leetcode,
      });

      // Save latest calculation
      await savePlacementReadiness({
        clerkUserId: userId,
        overallScore: readiness.overallScore,
        resumeScore: readiness.resumeScore,
        skillsScore: readiness.skillsScore,
        roadmapScore: readiness.roadmapScore,
        codingScore: readiness.codingScore,
        githubScore: readiness.githubScore,
        assessmentConfidence: readiness.assessmentConfidence,
        breakdown: readiness.breakdown,
        factors: readiness.factors as unknown as Record<string, unknown>,
        companyTiers: readiness.companyTiers as unknown as Record<string, unknown>[],
        recommendedActions: readiness.recommendedActions as unknown as Record<string, unknown>[],
      });

      return res.status(200).json({
        readiness,
        demoRestricted: isDemoUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
