import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/career-roadmap(.*)",
  "/resume-analysis(.*)",
  "/developer-progress(.*)",
  "/linkedin-analysis(.*)",
  "/mock-interview(.*)",
  "/placement-readiness(.*)",
  "/settings(.*)",
  "/api/profile(.*)",
  "/api/dashboard(.*)",
  "/api/github(.*)",
  "/api/leetcode(.*)",
  "/api/resume-analyses(.*)",
  "/api/roadmaps(.*)",
  "/api/linkedin-analyses(.*)",
  "/api/career-insights(.*)",
  "/api/placement-readiness(.*)",
  "/api/ai(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/demo/sign-in",
  "/api/webhooks(.*)",
  "/favicon.ico",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
