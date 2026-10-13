// ============================================================
// CareerBuddy AI - GitHub Profile Analysis Service
// Uses official GitHub REST API (v3) with full pagination
// ============================================================

export interface GitHubRepoItem {
  id?: number;
  name: string;
  description: string | null;
  language: string | null;
  languageColor: string;
  stars: number;
  forks: number;
  updated: string;
  updatedAt?: string;
  url: string;
  isFork: boolean;
  openIssues?: number;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
  count: number;
}

export interface GitHubAnalysisResult {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl: string;
  createdAt: string | null;
  location: string | null;
  company: string | null;
  totalStars: number;
  totalForks: number;
  languages: LanguageStat[];
  topRepos: GitHubRepoItem[];
  allRepos: GitHubRepoItem[];
  inferredSkills: string[];
  qualitySuggestions: string[];
  recommendedSteps: string[];
  apiDisclaimer: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#DEA584",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Shell: "#89E051",
  Vue: "#41B883",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  Other: "#94A3B8",
};

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "recently";
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (isNaN(diffMs)) return dateString;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } catch {
    return dateString;
  }
}

// Helper to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export function extractCleanGitHubUsername(input: string): string {
  let clean = input.trim();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
  clean = clean.replace(/^@/, "").replace(/\/.*$/, "").trim();
  return clean;
}

