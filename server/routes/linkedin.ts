import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser, getProfileSnapshot } from "../lib/user";
import { analyzeLinkedIn } from "../services/linkedin";
import { linkedinAnalyzeSchema } from "../validators";
import {
  saveLinkedInAnalysis,
  getLinkedInAnalysesForUser,
  getLatestLinkedInAnalysis,
  getLatestResumeAnalysis,
} from "../lib/data";

const router = Router();

// POST /api/ai/linkedin-analyze
router.post(
  "/ai/linkedin-analyze",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, isDemoUser, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName, isDemoUser);

      const parsed = linkedinAnalyzeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid request payload.", issues: parsed.error.flatten() });
      }

      const [candidateProfile, latestResume] = await Promise.all([
        getProfileSnapshot(userId).catch(() => null),
        getLatestResumeAnalysis(userId).catch(() => null),
      ]);

      const result = await analyzeLinkedIn({
        profileUrl: parsed.data.profileUrl,
        suppliedContent: parsed.data.suppliedContent,
        headline: parsed.data.headline,
        about: parsed.data.about,
        skills: parsed.data.skills,
        experience: parsed.data.experience,
        projects: parsed.data.projects,
        education: parsed.data.education,
        useVerifiedProfile: parsed.data.useVerifiedProfile,
        candidateProfile: candidateProfile
          ? {
              fullName,
              careerGoal: candidateProfile.careerGoal,
              technicalSkills: candidateProfile.technicalSkills,
              college: candidateProfile.college,
              degree: candidateProfile.degree,
              branch: candidateProfile.branch,
            }
          : { fullName },
        resumeData: latestResume
          ? {
              summary: latestResume.summary,
              targetRole: latestResume.targetRole,
              strengths: latestResume.strengths,
              missingSkills: latestResume.missingSkills,
            }
          : undefined,
      });

      // If LinkedIn authwall prevents direct automated scraping and no manual content was provided:
      if (result.requiresContent) {
        return res.status(200).json({
          ok: false,
          requiresContent: true,
          authwallBlocked: true,
          normalizedUrl: result.normalizedUrl,
          username: result.username,
          message:
            result.error ||
            "LinkedIn restricts automated web scraping behind a sign-in security wall (HTTP 999/Authwall). To evaluate your profile accurately, please supply your profile content or use your CareerBuddy profile.",
        });
      }

      if (!result.ok || !result.data) {
        return res.status(400).json({
          ok: false,
          error: result.error || "LinkedIn analysis could not be completed. Please check the URL or provide profile content.",
        });
      }

      const analysis = result.data;

      // Extract skills array
      const skillsArray = Array.isArray(analysis.extractedSkills)
        ? analysis.extractedSkills
        : typeof analysis.extractedSkills === "string"
        ? analysis.extractedSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : candidateProfile?.technicalSkills || [];

      // Save analysis in persistent store
      const saved = await saveLinkedInAnalysis({
        clerkUserId: userId,
        headline:
          analysis.headlineImprovement.currentHeadline ||
          analysis.extractedHeadline ||
          "Engineering Professional",
        about: analysis.extractedAbout || "",
        skills: skillsArray,
        experience: analysis.extractedExperience || "",
        projects: analysis.extractedProjects || "",
        profileUrl: analysis.profileUrl || parsed.data.profileUrl || null,
        suggestedHeadline: analysis.headlineImprovement.suggestedHeadline,
        suggestedAbout: analysis.aboutSuggestions.suggestedRewrite,
        suggestedExperience: "",
        suggestedProjects: "",
        aboutRecommendations: analysis.aboutSuggestions.recommendations,
        skillGapRecommendations: analysis.weaknesses,
        experienceTips: [],
        projectTips: [],
        actionRecommendations: analysis.actionPlan.map(
          (a) => `[${a.priority}] ${a.action}: ${a.benefit}`
        ),
        profileMatchScore: analysis.overallScore,
        fullAnalysis: analysis,
      });

      return res.json({
        ok: true,
        analysis,
        savedId: saved.id,
        demoRestricted: isDemoUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/linkedin-analyses
router.get(
  "/linkedin-analyses",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const rawAnalyses = await getLinkedInAnalysesForUser(req.auth.userId);
      const analyses = rawAnalyses.map((r) => r.fullAnalysis || r);
      return res.json({ analyses });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/linkedin-analyses/latest
router.get(
  "/linkedin-analyses/latest",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const latest = await getLatestLinkedInAnalysis(req.auth.userId);
      const analysis = latest?.fullAnalysis || latest || null;
      return res.json({ analysis });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
