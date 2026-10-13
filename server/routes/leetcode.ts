// ============================================================
// CareerBuddy AI - LeetCode Routes (Phase 4)
// Automated GraphQL sync + Verified Calendar/Streak + Manual Tracking Mode
// ============================================================

import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { ensureUser } from "../lib/user";
import {
  leetcodeSyncRequestSchema,
  leetcodeManualRequestSchema,
  leetcodeLogProblemSchema,
  leetcodeUpdateGoalSchema,
} from "../validators";
import {
  fetchLeetCodeStats,
  generateCurrentWeeklyActivity,
  computeCurrentStreak,
  recalculateManualMetrics,
  extractCleanLeetCodeUsername,
} from "../services/leetcode";
import {
  saveLeetCodeProgress,
  getLeetCodeProgressForUser,
} from "../lib/data";
import { generateId, type StoredLeetCodeProblemEntry } from "../lib/store";

const router = Router();

// GET /leetcode/data
router.get(
  "/leetcode/data",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const progress = await getLeetCodeProgressForUser(userId);
      if (!progress) {
        return res.status(200).json({
          progress: null,
          weeklyActivity: generateCurrentWeeklyActivity([]),
          notice: "No LeetCode profile linked. Connect your username to start tracking.",
        });
      }

      const weeklyActivity = generateCurrentWeeklyActivity(
        progress.weeklyHistory || []
      );
      const todayStr = new Date().toISOString().split("T")[0];
      const todayActivity = weeklyActivity.find((d) => d.date === todayStr);
      const solvedToday = todayActivity ? todayActivity.solved : 0;
      const currentStreak = computeCurrentStreak(progress.weeklyHistory || []);

      const dynamicProgress = {
        ...progress,
        dailyGoalCurrent: solvedToday,
        streak: currentStreak,
        weeklyHistory: weeklyActivity,
        weeklyGoalCurrent: weeklyActivity.reduce((sum, d) => sum + d.solved, 0),
      };

      return res.status(200).json({
        progress: dynamicProgress,
        weeklyActivity,
        notice:
          progress.source === "synced"
            ? "Data synchronized directly from public LeetCode profile."
            : "Displaying verified manual problem logs.",
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /leetcode/sync
router.post(
  "/leetcode/sync",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      // Handle raw body or query string fallbacks
      let bodyData = req.body;
      if (!bodyData || (typeof bodyData === "object" && Object.keys(bodyData).length === 0)) {
        if (typeof req.query.username === "string") {
          bodyData = { username: req.query.username };
        }
      } else if (typeof bodyData === "string") {
        try {
          bodyData = JSON.parse(bodyData);
        } catch {
          bodyData = { username: bodyData };
        }
      }

      const parsed = leetcodeSyncRequestSchema.safeParse(bodyData);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request payload. Please provide a valid username.",
          details: parsed.error.issues,
        });
      }

      const rawUsername = parsed.data.username;
      const cleanUsername = extractCleanLeetCodeUsername(rawUsername);
      if (!cleanUsername) {
        return res.status(400).json({
          error: "Please enter a valid LeetCode username.",
        });
      }

      const stats = await fetchLeetCodeStats(cleanUsername);
      const existing = await getLeetCodeProgressForUser(userId);

      const dailyGoalTarget = existing?.dailyGoalTarget || 3;
      const weeklyGoalTarget = existing?.weeklyGoalTarget || 20;

      // Preserve existing manual problemEntries so they are never erased when syncing
      const preservedProblemEntries = existing?.problemEntries || [];

      const saved = await saveLeetCodeProgress({
        clerkUserId: userId,
        username: stats.username,
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        ranking: stats.ranking,
        reputation: stats.reputation,
        avatarUrl: stats.avatarUrl,
        realName: stats.realName,
        acceptanceRate: stats.acceptanceRate,
        totalSubmissions: stats.totalSubmissions,
        streak: stats.streak,
        isStreakVerified: stats.isStreakVerified,
        dailyGoalTarget,
        dailyGoalCurrent: stats.dailyGoalCurrent,
        weeklyGoalTarget,
        weeklyGoalCurrent: stats.weeklyHistory.reduce(
          (sum, d) => sum + d.solved,
          0
        ),
        weeklyHistory: stats.weeklyHistory,
        recentSubmissions: stats.recentSubmissions,
        problemEntries: preservedProblemEntries,
        source: "synced",
        lastSyncedAt: new Date().toISOString(),
      });

      return res.status(200).json({
        progress: saved,
        weeklyActivity: saved.weeklyHistory,
        source: "synced",
        message: `Successfully synchronized metrics for @${saved.username} from LeetCode.`,
      });
    } catch (err: any) {
      const message =
        err?.message ||
        "Could not sync with LeetCode. You can track your statistics reliably using Manual Entry Mode.";
      return res.status(400).json({
        error: message,
      });
    }
  }
);

