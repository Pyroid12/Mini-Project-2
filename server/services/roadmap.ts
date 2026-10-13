import { gemini } from "./gemini";
import { validateRoadmap, type RoadmapAI } from "../validators";

export const SUPPORTED_ROLES = [
  { id: "software-developer", title: "Software Developer" },
  { id: "data-analyst", title: "Data Analyst" },
  { id: "data-scientist", title: "Data Scientist" },
  { id: "machine-learning-engineer", title: "Machine Learning Engineer" },
  { id: "ai-engineer", title: "AI Engineer" },
  { id: "full-stack-developer", title: "Full-Stack Developer" },
];

const SYSTEM_PROMPT = `You are an expert technical career coach for engineering students.
You generate a personalized, structured learning roadmap for a target job role.
Personalize the phases, skills, projects, and milestones based on the student's profile, current skills, career goal, and resume analysis.

Return ONLY a JSON object with this exact shape (no markdown, no extra text):
{
  "roleTitle": string,
  "roleId": string,
  "description": string (overview of the role and this personalized path),
  "difficulty": "Beginner Friendly" | "Intermediate" | "Advanced",
  "estimatedTime": string (e.g. "5 - 7 Months"),
  "phases": [
    {
      "phaseIndex": number,
      "title": string,
      "description": string,
      "duration": string,
      "skills": string[],
      "projects": string[],
      "practiceTasks": string[],
      "milestones": string[],
      "resources": string[] (label resources clearly: e.g. "[Official] https://...", "[AI-generated] ...")
    }
  ]
}

Important:
- Generate 4-6 phases.
- Include concrete practice tasks for each phase (coding drills, exercises, review work).
- Clearly distinguish official external resources from AI-generated recommendations by prefixing resources with "[Official]" or "[AI-generated]".
- Do not invent specific URLs for official resources unless they are well-known (e.g. https://roadmap.sh, MDN, official language docs). There is no unrestricted official Roadmap.sh API — link public pages only.
- For uncertain resources, prefix with "[AI-generated]".
- Tailor difficulty and content to the student's current skill level.`;

export async function generateRoadmap(params: {
  roleId: string;
  roleTitle: string;
  careerGoal?: string;
  skills?: string[];
  resumeSummary?: string;
  resumeScore?: number;
}): Promise<{ ok: boolean; data?: RoadmapAI; error?: string }> {
  const skillsText =
    params.skills && params.skills.length > 0
      ? params.skills.join(", ")
      : "No skills provided";

  const resumeContext = params.resumeSummary
    ? `\nResume summary: ${params.resumeSummary.slice(0, 800)}` +
      (params.resumeScore !== undefined ? `\nResume ATS score: ${params.resumeScore}/100` : "")
    : "";

  const userPrompt = `Target role: ${params.roleTitle} (${params.roleId})
Career goal: ${params.careerGoal || "Not specified"}
Current skills: ${skillsText}${resumeContext}

Generate a personalized learning roadmap.`;

  return gemini.generateJson<RoadmapAI>(SYSTEM_PROMPT, userPrompt, validateRoadmap);
}
