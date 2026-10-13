import { prisma, isDatabaseConnected } from "./prisma";
import { StudentProfile } from "@/types";
import { initialProfile } from "./mockData";
import { getAuthContext } from "./auth-utils";
import { currentUser } from "@clerk/nextjs/server";

const inMemoryStore = new Map<string, StudentProfile>();

export const DEFAULT_PROFILE_FALLBACK: StudentProfile = {
  ...initialProfile,
  completionPercentage: 85,
};

export async function getProfileForUser(
  clerkUserId: string
): Promise<{ profile: StudentProfile; source: "db" | "fallback" }> {
  const dbAvailable = await isDatabaseConnected();

  if (dbAvailable) {
    try {
      const user = await prisma.user.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          email: (await currentUser())?.emailAddresses?.[0]?.emailAddress ?? "unknown@example.com",
          isDemoUser: false,
        },
        update: {},
        include: { profile: true },
      });

      if (user.profile) {
        return {
          profile: {
            fullName: user.fullName ?? user.profile.college ?? "Student",
            email: user.email,
            college: user.profile.college ?? "",
            degree: user.profile.degree ?? "",
            branch: user.profile.branch ?? "",
            currentAcademicYear: user.profile.currentAcademicYear ?? "",
            graduationYear: user.profile.graduationYear ?? "",
            careerGoal: user.profile.careerGoal ?? "",
            technicalSkills: user.profile.technicalSkills ?? [],
            githubUsername: user.profile.githubUsername ?? "",
            linkedinUrl: user.profile.linkedinUrl ?? "",
            leetcodeUsername: user.profile.leetcodeUsername ?? "",
            avatarUrl: user.imageUrl ?? undefined,
            completionPercentage: user.profile.completionPercentage,
          },
          source: "db",
        };
      }

      const auth = await getAuthContext();
      const profile: StudentProfile = {
        fullName: auth.fullName ?? initialProfile.fullName,
        email: auth.email ?? initialProfile.email,
        college: "",
        degree: "",
        branch: "",
        currentAcademicYear: "",
        graduationYear: "",
        careerGoal: "",
        technicalSkills: [],
        githubUsername: "",
        linkedinUrl: "",
        leetcodeUsername: "",
        avatarUrl: auth.imageUrl ?? undefined,
        completionPercentage: 20,
      };

      return { profile, source: "db" };
    } catch (err) {
      console.error("[profile-data] DB lookup failed, falling back to memory:", err);
    }
  }

  const existing = inMemoryStore.get(clerkUserId);
  if (existing) {
    return { profile: existing, source: "fallback" };
  }

  const auth = await getAuthContext();
  const fallback: StudentProfile = {
    ...DEFAULT_PROFILE_FALLBACK,
    fullName: auth.fullName ?? initialProfile.fullName,
    email: auth.email ?? initialProfile.email,
    avatarUrl: auth.imageUrl ?? undefined,
  };

  inMemoryStore.set(clerkUserId, fallback);
  return { profile: fallback, source: "fallback" };
}

export async function saveProfileForUser(
  clerkUserId: string,
  data: StudentProfile
): Promise<{
  saved: boolean;
  persisted: boolean;
  message: string;
  profile: StudentProfile;
}> {
  const dbAvailable = await isDatabaseConnected();

  if (dbAvailable) {
    try {
      const auth = await getAuthContext();
      await prisma.user.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          email: auth.email ?? data.email,
          fullName: auth.fullName ?? data.fullName,
          firstName: auth.firstName ?? undefined,
          lastName: auth.lastName ?? undefined,
          imageUrl: auth.imageUrl ?? undefined,
          isDemoUser: false,
        },
        update: {
          fullName: auth.fullName ?? data.fullName,
          firstName: auth.firstName ?? undefined,
          lastName: auth.lastName ?? undefined,
          imageUrl: auth.imageUrl ?? undefined,
        },
      });

      const saved = await prisma.studentProfile.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          college: data.college || null,
          degree: data.degree || null,
          branch: data.branch || null,
          currentAcademicYear: data.currentAcademicYear || null,
          graduationYear: data.graduationYear || null,
          careerGoal: data.careerGoal || null,
          technicalSkills: data.technicalSkills,
          githubUsername: data.githubUsername || null,
          linkedinUrl: data.linkedinUrl || null,
          leetcodeUsername: data.leetcodeUsername || null,
          completionPercentage: data.completionPercentage,
        },
        update: {
          college: data.college || null,
          degree: data.degree || null,
          branch: data.branch || null,
          currentAcademicYear: data.currentAcademicYear || null,
          graduationYear: data.graduationYear || null,
          careerGoal: data.careerGoal || null,
          technicalSkills: data.technicalSkills,
          githubUsername: data.githubUsername || null,
          linkedinUrl: data.linkedinUrl || null,
          leetcodeUsername: data.leetcodeUsername || null,
          completionPercentage: data.completionPercentage,
        },
      });

      return {
        saved: true,
        persisted: true,
        message: "Profile saved to secure database successfully.",
        profile: {
          fullName: data.fullName,
          email: data.email,
          college: saved.college ?? "",
          degree: saved.degree ?? "",
          branch: saved.branch ?? "",
          currentAcademicYear: saved.currentAcademicYear ?? "",
          graduationYear: saved.graduationYear ?? "",
          careerGoal: saved.careerGoal ?? "",
          technicalSkills: saved.technicalSkills ?? [],
          githubUsername: saved.githubUsername ?? "",
          linkedinUrl: saved.linkedinUrl ?? "",
          leetcodeUsername: saved.leetcodeUsername ?? "",
          completionPercentage: saved.completionPercentage,
        },
      };
    } catch (err) {
      console.error("[profile-data] DB save failed:", err);
    }
  }

  inMemoryStore.set(clerkUserId, data);
  return {
    saved: true,
    persisted: false,
    message:
      "Saved in current server memory (database not connected). Connect Supabase + run Prisma migration to persist profile data permanently.",
    profile: data,
  };
}