// POST /leetcode/problem - Log a manual problem entry (with duplicate prevention)
router.post(
  "/leetcode/problem",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const parsed = leetcodeLogProblemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid problem entry data",
          details: parsed.error.issues,
        });
      }

      const input = parsed.data;
      const existing = await getLeetCodeProgressForUser(userId);
      const existingEntries: StoredLeetCodeProblemEntry[] = [
        ...(existing?.problemEntries || []),
      ];

      const completedAt =
        input.completedAt || new Date().toISOString().split("T")[0];

      // Check if updating existing entry by id
      let entryIndex = -1;
      if (input.id) {
        entryIndex = existingEntries.findIndex((e) => e.id === input.id);
      } else {
        // Prevent duplicate problem completion from inflating unique totals
        const normalizedInputKey = input.problemUrlOrId.trim().toLowerCase();
        entryIndex = existingEntries.findIndex(
          (e) =>
            e.problemUrlOrId.trim().toLowerCase() === normalizedInputKey ||
            e.title.trim().toLowerCase() === input.title.trim().toLowerCase()
        );
      }

      const nowIso = new Date().toISOString();
      let updatedOrNewEntry: StoredLeetCodeProblemEntry;

      if (entryIndex >= 0) {
        // Update existing entry
        updatedOrNewEntry = {
          ...existingEntries[entryIndex],
          title: input.title.trim(),
          problemUrlOrId: input.problemUrlOrId.trim(),
          difficulty: input.difficulty,
          completedAt,
          topic: input.topic?.trim() || existingEntries[entryIndex].topic,
          notes: input.notes?.trim() ?? existingEntries[entryIndex].notes,
        };
        existingEntries[entryIndex] = updatedOrNewEntry;
      } else {
        // New entry
        updatedOrNewEntry = {
          id: generateId(),
          title: input.title.trim(),
          problemUrlOrId: input.problemUrlOrId.trim(),
          difficulty: input.difficulty,
          completedAt,
          topic: input.topic?.trim(),
          notes: input.notes?.trim(),
          createdAt: nowIso,
        };
        existingEntries.unshift(updatedOrNewEntry);
      }

      // Recalculate metrics from updated entries
      const dailyGoalTarget = existing?.dailyGoalTarget || 3;
      const weeklyGoalTarget = existing?.weeklyGoalTarget || 20;

      const calc = recalculateManualMetrics(
        existing,
        existingEntries,
        dailyGoalTarget,
        weeklyGoalTarget
      );

      const saved = await saveLeetCodeProgress({
        clerkUserId: userId,
        username: existing?.username || "manual_coder",
        totalSolved: calc.totalSolved,
        easySolved: calc.easySolved,
        mediumSolved: calc.mediumSolved,
        hardSolved: calc.hardSolved,
        ranking: existing?.ranking || null,
        streak: calc.streak,
        isStreakVerified: false,
        dailyGoalTarget,
        dailyGoalCurrent: calc.dailyGoalCurrent,
        weeklyGoalTarget,
        weeklyGoalCurrent: calc.weeklyGoalCurrent,
        weeklyHistory: calc.weeklyHistory,
        problemEntries: existingEntries,
        recentSubmissions: existing?.recentSubmissions || [],
        source: "manual",
        lastSyncedAt: existing?.lastSyncedAt || null,
      });

      return res.status(200).json({
        progress: saved,
        weeklyActivity: saved.weeklyHistory,
        entry: updatedOrNewEntry,
        message:
          entryIndex >= 0
            ? "Problem entry updated successfully."
            : "Problem logged and practice streak updated!",
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /leetcode/problem/:id - Delete a logged problem
router.delete(
  "/leetcode/problem/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const { id } = req.params;
      const existing = await getLeetCodeProgressForUser(userId);
      const filteredEntries = (existing?.problemEntries || []).filter(
        (e) => e.id !== id
      );

      const dailyGoalTarget = existing?.dailyGoalTarget || 3;
      const weeklyGoalTarget = existing?.weeklyGoalTarget || 20;

      const calc = recalculateManualMetrics(
        existing,
        filteredEntries,
        dailyGoalTarget,
        weeklyGoalTarget
      );

      const saved = await saveLeetCodeProgress({
        clerkUserId: userId,
        username: existing?.username || "manual_coder",
        totalSolved: calc.totalSolved,
        easySolved: calc.easySolved,
        mediumSolved: calc.mediumSolved,
        hardSolved: calc.hardSolved,
        ranking: existing?.ranking || null,
        streak: calc.streak,
        isStreakVerified: false,
        dailyGoalTarget,
        dailyGoalCurrent: calc.dailyGoalCurrent,
        weeklyGoalTarget,
        weeklyGoalCurrent: calc.weeklyGoalCurrent,
        weeklyHistory: calc.weeklyHistory,
        problemEntries: filteredEntries,
        recentSubmissions: existing?.recentSubmissions || [],
        source: existing?.source || "manual",
        lastSyncedAt: existing?.lastSyncedAt || null,
      });

      return res.status(200).json({
        progress: saved,
        weeklyActivity: saved.weeklyHistory,
        message: "Problem entry deleted and statistics updated.",
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /leetcode/goal - Update daily goal target
router.put(
  "/leetcode/goal",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const parsed = leetcodeUpdateGoalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid goal parameters",
          details: parsed.error.issues,
        });
      }

      const { dailyGoalTarget, weeklyGoalTarget } = parsed.data;
      const existing = await getLeetCodeProgressForUser(userId);

      const saved = await saveLeetCodeProgress({
        clerkUserId: userId,
        username: existing?.username || "student_coder",
        totalSolved: existing?.totalSolved || 0,
        easySolved: existing?.easySolved || 0,
        mediumSolved: existing?.mediumSolved || 0,
        hardSolved: existing?.hardSolved || 0,
        ranking: existing?.ranking || null,
        streak: existing?.streak || 0,
        isStreakVerified: existing?.isStreakVerified,
        dailyGoalTarget,
        dailyGoalCurrent: existing?.dailyGoalCurrent || 0,
        weeklyGoalTarget: weeklyGoalTarget || existing?.weeklyGoalTarget || 20,
        weeklyGoalCurrent: existing?.weeklyGoalCurrent || 0,
        weeklyHistory: existing?.weeklyHistory || [],
        problemEntries: existing?.problemEntries || [],
        recentSubmissions: existing?.recentSubmissions || [],
        source: existing?.source || "manual",
        lastSyncedAt: existing?.lastSyncedAt || null,
      });

      return res.status(200).json({
        progress: saved,
        message: `Daily goal target updated to ${dailyGoalTarget} problems/day.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /leetcode/manual - Quick manual total overwrite mode
router.post(
  "/leetcode/manual",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const { userId, email, fullName } = req.auth;
      await ensureUser(userId, email, fullName);

      const parsed = leetcodeManualRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request payload",
          details: parsed.error.issues,
        });
      }

      const data = parsed.data;
      const existing = await getLeetCodeProgressForUser(userId);

      const todayStr = new Date().toISOString().split("T")[0];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[new Date().getDay()];

      const solvedToday =
        data.solvedToday !== undefined
          ? data.solvedToday
          : (data.dailyGoalCurrent ?? 0);

      // Update or insert today's entry
      const history = [...(existing?.weeklyHistory || [])];
      const todayIdx = history.findIndex((h) => h.date === todayStr);

      if (todayIdx >= 0) {
        history[todayIdx].solved = solvedToday;
      } else {
        history.push({ day: dayName, date: todayStr, solved: solvedToday });
      }

      const trimmedHistory = history.slice(-30);
      const weeklyActivity = generateCurrentWeeklyActivity(trimmedHistory);
      const streak = computeCurrentStreak(trimmedHistory);

      const saved = await saveLeetCodeProgress({
        clerkUserId: userId,
        username: data.username || existing?.username || "manual_coder",
        totalSolved: data.totalSolved,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        ranking: existing?.ranking || null,
        streak,
        isStreakVerified: false,
        dailyGoalTarget: data.dailyGoalTarget,
        dailyGoalCurrent: solvedToday,
        weeklyGoalTarget: data.weeklyGoalTarget,
        weeklyGoalCurrent: Math.min(
          data.weeklyGoalTarget,
          trimmedHistory.slice(-7).reduce((sum, h) => sum + h.solved, 0)
        ),
        weeklyHistory: weeklyActivity,
        problemEntries: existing?.problemEntries || [],
        recentSubmissions: existing?.recentSubmissions || [],
        source: "manual",
        lastSyncedAt: existing?.lastSyncedAt || null,
      });

      return res.status(200).json({
        progress: saved,
        weeklyActivity: saved.weeklyHistory,
        source: "manual",
        message: "Manually updated LeetCode statistics saved successfully.",
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
