"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  Info,
  FileText,
} from "lucide-react";
import { aiFetch, aiUpload } from "@/lib/ai-client";
import { DemoBadge } from "@/components/common/DemoBadge";

interface ResumeAnalysisData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  suggestedKeywords: string[];
  experienceTips: string[];
  projectTips: string[];
  targetRole: string | null;
}

export function ResumeUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisData | null>(null);
  const [history, setHistory] = useState<ResumeAnalysisData[]>([]);
  const [demoRestricted, setDemoRestricted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [allRes, profileRes] = await Promise.all([
          aiFetch<{ analyses: ResumeAnalysisData[] }>("/api/resume-analyses").catch(() => ({ analyses: [] })),
          aiFetch<{ profile?: { careerGoal?: string } }>("/api/profile").catch(() => null),
        ]);
        if (cancelled) return;
        if (allRes.analyses && allRes.analyses.length > 0) {
          setHistory(allRes.analyses);
          setAnalysisResult(allRes.analyses[0]);
        }
        if (profileRes?.profile?.careerGoal) {
          setTargetRole(profileRes.profile.careerGoal);
        }
      } catch {
        // Empty state remains if nothing is saved yet.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setAnalysisResult(null);

    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setErrorMessage("Unsupported file format. Please upload a .pdf or .docx file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File exceeds 5MB size limit. Please upload a smaller file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a resume file first.");
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("targetRole", targetRole);

      const res = await aiUpload<{
        analysis: ResumeAnalysisData;
        demoRestricted: boolean;
      }>("/api/ai/resume-analyze", formData);

      setAnalysisResult(res.analysis);
      setHistory((prev) => [res.analysis, ...prev.filter((item) => item.id !== res.analysis.id)]);
      setDemoRestricted(res.demoRestricted);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to analyze resume. Please try again.");
      setAnalysisResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setDemoRestricted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Notice */}
      <div className="bg-[#EEF0FF] border border-[#635BFF]/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#635BFF] shrink-0 mt-0.5" />
        <div className="text-xs text-[#172033] leading-relaxed">
          <p className="font-semibold text-[#635BFF]">AI-Powered ATS Resume Analysis</p>
          <p className="text-[#64748B] mt-0.5">
            Upload your resume to receive an ATS-style score, strengths, weaknesses, missing skills, and actionable recommendations powered by Google Gemini. The score is an approximate evaluation, not a guarantee of ATS performance or placement success.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <label className="block text-xs font-semibold text-[#172033] mb-1">
          Target role <span className="text-[#64748B] font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Full-Stack Developer"
          className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20"
        />
      </div>

      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`bg-white border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? "border-[#635BFF] bg-[#635BFF]/5 scale-[0.99]"
            : selectedFile
            ? "border-[#16A34A]/50 bg-green-50/20"
            : "border-[#E2E8F0] hover:border-[#635BFF]/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFileChange}
          id="resume-file-input"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#172033]">
              Upload Your Engineering Resume
            </h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm">
              Drag and drop your file here, or browse from your device
            </p>

            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              <span className="bg-slate-100 px-2 py-1 rounded border border-[#E2E8F0]">PDF</span>
              <span className="bg-slate-100 px-2 py-1 rounded border border-[#E2E8F0]">DOCX</span>
              <span>Max 5 MB</span>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-[#635BFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5348E8] transition-colors shadow-xs"
              >
                Browse Files
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-[#16A34A] flex items-center justify-center mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#172033]">{selectedFile.name}</h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI analysis
            </p>

            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={triggerAnalyze}
                disabled={analyzing}
                className="px-5 py-2.5 bg-[#635BFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5348E8] disabled:opacity-50 transition-colors shadow-xs flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-3.5 py-2.5 text-xs text-[#64748B] hover:text-[#DC2626] border border-[#E2E8F0] hover:border-red-200 rounded-xl transition-colors"
              >
                Change File
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-[#DC2626] bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult ? (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-[#172033]">
                Resume Analysis Results
              </h3>
              {demoRestricted && <DemoBadge label="Demo Session" />}
            </div>
            <button
              onClick={clearSelection}
              className="text-xs text-[#64748B] hover:text-[#172033] underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Analyze another
            </button>
          </div>

          {history.length > 1 && (
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-[#64748B] shrink-0">Analysis History:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setAnalysisResult(h)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                      analysisResult.id === h.id
                        ? "bg-[#635BFF] text-white border-[#635BFF] shadow-xs"
                        : "bg-white text-[#172033] border-[#E2E8F0] hover:border-[#635BFF]/30"
                    }`}
                  >
                    {h.fileName} ({h.atsScore}/100)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Approximate evaluation only.</strong> This ATS score is an AI-generated estimate and does not guarantee ATS performance or placement success.
            </p>
          </div>

          {/* Top Score Banner */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#635BFF]/10 border-2 border-[#635BFF] flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-[#635BFF]">{analysisResult.atsScore}</span>
                <span className="text-[10px] text-[#64748B] font-semibold uppercase">/ 100 ATS</span>
              </div>
              <div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  analysisResult.atsScore >= 75
                    ? "bg-green-100 text-[#16A34A]"
                    : analysisResult.atsScore >= 50
                    ? "bg-amber-100 text-[#F59E0B]"
                    : "bg-red-100 text-[#DC2626]"
                }`}>
                  {analysisResult.atsScore >= 75
                    ? "Strong Placement Potential"
                    : analysisResult.atsScore >= 50
                    ? "Moderate — Room to Improve"
                    : "Needs Significant Improvements"}
                </span>
                <h4 className="text-base font-bold text-[#172033] mt-1.5">
                  ATS Structural Compatibility
                </h4>
                <p className="text-xs text-[#64748B] max-w-xl mt-1 leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-[#64748B]">File Analyzed</div>
              <div className="text-sm font-bold text-[#172033] mt-0.5 truncate max-w-[200px]">
                {analysisResult.fileName}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
              <h4 className="text-sm font-bold text-[#16A34A] flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Key Profile Strengths
              </h4>
              <ul className="space-y-2.5 text-xs text-[#172033]">
                {analysisResult.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-green-50/40 p-2.5 rounded-lg border border-green-100/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
              <h4 className="text-sm font-bold text-[#DC2626] flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2.5 text-xs text-[#172033]">
                {analysisResult.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-red-50/40 p-2.5 rounded-lg border border-red-100/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Skills & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
              <h4 className="text-sm font-bold text-[#F59E0B] flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" />
                Identified Skill Gaps
              </h4>
              <p className="text-xs text-[#64748B] mb-3">
                Skills missing or under-represented in your resume:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
              <h4 className="text-sm font-bold text-[#635BFF] flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                High-Impact ATS Keywords
              </h4>
              <p className="text-xs text-[#64748B] mb-3">
                Recommended keywords to boost your resume parser match rate:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.suggestedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience & Project Tips */}
          {(analysisResult.experienceTips.length > 0 || analysisResult.projectTips.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysisResult.experienceTips.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
                  <h4 className="text-sm font-bold text-[#172033] mb-3">
                    Experience Improvement Suggestions
                  </h4>
                  <ul className="space-y-2 text-xs text-[#172033]">
                    {analysisResult.experienceTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysisResult.projectTips.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
                  <h4 className="text-sm font-bold text-[#172033] mb-3">
                    Project Description Improvements
                  </h4>
                  <ul className="space-y-2 text-xs text-[#172033]">
                    {analysisResult.projectTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
            <h4 className="text-sm font-bold text-[#172033] mb-3">
              Actionable Recommendations
            </h4>
            <div className="space-y-2">
              {analysisResult.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-slate-50/50 text-xs text-[#172033]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !analyzing ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#172033]">
            No Resume Analyzed Yet
          </h4>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
            Upload your resume above to receive a personalized ATS score and AI-generated feedback.
          </p>
        </div>
      ) : null}
    </div>
  );
}
