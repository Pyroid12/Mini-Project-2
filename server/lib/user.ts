import { prisma, isDatabaseConnected } from "./prisma";

export interface ServerUser {
  clerkUserId: string;
  email: string;
  fullName: string | null;
  isDemoUser: boolean;
}

export async function getProfileSnapshot(clerkUserId: string): Promise<{
  careerGoal: string;
  technicalSkills: string[];
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  linkedinUrl?: string | null;
} | null> {
  const dbAvailable = await isDatabaseConnected();
  if (!dbAvailable) return null;
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { clerkUserId },
    });
    if (!profile) return null;
    return {
      careerGoal: profile.careerGoal ?? "",
      technicalSkills: profile.technicalSkills ?? [],
      college: profile.college,
      degree: profile.degree,
      branch: profile.branch,
      linkedinUrl: profile.linkedinUrl,
    };
  } catch (err) {
    console.error("[server/user] profile snapshot failed:", err);
    return null;
  }
}

export async function ensureUser(
  clerkUserId: string,
  email: string | null,
  fullName: string | null,
  isDemoUser: boolean
): Promise<ServerUser | null> {
  const dbAvailable = await isDatabaseConnected();
  if (!dbAvailable) {
    return {
      clerkUserId,
      email: email ?? "unknown@example.com",
      fullName,
      isDemoUser,
    };
  }

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        email: email ?? "unknown@example.com",
        fullName: fullName ?? undefined,
        isDemoUser,
      },
      update: {
        email: email ?? undefined,
        fullName: fullName ?? undefined,
        isDemoUser,
      },
    });
    return {
      clerkUserId: user.clerkUserId,
      email: user.email,
      fullName: user.fullName,
      isDemoUser: user.isDemoUser,
    };
  } catch (err) {
    console.error("[server/user] upsert failed:", err);
    return {
      clerkUserId,
      email: email ?? "unknown@example.com",
      fullName,
      isDemoUser,
    };
  }
}
