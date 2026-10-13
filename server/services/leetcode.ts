// ============================================================
// CareerBuddy AI - LeetCode Progress Tracking Service (Phase 4)
// Automated GraphQL sync + Verified Calendar/Streak + Manual Tracking Mode
// ============================================================

import type {
  StoredLeetCodeProblemEntry,
  StoredLeetCodeRecentSubmission,
  StoredLeetCodeProgress,
} from "../lib/store";

export interface LeetCodeSyncStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  reputation: number | null;
  avatarUrl: string | null;
  realName: string | null;
  acceptanceRate: string | null;
  totalSubmissions: number | null;
  streak: number;
  isStreakVerified: boolean;
  dailyGoalCurrent: number;
  weeklyHistory: { day: string; date: string; solved: number }[];
  recentSubmissions: StoredLeetCodeRecentSubmission[];
  source: "synced";
}

export interface DayActivity {
  day: string;
  date: string;
  solved: number;
}

/**
 * Clean and extract a valid LeetCode username from user input,
 * accepting plain usernames, usernames with @, or full profile URLs like:
 * - https://leetcode.com/u/username/
 * - https://leetcode.com/username/
 * - leetcode.com/username
 * - @username
 */
export function extractCleanLeetCodeUsername(input: string): string {
  if (!input) return "";
  let clean = input.trim();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?/i, "");
  clean = clean.replace(/^@/, "").replace(/\/.*$/, "").trim();
  return clean;
}

/**
 * Calculates current streak given a list of date items with solved counts
 */
