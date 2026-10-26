
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

function sanitizePdfBuffer(buffer: Buffer): Buffer {
  const headerIndex = buffer.indexOf("%PDF-");
  if (headerIndex > 0) {
    return buffer.subarray(headerIndex);
  }
  return buffer;
}

function fallbackExtractPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString("latin1");
    const textChunks: string[] = [];

    // Extract text blocks defined between PDF text object delimiters (BT ... ET)
    const textBlocks = content.match(/BT[\s\S]*?ET/g) || [];
    for (const block of textBlocks) {
      const strMatches = block.match(/\((?:\\\(|\\\)|[^()])*\)/g) || [];
      for (const str of strMatches) {
        const unescaped = str
          .slice(1, -1)
          .replace(/\\([()\\])/g, "$1")
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .trim();
        if (unescaped.length > 0) {
          textChunks.push(unescaped);
        }
      }
    }

    if (textChunks.join(" ").trim().length >= 50) {
      return textChunks.join(" ");
    }

    // Secondary fallback: Extract readable ASCII word sequences
    const matches = content.match(/[\x20-\x7E]{4,}/g) || [];
    const filtered = matches.filter(
      (m) =>
        !m.startsWith("/") &&
        !m.startsWith("<<") &&
        !m.endsWith(">>") &&
        !m.includes("xref") &&
        !m.includes("trailer") &&
        !m.includes("endobj") &&
        !m.includes("endstream"),
    );

    return filtered.join(" ");
  } catch {
    return "";
  }
}

export async function extractResumeText(
  file: Express.Multer.File,
): Promise<string> {
  let extractedText = "";

  if (file.mimetype === "application/pdf") {
    const sanitized = sanitizePdfBuffer(file.buffer);

    try {
      const result = await pdfParse(sanitized);
      extractedText = result.text || "";
    } catch {
      try {
        // Attempt with alternative PDF.js parser engine version
        const fallbackResult = await pdfParse(sanitized, {
          version: "v2.0.550" as any,
        });
        extractedText = fallbackResult.text || "";
      } catch {
        // Fallback to direct raw PDF stream extraction
        extractedText = fallbackExtractPdfText(sanitized);
      }
    }
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    extractedText = result.value;
  } else if (
    file.mimetype === "text/plain" ||
    /\.txt$/i.test(file.originalname)
  ) {
    extractedText = file.buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported resume format. Upload a PDF, DOCX, or TXT file.");
  }

  const cleanedText = extractedText
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (cleanedText.length < 50) {
    throw new Error(
      "Could not extract enough readable text from this resume. If it is an image/scanned PDF or protected file, please export or save it as a standard text-based PDF or DOCX file.",
    );
  }

  if (cleanedText.length > 30_000) {
    return cleanedText.slice(0, 30_000);
  }

  return cleanedText;
}

