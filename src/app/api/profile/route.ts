import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getProfileForUser, saveProfileForUser } from "@/lib/profile-data";
import { profileSchema, calculateCompletionPercentage } from "@/lib/validations";
import type { StudentProfile } from "@/types";
import { getAuthContext } from "@/lib/auth-utils";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const authCtx = await getAuthContext();
    const { profile, source } = await getProfileForUser(userId);

    return NextResponse.json({
      profile,
      meta: {
        dataSource: source,
      },
    });
  } catch (err) {
    console.error("[api/profile GET] error:", err);
    return NextResponse.json(
      { error: "Failed to load profile. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const authCtx = await getAuthContext();

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const validated = profileSchema.safeParse(payload);
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, issues] of Object.entries(validated.error.flatten().fieldErrors)) {
        if (issues && issues.length > 0) {
          fieldErrors[key] = issues[0];
        }
      }
      return NextResponse.json(
        {
          error: "Validation failed. Please review the highlighted fields.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const incoming = validated.data;

    if (incoming.email && authCtx.email && incoming.email !== authCtx.email) {
      return NextResponse.json(
        {
          error: "Email address cannot be changed here. Manage your email in Clerk account settings.",
          fieldErrors: { email: "Email must match your authenticated account" },
        },
        { status: 403 }
      );
    }

    const completionPercentage = calculateCompletionPercentage(incoming);

    const profileToSave: StudentProfile = {
      fullName: incoming.fullName || authCtx.fullName || "Student",
      email: incoming.email || authCtx.email || "",
      college: incoming.college || "",
      degree: incoming.degree || "",
      branch: incoming.branch || "",
      currentAcademicYear: incoming.currentAcademicYear || "",
      graduationYear: incoming.graduationYear || "",
      careerGoal: incoming.careerGoal || "",
      technicalSkills: incoming.technicalSkills || [],
      githubUsername: incoming.githubUsername || "",
      linkedinUrl: incoming.linkedinUrl || "",
      leetcodeUsername: incoming.leetcodeUsername || "",
      avatarUrl: authCtx.imageUrl ?? undefined,
      completionPercentage,
    };

    const result = await saveProfileForUser(userId, profileToSave);

    return NextResponse.json({
      success: result.saved,
      persisted: result.persisted,
      message: result.message,
      profile: result.profile,
    });
  } catch (err) {
    console.error("[api/profile POST] error:", err);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}
