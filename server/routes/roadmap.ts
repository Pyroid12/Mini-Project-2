import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser, getProfileSnapshot } from "../lib/user";
import { generateRoadmap, SUPPORTED_ROLES } from "../services/roadmap";
import { roadmapGenerateSchema, roadmapProgressSchema } from "../validators";
import {
  saveRoadmap,
  getRoadmapsForUser,
  getRoadmapById,
  updateRoadmapPhaseStatus,
  getRoadmapProgress,
  getLatestResumeAnalysis,
} from "../lib/data";

const router = Router();

// GET /api/roadmaps/roles
router.get("/roadmaps/roles", (_req, res) => {
  return res.json({ roles: SUPPORTED_ROLES });
});

// POST /api/ai/roadmap/generate
router.post(
  "/ai/roadmap/generate",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const parsed = roadmapGenerateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid request payload.", issues: parsed.error.flatten() });
      }

      const role = SUPPORTED_ROLES.find((r) => r.id === parsed.data.roleId);
      if (!role) {
        return res.status(400).json({ error: "Unsupported job role." });
      }

      const [profile, latestResume] = await Promise.all([
        getProfileSnapshot(userId),
        getLatestResumeAnalysis(userId),
      ]);

      const skills =
        parsed.data.skills.length > 0
          ? parsed.data.skills
          : profile?.technicalSkills || [];

      const result = await generateRoadmap({
        roleId: parsed.data.roleId,
        roleTitle: role.title,
        careerGoal: parsed.data.careerGoal || profile?.careerGoal || "",
        skills,
        resumeSummary: parsed.data.resumeSummary || latestResume?.summary || "",
        resumeScore: parsed.data.resumeScore ?? latestResume?.atsScore,
      });

      if (!result.ok || !result.data) {
        return res.status(502).json({
          error: result.error || "Roadmap generation failed. Please try again.",
        });
      }

      const saved = await saveRoadmap({
        clerkUserId: userId,
        roleTitle: result.data.roleTitle,
        roleId: result.data.roleId,
        description: result.data.description,
        difficulty: result.data.difficulty,
        estimatedTime: result.data.estimatedTime,
        phases: result.data.phases,
      });

      return res.json({ roadmap: saved });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/roadmaps
router.get("/roadmaps", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const roadmaps = await getRoadmapsForUser(req.auth.userId);
    return res.json({ roadmaps });
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmaps/:id
router.get("/roadmaps/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const roadmap = await getRoadmapById(req.params.id, req.auth.userId);
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found." });
    }
    return res.json({ roadmap });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/roadmaps/:id/progress
router.patch(
  "/roadmaps/:id/progress",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const parsed = roadmapProgressSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid request payload.", issues: parsed.error.flatten() });
      }

      const updated = await updateRoadmapPhaseStatus(
        req.params.id,
        parsed.data.phaseId,
        parsed.data.status,
        req.auth.userId
      );

      if (!updated) {
        return res.status(404).json({ error: "Roadmap or phase not found." });
      }

      const progress = getRoadmapProgress(updated);
      return res.json({ roadmap: updated, progress });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
