import { gemini } from "./gemini";
import { validateResumeAnalysis, type ResumeAnalysisAI } from "../validators";

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyst for engineering campus placements.
You evaluate a candidate's resume text and return a STRICT JSON object.
The score is an approximate evaluation only — not a guarantee of ATS performance or placement success.

Return ONLY a JSON object with this exact shape (no markdown, no extra text):
{
  "atsScore": number 0-100,
  "summary": string (2-3 sentence overall assessment),
  "strengths": string[] (3-8 concrete strengths),
  "weaknesses": string[] (3-8 concrete weaknesses),
  "missingSkills": string[] (skills missing or under-represented),
  "recommendations": string[] (3-8 actionable recommendations),
  "suggestedKeywords": string[] (ATS keywords to add),
  "experienceTips": string[] (improvement tips for experience section),
  "projectTips": string[] (improvement tips for projects section)
}`;

export async function analyzeResumeText(
  resumeText: string,
  targetRole?: string
): Promise<{ ok: boolean; data?: ResumeAnalysisAI; error?: string }> {
  const truncated = resumeText.slice(0, 12000);
  const roleContext = targetRole
    ? `Target role: ${targetRole}\n`
    : "Target role: Software Developer (general engineering)\n";

  const userPrompt = `${roleContext}Here is the candidate's resume text:\n\n"${truncated}"`;

  return gemini.generateJson<ResumeAnalysisAI>(
    SYSTEM_PROMPT,
    userPrompt,
    validateResumeAnalysis
  );
}