export function computeCurrentStreak(
  history: { date: string; solved: number }[]
): number {
  if (!history || history.length === 0) return 0;

  const dateMap = new Map<string, number>();
  for (const item of history) {
    if (item.solved > 0) {
      dateMap.set(item.date, (dateMap.get(item.date) || 0) + item.solved);
    }
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const hasSolvedToday = (dateMap.get(todayStr) || 0) > 0;
  const hasSolvedYesterday = (dateMap.get(yesterdayStr) || 0) > 0;

  if (!hasSolvedToday && !hasSolvedYesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(hasSolvedToday ? now : yesterday);

  while (true) {
    const curStr = checkDate.toISOString().split("T")[0];
    if ((dateMap.get(curStr) || 0) > 0) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generates last 7 days of weekly activity
 */
export function generateCurrentWeeklyActivity(
  history: { day?: string; date: string; solved: number }[] = []
): DayActivity[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result: DayActivity[] = [];
  const now = new Date();

  const historyMap = new Map<string, number>();
  for (const h of history) {
    if (h.date) {
      historyMap.set(h.date, (historyMap.get(h.date) || 0) + (h.solved || 0));
    }
  }

  // Generate last 7 days ending today
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = days[d.getDay()];

    result.push({
      day: dayName,
      date: dateStr,
      solved: historyMap.get(dateStr) || 0,
    });
  }

  return result;
}

/**
 * Parses LeetCode's submissionCalendar JSON map { [timestampInSeconds]: count }
 * to extract verified streak, weekly activity, and today's solved count.
 */
export function parseSubmissionCalendar(calendarStr: string | null | undefined): {
  streak: number;
  isStreakVerified: boolean;
  weeklyHistory: DayActivity[];
  solvedToday: number;
} {
  if (!calendarStr || calendarStr === "{}" || calendarStr === "") {
    return {
      streak: 0,
      isStreakVerified: true,
      weeklyHistory: generateCurrentWeeklyActivity([]),
      solvedToday: 0,
    };
  }

  try {
    const rawMap: Record<string, number> =
      typeof calendarStr === "string" ? JSON.parse(calendarStr) : calendarStr;

    const dateMap = new Map<string, number>();
    for (const [ts, count] of Object.entries(rawMap)) {
      const numTs = Number(ts);
      if (!isNaN(numTs)) {
        const d = new Date(numTs * 1000);
        const dateStr = d.toISOString().split("T")[0];
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + Number(count));
      }
    }

    const historyItems: { date: string; solved: number }[] = [];
    for (const [date, solved] of dateMap.entries()) {
      historyItems.push({ date, solved });
    }

    const streak = computeCurrentStreak(historyItems);
    const weeklyHistory = generateCurrentWeeklyActivity(historyItems);
    const todayStr = new Date().toISOString().split("T")[0];
    const solvedToday = dateMap.get(todayStr) || 0;

    return {
      streak,
      isStreakVerified: true,
      weeklyHistory,
      solvedToday,
    };
  } catch {
    return {
      streak: 0,
      isStreakVerified: false,
      weeklyHistory: generateCurrentWeeklyActivity([]),
      solvedToday: 0,
    };
  }
}

/**
 * Primary live retrieval via LeetCode's public GraphQL endpoint.
 * Fallback to community API if blocked/throttled.
 */
export async function fetchLeetCodeStats(
  username: string
): Promise<LeetCodeSyncStats> {
  const cleanUsername = extractCleanLeetCodeUsername(username);
  if (!cleanUsername) {
    throw new Error("Please enter a valid LeetCode username.");
  }

  const usernameRegex = /^[a-zA-Z0-9_\-]{1,100}$/;
  if (!usernameRegex.test(cleanUsername)) {
    throw new Error(
      "Invalid LeetCode username format. Usernames should only contain letters, numbers, hyphens, or underscores."
    );
  }

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
          realName
          userAvatar
        }
        submissionCalendar
      }
      recentSubmissionList(username: $username) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  // 1. Try official LeetCode GraphQL endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: `https://leetcode.com/${encodeURIComponent(cleanUsername)}/`,
      },
      body: JSON.stringify({
        query,
        variables: { username: cleanUsername },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.status === 429) {
      throw new Error(
        "LeetCode API request limit reached. Please wait a few moments or use Manual Entry Mode."
      );
    }

    if (res.ok) {
      const data = await res.json();
      if (!data?.data?.matchedUser) {
        throw new Error(
          `LeetCode user "${cleanUsername}" was not found or has set their profile to private.`
        );
      }

      const matched = data.data.matchedUser;
      const acSubs: { difficulty: string; count: number; submissions: number }[] =
        matched.submitStats?.acSubmissionNum || [];
      const totalSubs: { difficulty: string; count: number; submissions: number }[] =
        matched.submitStats?.totalSubmissionNum || [];

      let totalSolved = 0;
      let easySolved = 0;
      let mediumSolved = 0;
      let hardSolved = 0;
      let totalAcSubmissions = 0;

      for (const sub of acSubs) {
        if (sub.difficulty === "All") {
          totalSolved = sub.count;
          totalAcSubmissions = sub.submissions;
        } else if (sub.difficulty === "Easy") {
          easySolved = sub.count;
        } else if (sub.difficulty === "Medium") {
          mediumSolved = sub.count;
        } else if (sub.difficulty === "Hard") {
          hardSolved = sub.count;
        }
      }

      let totalAllSubmissions = 0;
      for (const sub of totalSubs) {
        if (sub.difficulty === "All") {
          totalAllSubmissions = sub.submissions;
        }
      }

      const acceptanceRate =
        totalAllSubmissions > 0
          ? `${((totalAcSubmissions / totalAllSubmissions) * 100).toFixed(1)}%`
          : null;

      const calendarParsed = parseSubmissionCalendar(matched.submissionCalendar);

      const rawRecent = data.data.recentSubmissionList || [];
      const recentSubmissions: StoredLeetCodeRecentSubmission[] = rawRecent
        .slice(0, 10)
        .map((sub: any) => ({
          title: sub.title,
          titleSlug: sub.titleSlug,
          timestamp: sub.timestamp
            ? new Date(Number(sub.timestamp) * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "",
          statusDisplay: sub.statusDisplay || "Accepted",
          lang: sub.lang || "code",
        }));

      return {
        username: matched.username,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: matched.profile?.ranking || null,
        reputation: matched.profile?.reputation || null,
        avatarUrl: matched.profile?.userAvatar || null,
        realName: matched.profile?.realName || null,
        acceptanceRate,
        totalSubmissions: totalAllSubmissions || null,
        streak: calendarParsed.streak,
        isStreakVerified: calendarParsed.isStreakVerified,
        dailyGoalCurrent: calendarParsed.solvedToday,
        weeklyHistory: calendarParsed.weeklyHistory,
        recentSubmissions,
        source: "synced",
      };
    }
  } catch (err: any) {
    if (err?.message?.includes("was not found")) {
      throw err;
    }
    console.warn("[leetcode] Primary GraphQL failed, trying secondary fallback:", err?.message);
  }

  // 2. Secondary fallback via verified community REST endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const fallbackRes = await fetch(
      `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(cleanUsername)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      if (data && typeof data.totalSolved === "number") {
        const calendarParsed = parseSubmissionCalendar(data.submissionCalendar);
        const rawRecent = Array.isArray(data.recentSubmissions)
          ? data.recentSubmissions.slice(0, 10)
          : [];

        const recentSubmissions: StoredLeetCodeRecentSubmission[] = rawRecent.map(
          (sub: any) => ({
            title: sub.title || sub.titleSlug || "Problem",
            titleSlug: sub.titleSlug || "",
            timestamp: sub.timestamp
              ? new Date(Number(sub.timestamp) * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "",
            statusDisplay: sub.statusDisplay || "Accepted",
            lang: sub.lang || "code",
          })
        );

        return {
          username: cleanUsername,
          totalSolved: data.totalSolved || 0,
          easySolved: data.easySolved || 0,
          mediumSolved: data.mediumSolved || 0,
          hardSolved: data.hardSolved || 0,
          ranking: data.ranking || null,
          reputation: data.reputation || null,
          avatarUrl: data.avatar || null,
          realName: data.name || null,
          acceptanceRate:
            data.totalSubmissions > 0
              ? `${((data.totalSolved / data.totalSubmissions) * 100).toFixed(1)}%`
              : null,
          totalSubmissions: data.totalSubmissions || null,
          streak: calendarParsed.streak,
          isStreakVerified: calendarParsed.isStreakVerified,
          dailyGoalCurrent: calendarParsed.solvedToday,
          weeklyHistory: calendarParsed.weeklyHistory,
          recentSubmissions,
          source: "synced",
        };
      }
    }
  } catch (fallbackErr: any) {
    console.warn("[leetcode] Fallback endpoint failed:", fallbackErr?.message);
  }

  throw new Error(
    `Unable to synchronize statistics for LeetCode user "${cleanUsername}". LeetCode may have restricted public access or the account does not exist. You can log your progress with 100% accuracy using the Manual Entry mode.`
  );
}

/**
 * Normalizes problem identifier to prevent duplicates:
 * e.g., "https://leetcode.com/problems/two-sum/description/" -> "two-sum"
 */
export function normalizeProblemIdentifier(input: string): string {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?leetcode\.com\/problems\//i, "");
  cleaned = cleaned.replace(/\/(?:description|solution|submissions).*$/i, "");
  cleaned = cleaned.replace(/\/$/, "");
  return cleaned.toLowerCase();
}

/**
 * Recalculates manual statistics from a set of problem entries,
 * preventing duplicate problem completions from inflating unique totals.
 */
export function recalculateManualMetrics(
  existingProgress: StoredLeetCodeProgress | null,
  entries: StoredLeetCodeProblemEntry[],
  dailyGoalTarget: number = 3,
  weeklyGoalTarget: number = 20
): {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  dailyGoalCurrent: number;
  weeklyGoalCurrent: number;
  weeklyHistory: DayActivity[];
} {
  // Deduplicate entries by normalized identifier to calculate UNIQUE solved problems
  const uniqueMap = new Map<string, StoredLeetCodeProblemEntry>();
  for (const entry of entries) {
    const key = normalizeProblemIdentifier(entry.problemUrlOrId) || entry.title.trim().toLowerCase();
    // Keep latest completed entry for duplicate keys
    uniqueMap.set(key, entry);
  }

  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  for (const entry of uniqueMap.values()) {
    if (entry.difficulty === "Easy") easySolved++;
    else if (entry.difficulty === "Medium") mediumSolved++;
    else if (entry.difficulty === "Hard") hardSolved++;
  }
  const totalSolved = easySolved + mediumSolved + hardSolved;

  // Build date activity from all entries (activity count per date)
  const dateCounts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.completedAt) {
      dateCounts.set(entry.completedAt, (dateCounts.get(entry.completedAt) || 0) + 1);
    }
  }

  const historyItems: { date: string; solved: number }[] = [];
  for (const [date, solved] of dateCounts.entries()) {
    historyItems.push({ date, solved });
  }

  const streak = computeCurrentStreak(historyItems);
  const weeklyHistory = generateCurrentWeeklyActivity(historyItems);

  const todayStr = new Date().toISOString().split("T")[0];
  const dailyGoalCurrent = dateCounts.get(todayStr) || 0;
  const weeklyGoalCurrent = weeklyHistory.reduce((sum, d) => sum + d.solved, 0);

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    streak,
    dailyGoalCurrent,
    weeklyGoalCurrent,
    weeklyHistory,
  };
}