export async function fetchAndAnalyzeGitHub(
  username: string
): Promise<GitHubAnalysisResult> {
  const cleanUsername = extractCleanGitHubUsername(username);

  // Validate GitHub username
  const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  if (!cleanUsername || !usernameRegex.test(cleanUsername)) {
    throw new Error(
      `"${username}" is not a valid GitHub username. Usernames may only contain alphanumeric characters or single hyphens.`
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CareerBuddy-AI-LiveAnalytics",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // 1. Fetch User Profile
  let userRes: Response;
  try {
    userRes = await fetchWithTimeout(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`,
      { headers },
      12000
    );
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(
        "Request timed out while connecting to GitHub. Please check your internet connection."
      );
    }
    throw new Error(`Failed to reach GitHub API: ${err?.message || "Network error"}`);
  }

  if (userRes.status === 404) {
    throw new Error(`GitHub user "${cleanUsername}" was not found.`);
  }

  if (userRes.status === 403) {
    const rateLimitRemaining = userRes.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      throw new Error(
        "GitHub API request limit has been reached for unauthenticated requests. Please wait a few minutes before trying again."
      );
    }
    throw new Error("GitHub API access was denied. Please verify user permissions.");
  }

  if (!userRes.ok) {
    throw new Error(`Failed to fetch GitHub profile (HTTP ${userRes.status}).`);
  }

  const userData = await userRes.json();

  // 2. Fetch all Accessible Public Repositories with Pagination
  const allReposData: any[] = [];
  const seenRepoIds = new Set<number>();
  let page = 1;
  const perPage = 100;
  const maxPages = 10; // Supports up to 1000 repositories without hanging

  while (page <= maxPages) {
    const reposUrl = `https://api.github.com/users/${encodeURIComponent(
      cleanUsername
    )}/repos?per_page=${perPage}&page=${page}&sort=updated`;

    try {
      const pageRes = await fetchWithTimeout(reposUrl, { headers }, 12000);
      if (pageRes.status === 403) {
        // Stop pagination if rate limited mid-way
        break;
      }
      if (!pageRes.ok) break;

      const pageItems: any[] = await pageRes.json();
      if (!Array.isArray(pageItems) || pageItems.length === 0) break;

      for (const repo of pageItems) {
        if (repo.id && !seenRepoIds.has(repo.id)) {
          seenRepoIds.add(repo.id);
          allReposData.push(repo);
        }
      }

      // If less than perPage, we've reached the final page
      if (pageItems.length < perPage) break;
      page++;
    } catch {
      // If a subsequent page fails, continue with already collected repos
      break;
    }
  }

  // 3. Compute Live Metrics across all fetched repositories
  let totalStars = 0;
  let totalForks = 0;
  const langCounts: Record<string, number> = {};
  const inferredSkillSet = new Set<string>();

  for (const repo of allReposData) {
    totalStars += Number(repo.stargazers_count) || 0;
    totalForks += Number(repo.forks_count) || 0;

    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      inferredSkillSet.add(repo.language);
    }

    // Extract keywords from name, description, and topics
    const desc = `${repo.name || ""} ${repo.description || ""}`.toLowerCase();
    const techKeywords: Record<string, string> = {
      react: "React",
      nextjs: "Next.js",
      "next.js": "Next.js",
      tailwind: "Tailwind CSS",
      typescript: "TypeScript",
      javascript: "JavaScript",
      python: "Python",
      fastapi: "FastAPI",
      docker: "Docker",
      postgres: "PostgreSQL",
      postgresql: "PostgreSQL",
      mongodb: "MongoDB",
      graphql: "GraphQL",
      redis: "Redis",
      pytorch: "PyTorch",
      tensorflow: "TensorFlow",
      node: "Node.js",
      express: "Express",
      kubernetes: "Kubernetes",
      prisma: "Prisma ORM",
      kotlin: "Kotlin",
      flutter: "Flutter",
      aws: "AWS",
      linux: "Linux",
    };

    for (const [key, label] of Object.entries(techKeywords)) {
      if (desc.includes(key)) {
        inferredSkillSet.add(label);
      }
    }

    if (Array.isArray(repo.topics)) {
      for (const topic of repo.topics) {
        const t = String(topic).toLowerCase();
        for (const [key, label] of Object.entries(techKeywords)) {
          if (t === key) inferredSkillSet.add(label);
        }
      }
    }
  }

  // 4. Calculate Language Distribution (using repositories with a known language as denominator)
  const reposWithKnownLanguage = allReposData.filter((r) => Boolean(r.language));
  const denominator = reposWithKnownLanguage.length;

  const languages: LanguageStat[] = Object.entries(langCounts)
    .map(([name, count]) => {
      const percentage =
        denominator > 0 ? Math.round((count / denominator) * 100) : 0;
      return {
        name,
        count,
        percentage,
        color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Normalize percentages so they sum to 100%
  if (languages.length > 0) {
    const sum = languages.reduce((s, l) => s + l.percentage, 0);
    if (sum !== 100 && languages[0]) {
      languages[0].percentage += 100 - sum;
    }
  }

  // 5. Build Repository Items (Featured and Full List)
  const mapRepoItem = (repo: any): GitHubRepoItem => ({
    id: repo.id,
    name: repo.name,
    description: repo.description || null,
    language: repo.language || null,
    languageColor: repo.language
      ? LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.Other
      : "#94A3B8",
    stars: Number(repo.stargazers_count) || 0,
    forks: Number(repo.forks_count) || 0,
    updated: formatTimeAgo(repo.pushed_at || repo.updated_at),
    updatedAt: repo.pushed_at || repo.updated_at,
    url: repo.html_url || `https://github.com/${cleanUsername}/${repo.name}`,
    isFork: Boolean(repo.fork),
    openIssues: Number(repo.open_issues_count) || 0,
  });

  // Sort by updated / pushed date for live accuracy
  const sortedByRecent = [...allReposData].sort((a, b) => {
    const timeA = new Date(a.pushed_at || a.updated_at).getTime() || 0;
    const timeB = new Date(b.pushed_at || b.updated_at).getTime() || 0;
    return timeB - timeA;
  });

  const allRepos: GitHubRepoItem[] = sortedByRecent.map(mapRepoItem);

  // Top 6 Featured Repositories: prioritize non-forks with highest stars / activity
  const sortedFeatured = [...allReposData].sort((a, b) => {
    // Non-forks take precedence
    if (!a.fork && b.fork) return -1;
    if (a.fork && !b.fork) return 1;
    // Next, sort by stars
    if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
      return (b.stargazers_count || 0) - (a.stargazers_count || 0);
    }
    // Then by recent activity
    const timeA = new Date(a.pushed_at || a.updated_at).getTime() || 0;
    const timeB = new Date(b.pushed_at || b.updated_at).getTime() || 0;
    return timeB - timeA;
  });

  const topRepos: GitHubRepoItem[] = sortedFeatured.slice(0, 6).map(mapRepoItem);

  // 6. Project Quality Suggestions based on REAL data
  const qualitySuggestions: string[] = [];
  const reposMissingDesc = allReposData.filter((r) => !r.description).length;
  if (reposMissingDesc > 0 && allReposData.length > 0) {
    qualitySuggestions.push(
      `${reposMissingDesc} of your ${allReposData.length} public repos lack descriptions. Adding clear summaries helps recruiters understand project purpose.`
    );
  }

  const reposMissingLicense = allReposData.filter((r) => !r.license).length;
  if (reposMissingLicense > 0 && allReposData.length >= 2) {
    qualitySuggestions.push(
      "Include open-source licenses (such as MIT or Apache-2.0) on your flagship projects to demonstrate industry readiness."
    );
  }

  if (totalStars < 5 && allReposData.length >= 2) {
    qualitySuggestions.push(
      "Create high-impact README files with live demo links, architecture diagrams, and installation guides to earn project recognition."
    );
  }

  const hasRecentActivity = allReposData.some((r) => {
    const diffDays =
      (Date.now() - new Date(r.pushed_at || r.updated_at).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays < 45;
  });

  if (!hasRecentActivity && allReposData.length > 0) {
    qualitySuggestions.push(
      "No public commits detected in the last 45 days. Consistent commit frequency signals proactive engineering discipline to campus hiring teams."
    );
  }

  if (qualitySuggestions.length === 0 && allReposData.length > 0) {
    qualitySuggestions.push(
      "Good repository hygiene! Continue writing clear commits and providing comprehensive README documentation."
    );
  }

  // 7. Recommended Next Steps
  const recommendedSteps: string[] = [];
  if (languages.length === 1 && languages[0].percentage > 85) {
    recommendedSteps.push(
      `Expand your repository stack beyond ${languages[0].name} by contributing a project in an adjacent backend or frontend framework.`
    );
  } else {
    recommendedSteps.push(
      "Pin your top 3 flagship projects on your GitHub profile and include live deployment links."
    );
  }

  recommendedSteps.push(
    "Set up automated CI/CD workflows using GitHub Actions on your main repository to show production readiness."
  );

  recommendedSteps.push(
    "Add test suites (e.g. Vitest, Jest, or Pytest) to demonstrate code quality assurance."
  );

  const apiDisclaimer =
    "Public API Disclosure: Analysis uses the official GitHub REST API v3 to retrieve public repositories, languages, stars, and update dates. Private repositories and private commit graphs are not accessible without explicit OAuth token authorization.";

  const totalPublicRepos =
    typeof userData.public_repos === "number"
      ? userData.public_repos
      : allReposData.length;

  return {
    username: userData.login,
    name: userData.name || userData.login,
    avatarUrl: userData.avatar_url || null,
    bio: userData.bio || null,
    publicRepos: totalPublicRepos,
    followers: userData.followers || 0,
    following: userData.following || 0,
    htmlUrl: userData.html_url || `https://github.com/${userData.login}`,
    createdAt: userData.created_at || null,
    location: userData.location || null,
    company: userData.company || null,
    totalStars,
    totalForks,
    languages,
    topRepos,
    allRepos,
    inferredSkills: Array.from(inferredSkillSet),
    qualitySuggestions,
    recommendedSteps,
    apiDisclaimer,
  };
}
