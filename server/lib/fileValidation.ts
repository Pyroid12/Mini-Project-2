import fs from "fs/promises";

const PDF_MAGIC = Buffer.from("%PDF");
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

export async function assertSafeResumeFile(
  filePath: string,
  mimeType: string
): Promise<void> {
  const handle = await fs.open(filePath, "r");
  try {
    const header = Buffer.alloc(8);
    const { bytesRead } = await handle.read(header, 0, 8, 0);
    if (bytesRead < 4) {
      throw new Error("File is empty or unreadable.");
    }

    const isPdf =
      mimeType === "application/pdf" && header.subarray(0, 4).equals(PDF_MAGIC);
    const isDocx =
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      header.subarray(0, 4).equals(ZIP_MAGIC);

    if (!isPdf && !isDocx) {
      throw new Error(
        "File contents do not match a valid PDF or DOCX. Please upload an original resume file."
      );
    }
  } finally {
    await handle.close();
  }
}
