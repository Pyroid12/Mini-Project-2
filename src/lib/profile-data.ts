import { prisma, isDatabaseConnected } from "./prisma";
import { StudentProfile } from "@/types";
import { initialProfile } from "./mockData";
import { DEMO_METADATA_KEY, getAuthContext } from "./auth-utils";
import { currentUser } from "@clerk/nextjs/server";

const inMemoryStore = new Map<string, StudentProfile>();

export const DEMO_PROFILE_FALLBACK: StudentProfile = {
  ...initialProfile,
  fullName: "Demo Student",
  email: process.env.DEMO_USER_EMAIL || "careerbuddy.demo@example.com",
  completionPercentage: 85,
};

export async function getProfileForUser(
  clerkUserId: string,
  isDemoUser: boolean
): Promise<{ profile: StudentProfile; source: "db" | "fallback" | "demo" }> {
  const dbAvailable = await isDatabaseConnected();

  if (dbAvailable) {
    try {
      const user = await prisma.user.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          email: (await currentUser())?.emailAddresses?.[0]?.emailAddress ?? "unknown@example.com",
          isDemoUser,
        },
        update: { isDemoUser },
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
        completionPercentage: 0,
      };
      return { profile, source: "fallback" };
    } catch (err) {
      console.error("[profile-data] DB read failed, using fallback:", err);
    }
  }

  if (isDemoUser) {
    return { profile: DEMO_PROFILE_FALLBACK, source: "demo" };
  }

  const memoryCached = inMemoryStore.get(clerkUserId);
  if (memoryCached) {
    return { profile: memoryCached, source: "fallback" };
  }

  const auth = await getAuthContext();
  const fallback: StudentProfile = {
    fullName: auth.fullName ?? initialProfile.fullName,
    email: auth.email ?? initialProfile.email,
    college: initialProfile.college,
    degree: initialProfile.degree,
    branch: initialProfile.branch,
    currentAcademicYear: initialProfile.currentAcademicYear,
    graduationYear: initialProfile.graduationYear,
    careerGoal: initialProfile.careerGoal,
    technicalSkills: [...initialProfile.technicalSkills],
    githubUsername: initialProfile.githubUsername,
    linkedinUrl: initialProfile.linkedinUrl,
    leetcodeUsername: initialProfile.leetcodeUsername,
    avatarUrl: auth.imageUrl ?? undefined,
    completionPercentage: initialProfile.completionPercentage,
  };

  inMemoryStore.set(clerkUserId, fallback);
  return { profile: fallback, source: "fallback" };
}

export async function saveProfileForUser(
  clerkUserId: string,
  isDemoUser: boolean,
  data: StudentProfile
): Promise<{
  saved: boolean;
  persisted: boolean;
  demoRestricted: boolean;
  message: string;
  profile: StudentProfile;
}> {
  const dbAvailable = await isDatabaseConnected();

  if (isDemoUser) {
    DEMO_PROFILE_FALLBACK.fullName = data.fullName;
    DEMO_PROFILE_FALLBACK.email = data.email;
    DEMO_PROFILE_FALLBACK.college = data.college;
    DEMO_PROFILE_FALLBACK.degree = data.degree;
    DEMO_PROFILE_FALLBACK.branch = data.branch;
    DEMO_PROFILE_FALLBACK.currentAcademicYear = data.currentAcademicYear;
    DEMO_PROFILE_FALLBACK.graduationYear = data.graduationYear;
    DEMO_PROFILE_FALLBACK.careerGoal = data.careerGoal;
    DEMO_PROFILE_FALLBACK.technicalSkills = [...data.technicalSkills];
    DEMO_PROFILE_FALLBACK.githubUsername = data.githubUsername;
    DEMO_PROFILE_FALLBACK.linkedinUrl = data.linkedinUrl;
    DEMO_PROFILE_FALLBACK.leetcodeUsername = data.leetcodeUsername;
    DEMO_PROFILE_FALLBACK.completionPercentage = data.completionPercentage;

    return {
      saved: true,
      persisted: false,
      demoRestricted: true,
      message:
        "Demo session: Profile changes applied locally for preview purposes only. Changes are NOT persisted to a real database and will reset on next demo login. Sign up for a free account to save your real profile.",
      profile: DEMO_PROFILE_FALLBACK,
    };
  }

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
        demoRestricted: false,
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
    demoRestricted: false,
    message:
      "Saved in current server memory (database not connected). Connect Supabase + run Prisma migration to persist profile data permanently.",
    profile: data,
  };
}
