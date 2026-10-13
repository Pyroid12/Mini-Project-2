import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser, getProfileSnapshot } from "../lib/user";
import {
  getLatestResumeAnalysis,
  getRoadmapsForUser,
  getLinkedInAnalysesForUser,
  getRoadmapProgress,
  getLatestGitHubAnalysis,
  getLeetCodeProgressForUser,
  getLatestPlacementReadiness,
} from "../lib/data";

const router = Router();

// GET /api/dashboard/summary
router.get(
  "/dashboard/summary",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const [
        latestResume,
        roadmaps,
        linkedinAnalyses,
        profile,
        github,
        leetcode,
        placementReadiness,
      ] = await Promise.all([
        getLatestResumeAnalysis(userId),
        getRoadmapsForUser(userId),
        getLinkedInAnalysesForUser(userId),
        getProfileSnapshot(userId),
        getLatestGitHubAnalysis(userId),
        getLeetCodeProgressForUser(userId),
        getLatestPlacementReadiness(userId),
      ]);

      const activeRoadmap = roadmaps.find((r) => r.isActive) || roadmaps[0] || null;
      const targetCareer = activeRoadmap?.roleTitle || profile?.careerGoal || null;
      const roadmapProgress = activeRoadmap
        ? getRoadmapProgress(activeRoadmap)
        : { completed: 0, total: 0, percentage: 0 };

      const latestLinkedIn = linkedinAnalyses[0] || null;

      const recommendedActions: { id: string; title: string; description: string; category: string; route: string }[] = [];

      if (!latestResume) {
        recommendedActions.push({
          id: "resume",
          title: "Analyze your resume",
          description: "Upload your resume to get an ATS score and personalized feedback.",
          category: "Resume",
          route: "/resume-analysis",
        });
      } else if (latestResume.atsScore < 70) {
        recommendedActions.push({
          id: "resume-improve",
          title: "Improve your resume",
          description: `Your ATS score is ${latestResume.atsScore}/100. Review the recommendations to boost it.`,
          category: "Resume",
          route: "/resume-analysis",
        });
      }

      if (!activeRoadmap) {
        recommendedActions.push({
          id: "roadmap",
          title: "Generate a career roadmap",
          description: "Pick a target role and get a personalized learning path.",
          category: "Roadmap",
          route: "/career-roadmap",
        });
      } else if (roadmapProgress.percentage < 50) {
        recommendedActions.push({
          id: "roadmap-progress",
          title: `Continue your ${activeRoadmap.roleTitle} roadmap`,
          description: `You are ${roadmapProgress.percentage}% through your roadmap. Keep up the momentum!`,
          category: "Roadmap",
          route: "/career-roadmap",
        });
      }

      if (!latestLinkedIn) {
        recommendedActions.push({
          id: "linkedin",
          title: "Optimize your LinkedIn profile",
          description: "Get AI suggestions to improve your headline, About section, and more.",
          category: "Profile",
          route: "/linkedin-analysis",
        });
      }

      return res.json({
        summary: {
          latestResumeScore: latestResume ? latestResume.atsScore : null,
          latestResume: latestResume
            ? {
                id: latestResume.id,
                fileName: latestResume.fileName,
                atsScore: latestResume.atsScore,
                targetRole: latestResume.targetRole,
                createdAt: latestResume.createdAt,
              }
            : null,
          targetCareer,
          roadmapProgress,
          activeRoadmap: activeRoadmap
            ? {
                id: activeRoadmap.id,
                roleTitle: activeRoadmap.roleTitle,
                roleId: activeRoadmap.roleId,
              }
            : null,
          linkedinStatus: latestLinkedIn
            ? {
                id: latestLinkedIn.id,
                profileMatchScore: latestLinkedIn.profileMatchScore,
                createdAt: latestLinkedIn.createdAt,
              }
            : null,
          readinessScore: placementReadiness ? placementReadiness.overallScore : null,
          githubRepos: github ? github.publicRepos : null,
          leetcodeSolved: leetcode ? leetcode.totalSolved : null,
          recommendedActions,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
