import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeText(
  filePath: string,
  mimeType: string
): Promise<string> {
  const isPdf = mimeType === "application/pdf" || filePath.endsWith(".pdf");
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx");

  if (isPdf) {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return (result.text || "").trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ path: filePath });
    return (result.value || "").trim();
  }

  throw new Error("Unsupported file type. Only PDF and DOCX are allowed.");
}
