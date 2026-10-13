import type { NextConfig } from "next";

const AI_SERVER_URL =
  process.env.AI_SERVER_URL || `http://localhost:${process.env.AI_SERVER_PORT || 3001}`;

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/api/ai/:path*", destination: `${AI_SERVER_URL}/ai/:path*` },
      { source: "/api/resume-analyses", destination: `${AI_SERVER_URL}/resume-analyses` },
      { source: "/api/resume-analyses/:path*", destination: `${AI_SERVER_URL}/resume-analyses/:path*` },
      { source: "/api/roadmaps/roles", destination: `${AI_SERVER_URL}/roadmaps/roles` },
      { source: "/api/roadmaps", destination: `${AI_SERVER_URL}/roadmaps` },
      { source: "/api/roadmaps/:path*", destination: `${AI_SERVER_URL}/roadmaps/:path*` },
      { source: "/api/linkedin-analyses", destination: `${AI_SERVER_URL}/linkedin-analyses` },
      { source: "/api/linkedin-analyses/:path*", destination: `${AI_SERVER_URL}/linkedin-analyses/:path*` },
      { source: "/api/dashboard/:path*", destination: `${AI_SERVER_URL}/dashboard/:path*` },
      { source: "/api/github/:path*", destination: `${AI_SERVER_URL}/github/:path*` },
      { source: "/api/leetcode/:path*", destination: `${AI_SERVER_URL}/leetcode/:path*` },
      { source: "/api/placement-readiness", destination: `${AI_SERVER_URL}/placement-readiness` },
      { source: "/api/placement-readiness/:path*", destination: `${AI_SERVER_URL}/placement-readiness/:path*` },
      { source: "/api/career-insights", destination: `${AI_SERVER_URL}/career-insights` },
      { source: "/api/career-insights/:path*", destination: `${AI_SERVER_URL}/career-insights/:path*` },
    ];
  },
};

export default nextConfig;
