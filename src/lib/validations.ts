import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters")
    .trim(),
  college: z
    .string()
    .min(2, "College name is required")
    .max(200, "College name must be at most 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  degree: z
    .string()
    .min(2, "Degree is required")
    .max(100, "Degree must be at most 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  branch: z
    .string()
    .min(2, "Branch is required")
    .max(100, "Branch must be at most 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  currentAcademicYear: z
    .string()
    .max(50, "Academic year must be at most 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  graduationYear: z
    .string()
    .min(4, "Graduation year is required")
    .max(4, "Graduation year must be 4 digits")
    .regex(/^\d{4}$/, "Graduation year must be a valid 4-digit year")
    .trim()
    .optional()
    .or(z.literal("")),
  careerGoal: z
    .string()
    .min(3, "Career goal is required")
    .max(200, "Career goal must be at most 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  technicalSkills: z
    .array(z.string().min(1).max(50).trim())
    .max(50, "Maximum 50 technical skills allowed"),
  githubUsername: z
    .string()
    .max(50, "GitHub username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]*$/, "GitHub username contains invalid characters")
    .trim()
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .max(255, "LinkedIn URL must be at most 255 characters")
    .url("Please enter a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),
  leetcodeUsername: z
    .string()
    .max(50, "LeetCode username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]*$/, "LeetCode username contains invalid characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export function calculateCompletionPercentage(
  profile: Partial<ProfileFormData>
): number {
  let score = 0;
  const totalFields = 12;

  if (profile.fullName?.trim()) score += 1;
  if (profile.email?.trim()) score += 1;
  if (profile.college?.trim()) score += 1;
  if (profile.degree?.trim()) score += 1;
  if (profile.branch?.trim()) score += 1;
  if (profile.currentAcademicYear?.trim()) score += 1;
  if (profile.graduationYear?.trim()) score += 1;
  if (profile.careerGoal?.trim()) score += 1;
  if ((profile.technicalSkills?.length ?? 0) >= 3) score += 2;
  if (profile.githubUsername?.trim()) score += 1;
  if (profile.leetcodeUsername?.trim()) score += 1;

  return Math.round((score / totalFields) * 100);
}
