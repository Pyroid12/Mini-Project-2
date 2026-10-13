import { Router } from "express";
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser } from "../lib/user";
import { extractResumeText } from "../services/resumeExtractor";
import { analyzeResumeText } from "../services/resume";
import {
  saveResumeAnalysis,
  getResumeAnalysesForUser,
  getLatestResumeAnalysis,
} from "../lib/data";
import { assertSafeResumeFile } from "../lib/fileValidation";
import { resumeUploadMetaSchema } from "../validators";

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTS = new Set([".pdf", ".docx"]);

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
      return cb(new Error("Invalid file type. Only PDF and DOCX are allowed."));
    }
    cb(null, true);
  },
});

// POST /api/ai/resume-analyze
router.post(
  "/ai/resume-analyze",
  requireAuth,
  upload.single("resume"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No resume file uploaded." });
      }

      const { userId, isDemoUser, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName, isDemoUser);

      const meta = resumeUploadMetaSchema.safeParse({
        targetRole: req.body?.targetRole,
      });
      const targetRole = meta.success ? meta.data.targetRole || "" : "";
      const filePath = req.file.path;

      try {
        await assertSafeResumeFile(filePath, req.file.mimetype);
      } catch (err) {
        await fs.unlink(filePath).catch(() => {});
        const msg = err instanceof Error ? err.message : "Invalid resume file.";
        return res.status(400).json({ error: msg });
      }

      let text: string;
      try {
        text = await extractResumeText(filePath, req.file.mimetype);
      } catch (err) {
        await fs.unlink(filePath).catch(() => {});
        const msg = err instanceof Error ? err.message : "Failed to extract text from resume.";
        return res.status(400).json({ error: msg });
      }

      await fs.unlink(filePath).catch(() => {});

      if (!text || text.trim().length < 20) {
        return res.status(400).json({
          error:
            "Could not extract readable text from the resume. Please ensure the file contains selectable text (not a scanned image).",
        });
      }

      const result = await analyzeResumeText(text, targetRole || undefined);
      if (!result.ok || !result.data) {
        return res.status(502).json({
          error: result.error || "Resume analysis failed. Please try again.",
        });
      }

      const saved = await saveResumeAnalysis({
        clerkUserId: userId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        atsScore: result.data.atsScore,
        summary: result.data.summary,
        strengths: result.data.strengths,
        weaknesses: result.data.weaknesses,
        missingSkills: result.data.missingSkills,
        recommendations: result.data.recommendations,
        suggestedKeywords: result.data.suggestedKeywords,
        experienceTips: result.data.experienceTips,
        projectTips: result.data.projectTips,
        targetRole: targetRole || null,
      });

      return res.json({
        analysis: saved,
        demoRestricted: isDemoUser,
        approximateScoreNotice:
          "ATS score is an approximate evaluation and not a guarantee of ATS performance or placement success.",
      });
    } catch (err) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(err);
    }
  }
);

// GET /api/resume-analyses
router.get("/resume-analyses", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const analyses = await getResumeAnalysesForUser(req.auth.userId);
    return res.json({ analyses });
  } catch (err) {
    next(err);
  }
});

// GET /api/resume-analyses/latest
router.get(
  "/resume-analyses/latest",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const latest = await getLatestResumeAnalysis(req.auth.userId);
      return res.json({ analysis: latest });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
