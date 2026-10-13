import { GoogleGenAI } from "@google/genai";

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  return new GoogleGenAI({ apiKey });
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
}

export interface GeminiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function classifyGeminiError(message: string): string {
  const lower = message.toLowerCase();
  if (
    message.includes("429") ||
    message.includes("503") ||
    lower.includes("rate limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("quota") ||
    lower.includes("high demand")
  ) {
    return "AI service is currently experiencing high demand. Please wait a moment and try again.";
  }
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("deadline")) {
    return "AI service timed out. Please try again.";
  }
  if (
    lower.includes("api key") ||
    lower.includes("permission") ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden") ||
    lower.includes("403")
  ) {
    return "AI service authentication failed. Check your GEMINI_API_KEY configuration.";
  }
  return message;
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

async function generateJson<T>(
  systemPrompt: string,
  userPrompt: string,
  validator: (raw: unknown) => T | null,
  retries = 3
): Promise<GeminiResult<T>> {
  const genAI = getClient();
  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const candidateModels = Array.from(
    new Set([
      configuredModel,
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-latest",
    ])
  );

  if (!genAI) {
    return {
      ok: false,
      error:
        "GEMINI_API_KEY is not configured on the server. Please configure your Gemini API key in .env.local.",
    };
  }

  let lastError: string | undefined;
  const REQUEST_TIMEOUT_MS = 15_000;

  for (let attempt = 0; attempt <= retries && attempt < candidateModels.length; attempt++) {
    const currentModel = candidateModels[attempt];
    try {
      const result = await genAI.models.generateContent({
        model: currentModel,
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 8192,
          httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        },
      });

      const text = result.text;
      if (!text || text.trim().length === 0) {
        lastError = "AI returned an empty response.";
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(extractJsonText(text));
      } catch {
        lastError = "AI response was not valid JSON.";
        continue;
      }

      const validated = validator(parsed);
      if (validated === null) {
        lastError = "AI response failed schema validation.";
        continue;
      }

      return { ok: true, data: validated };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const classified = classifyGeminiError(message);
      if (classified.includes("authentication failed")) {
        return { ok: false, error: classified };
      }
      lastError = classified;
    }
  }

  return { ok: false, error: lastError || "AI generation failed after trying available models." };
}

export const gemini = { generateJson, isGeminiConfigured };
