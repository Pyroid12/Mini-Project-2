"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Building2,
  Target,
  Terminal,
  Check,
  X,
  Plus,
  AlertCircle,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Github, Linkedin } from "@/components/common/Icons";
import { StudentProfile } from "@/types";
import { initialProfile } from "@/lib/mockData";
import { SectionCard } from "@/components/common/SectionCard";
import { DemoBadge } from "@/components/common/DemoBadge";

export function ProfileForm() {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [savedSnapshot, setSavedSnapshot] = useState<StudentProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [dataSource, setDataSource] = useState<"db" | "fallback">("fallback");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.profile && active) {
            setProfile(data.profile);
            setSavedSnapshot(data.profile);
            setDataSource(data.meta?.dataSource || "db");
          }
        }
      } catch (err) {
        console.warn("[ProfileForm] Could not fetch remote profile:", err);
      } finally {
        if (active) setIsLoadingProfile(false);
      }
    }
    fetchProfile();
    return () => {
      active = false;
    };
  }, []);

  // Calculate dynamic completion rate
  const calculateCompletion = (data: StudentProfile): number => {
    let score = 0;
    const totalFields = 12;

    if (data.fullName.trim()) score += 1;
    if (data.email.trim()) score += 1;
    if (data.college.trim()) score += 1;
    if (data.degree.trim()) score += 1;
    if (data.branch.trim()) score += 1;
    if (data.currentAcademicYear.trim()) score += 1;
    if (data.graduationYear.trim()) score += 1;
    if (data.careerGoal.trim()) score += 1;
    if (data.technicalSkills.length >= 3) score += 2;
    if (data.githubUsername.trim()) score += 1;
    if (data.leetcodeUsername.trim()) score += 1;

    return Math.round((score / totalFields) * 100);
  };

  const completionPercentage = calculateCompletion(profile);

  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;

    if (!profile.technicalSkills.includes(newSkillInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newSkillInput.trim()],
      }));
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!isEditing) return;
    setProfile((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profile.fullName.trim()) errors.fullName = "Full name is required";
    if (!profile.email.trim()) errors.email = "Valid email address is required";
    if (!profile.college.trim()) errors.college = "College name is required";
    if (!profile.degree.trim()) errors.degree = "Degree is required";
    if (!profile.branch.trim()) errors.branch = "Branch is required";
    if (!profile.graduationYear.trim()) errors.graduationYear = "Graduation year is required";
    if (!profile.careerGoal.trim()) errors.careerGoal = "Career goal is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) {
          setValidationErrors(data.fieldErrors);
        }
        throw new Error(data.error || "Failed to persist profile.");
      }

      if (data.profile) {
        setProfile(data.profile);
        setSavedSnapshot(data.profile);
      } else {
        setSavedSnapshot(profile);
      }

      setIsEditing(false);
      setDataSource(data.persisted ? "db" : "fallback");
      setSaveSuccessMessage(
        data.persisted
          ? "Profile saved & synced to Supabase database successfully!"
          : "Profile saved to active session successfully!"
      );
    } catch (err) {
      console.error("[ProfileForm] Save failed:", err);
      setValidationErrors((prev) => ({
        ...prev,
        general: err instanceof Error ? err.message : "Failed to save profile.",
      }));
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 5000);
    }
  };

  const handleCancel = () => {
    setProfile(savedSnapshot);
    setValidationErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header & Completion Rate */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#635BFF]/10 border-2 border-[#635BFF]/30 text-[#635BFF] flex items-center justify-center font-bold text-xl shrink-0">
            {profile.fullName
              .split(" ")
              .map((n) => n[0])
              .join("") || "ST"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#172033]">{profile.fullName}</h2>
              {isLoadingProfile ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : dataSource === "db" ? (
                <DemoBadge label="Cloud Synced" className="bg-green-100 text-[#16A34A] border-green-200" />
              ) : (
                <DemoBadge label="Active Profile" className="bg-blue-100 text-[#635BFF] border-blue-200" />
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {profile.degree} • {profile.branch} • Class of {profile.graduationYear}
            </p>
            <p className="text-xs font-semibold text-[#635BFF] mt-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Goal: {profile.careerGoal}
            </p>
          </div>
        </div>

        {/* Completion Progress Gauge */}
        <div className="w-full md:w-64 bg-slate-50 border border-[#E2E8F0] p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#172033]">Profile Completeness</span>
            <span className="font-bold text-[#635BFF]">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#635BFF] h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            Add missing skills and social handles to reach 100%
          </p>
        </div>
      </div>

      {/* General Validation Error Alert */}
      {validationErrors.general && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationErrors.general}</span>
        </div>
      )}

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-[#16A34A] font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage(null)}>
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {/* Form Controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748B]">
          {isEditing
            ? "Edit mode active: update fields and press Save Changes"
            : "View mode active: click Edit Profile to update details"}
        </p>
        <div className="flex items-center gap-2.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#172033] hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-[#635BFF] hover:bg-[#5348E8] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-[#635BFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5348E8] transition-colors shadow-xs"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic & Basic Details */}
        <SectionCard title="Academic Information" description="Your university credentials">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border ${
                    validationErrors.fullName
                      ? "border-red-400 focus:ring-red-200"
                      : "border-[#E2E8F0] focus:ring-[#635BFF]/20"
                  } focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-[#64748B]`}
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-[11px] text-red-500 mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled={!isEditing}
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border ${
                    validationErrors.email
                      ? "border-red-400 focus:ring-red-200"
                      : "border-[#E2E8F0] focus:ring-[#635BFF]/20"
                  } focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-[#64748B]`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-[11px] text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                College / University *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.college}
                  onChange={(e) => handleInputChange("college", e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Degree *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.degree}
                  onChange={(e) => handleInputChange("degree", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Branch *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.currentAcademicYear}
                  onChange={(e) => handleInputChange("currentAcademicYear", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Graduation Year *
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.graduationYear}
                  onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Career & Developer Links */}
        <SectionCard title="Career Goals & Coding Handles" description="Your professional targets">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Primary Career Goal *
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.careerGoal}
                  onChange={(e) => handleInputChange("careerGoal", e.target.value)}
                  placeholder="e.g. Full-Stack Software Engineer @ Tier 1 Tech"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                GitHub Username
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.githubUsername}
                  onChange={(e) => handleInputChange("githubUsername", e.target.value)}
                  placeholder="e.g. alexchen-dev"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  disabled={!isEditing}
                  value={profile.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                LeetCode Username
              </label>
              <div className="relative">
                <Terminal className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.leetcodeUsername}
                  onChange={(e) => handleInputChange("leetcodeUsername", e.target.value)}
                  placeholder="e.g. alex_coder99"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 disabled:bg-slate-50 disabled:text-[#64748B]"
                />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Technical Skills Tagging Section */}
      <SectionCard
        title="Technical Skills"
        description="Key programming languages, frameworks, and tools in your repertoire"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.technicalSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20"
              >
                <span>{skill}</span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                    title={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {isEditing && (
            <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, Redis)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] flex-1 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#172033] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
