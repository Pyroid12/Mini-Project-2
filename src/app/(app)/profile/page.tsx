import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile"
        description="Manage your academic credentials, career preferences, and connected developer handles."
        showDemoBadge={true}
      />
      <ProfileForm />
    </div>
  );
}
