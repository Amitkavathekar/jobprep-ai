
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeText(
  file: Express.Multer.File,
): Promise<string> {
  let extractedText = "";

  if (file.mimetype === "application/pdf") {
    const result = await pdfParse(file.buffer);
    extractedText = result.text;
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    extractedText = result.value;
  } else {
    throw new Error("Unsupported resume format. Upload a PDF or DOCX file.");
  }

  const cleanedText = extractedText
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (cleanedText.length < 50) {
    throw new Error(
      "Could not extract enough text from this resume. Please upload a readable PDF or DOCX file.",
    );
  }

  if (cleanedText.length > 30_000) {
    return cleanedText.slice(0, 30_000);
  }

  return cleanedText;
}
