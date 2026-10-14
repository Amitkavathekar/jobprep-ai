
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import { getApiBaseUrl } from "@/lib/axios";

interface ATSAnalysisResult {
  targetJobRole: string;
  score: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordSuggestions: string[];
}

interface ATSApiResponse {
  success: boolean;
  message?: string;
  data?: ATSAnalysisResult;
}

const API_URL = getApiBaseUrl();

export default function ATSAnalysisPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [targetJobRole, setTargetJobRole] = useState("");
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setAnalysis(null);

    if (!file) {
      setResume(null);
      return;
    }

    const allowedExtensions = [".pdf", ".docx"];
    const fileName = file.name.toLowerCase();
    const validExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    if (!validExtension) {
      setResume(null);
      event.target.value = "";
      setError("Please select a PDF or DOCX resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);
      event.target.value = "";
      setError("Your resume must be 5 MB or smaller.");
      return;
    }

    setResume(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!resume) {
      setError("Please upload your resume first.");
      return;
    }

    if (!targetJobRole.trim()) {
      setError("Please enter your target job role.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("targetJobRole", targetJobRole.trim());

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/ats/analyze`, {
        method: "POST",
        body: formData,
        // Do not set Content-Type manually. The browser sets the multipart
        // boundary automatically.
      });

      const result = (await response.json()) as ATSApiResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Unable to analyze your resume. Please try again.",
        );
      }

      setAnalysis(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return "Strong match";
    if (score >= 60) return "Moderate match";
    if (score >= 40) return "Needs improvement";
    return "Low match";
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  }

  function ResultList({
    title,
    items,
    emptyMessage,
    variant = "default",
  }: {
    title: string;
    items: string[];
    emptyMessage: string;
    variant?: "success" | "warning" | "default";
  }) {
    const bulletColor =
      variant === "success"
        ? "text-green-600"
        : variant === "warning"
          ? "text-amber-600"
          : "text-blue-600";

    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>

        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-start gap-2 text-sm leading-6 text-gray-700"
              >
                <span className={`${bulletColor} mt-0.5 font-bold`}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            JOBPREP AI
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            ATS Resume Analysis
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Upload your resume and enter any job role. AI will evaluate your
            resume against the skills and requirements relevant to that role.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="targetJobRole"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Target job role
              </label>

              <input
                id="targetJobRole"
                type="text"
                value={targetJobRole}
                onChange={(event) => setTargetJobRole(event.target.value)}
                placeholder="e.g. Frontend Developer, Data Engineer, SAP Developer"
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter any role. You do not need to select from a predefined list.
              </p>
            </div>

            <div>
              <label
                htmlFor="resume"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Upload your resume
              </label>

              <input
                id="resume"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="block w-full cursor-pointer rounded-lg border border-gray-300 p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Supported formats: PDF and DOCX. Maximum file size: 5 MB.
              </p>

              {resume && (
                <p className="mt-3 break-all text-sm text-green-700">
                  Selected: {resume.name}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Analyzing Resume..." : "Analyze Resume"}
            </button>

            {loading && (
              <p className="text-sm text-gray-500">
                AI is reviewing your resume against the target role. This may
                take a little time.
              </p>
            )}
          </form>
        </section>

        {analysis && (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-8 border-blue-100">
                  <span
                    className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}
                  >
                    {analysis.score}
                  </span>
                  <span className="text-xs text-gray-500">out of 100</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Analysis for
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {analysis.targetJobRole}
                  </h2>

                  <p
                    className={`mt-2 font-semibold ${getScoreColor(analysis.score)}`}
                  >
                    {getScoreLabel(analysis.score)}
                  </p>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                    {analysis.summary}
                  </p>
                </div>
              </div>

              <p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                This is an AI-based estimate, not a guaranteed score from a
                specific employer's ATS.
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <ResultList
                title="Matched Skills"
                items={analysis.matchedSkills}
                emptyMessage="No matched skills were identified."
                variant="success"
              />

              <ResultList
                title="Missing Skills"
                items={analysis.missingSkills}
                emptyMessage="No major missing skills were identified."
                variant="warning"
              />

              <ResultList
                title="Resume Strengths"
                items={analysis.strengths}
                emptyMessage="No strengths were returned."
                variant="success"
              />

              <ResultList
                title="Areas to Improve"
                items={analysis.weaknesses}
                emptyMessage="No weaknesses were returned."
                variant="warning"
              />

              <ResultList
                title="Recommendations"
                items={analysis.recommendations}
                emptyMessage="No recommendations were returned."
              />

              <ResultList
                title="Suggested Keywords"
                items={analysis.keywordSuggestions}
                emptyMessage="No keyword suggestions were returned."
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setError("");
              }}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
