import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ResumeUpload } from "@/components/resume/ResumeUpload";

export default function ResumeAnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Analysis"
        description="Verify ATS readability, analyze section structure, and uncover critical missing keywords for campus placements."
        showDemoBadge={false}
      />
      <ResumeUpload />
    </div>
  );
}
