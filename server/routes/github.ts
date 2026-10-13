// ============================================================
// CareerBuddy AI - GitHub Routes (Phase 4)
// ============================================================

import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser } from "../lib/user";
import { githubAnalyzeRequestSchema } from "../validators";
import { fetchAndAnalyzeGitHub } from "../services/github";
import { saveGitHubAnalysis, getLatestGitHubAnalysis } from "../lib/data";

const router = Router();

// POST /github/analyze
router.post(
  "/github/analyze",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName, isDemoUser } = req.auth;
      await ensureUser(userId, email, fullName, isDemoUser);

      let payload = req.body;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          payload = { username: payload };
        }
      } else if ((!payload || Object.keys(payload).length === 0) && req.query.username) {
        payload = { username: req.query.username };
      }

      const parsed = githubAnalyzeRequestSchema.safeParse(payload || {});
      if (!parsed.success) {
        const errorMsg =
          parsed.error.issues[0]?.message || "Invalid GitHub username provided.";
        return res.status(400).json({
          error: errorMsg,
          details: parsed.error.issues,
        });
      }

      const { username } = parsed.data;
      const analysis = await fetchAndAnalyzeGitHub(username);

      const saved = await saveGitHubAnalysis({
        clerkUserId: userId,
        username: analysis.username,
        avatarUrl: analysis.avatarUrl,
        bio: analysis.bio,
        publicRepos: analysis.publicRepos,
        followers: analysis.followers,
        following: analysis.following,
        totalStars: analysis.totalStars,
        totalForks: analysis.totalForks,
        languages: analysis.languages,
        topRepos: analysis.topRepos,
        inferredSkills: analysis.inferredSkills,
        qualitySuggestions: analysis.qualitySuggestions,
        recommendedSteps: analysis.recommendedSteps,
      });

      return res.status(200).json({
        analysis: {
          ...saved,
          name: analysis.name,
          htmlUrl: analysis.htmlUrl,
          location: analysis.location,
          company: analysis.company,
          createdAt: analysis.createdAt,
          allRepos: analysis.allRepos,
          apiDisclaimer: analysis.apiDisclaimer,
        },
      });
    } catch (err: any) {
      const message = err?.message || "Failed to analyze GitHub account";
      if (message.includes("not found")) {
        return res.status(404).json({ error: message });
      }
      if (message.includes("rate limit") || message.includes("request limit")) {
        return res.status(429).json({ error: message });
      }
      if (message.includes("not a valid GitHub username") || message.includes("required")) {
        return res.status(400).json({ error: message });
      }
      if (message.includes("timed out")) {
        return res.status(504).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  }
);

// GET /github/user/:username
router.get(
  "/github/user/:username",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const username = req.params.username;
      const analysis = await fetchAndAnalyzeGitHub(username);
      return res.status(200).json({ analysis });
    } catch (err: any) {
      const message = err?.message || "Failed to fetch GitHub account";
      if (message.includes("not found")) {
        return res.status(404).json({ error: message });
      }
      if (message.includes("rate limit")) {
        return res.status(429).json({ error: message });
      }
      return res.status(400).json({ error: message });
    }
  }
);

// GET /github/latest
router.get(
  "/github/latest",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName, isDemoUser } = req.auth;
      await ensureUser(userId, email, fullName, isDemoUser);

      const analysis = await getLatestGitHubAnalysis(userId);
      return res.status(200).json({
        analysis,
        apiDisclaimer:
          "Public API Disclosure: Analysis uses the official GitHub REST API v3 to retrieve public repositories, languages, stars, and update dates. Private repositories and private commit graphs are not accessible without explicit OAuth token authorization.",
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
