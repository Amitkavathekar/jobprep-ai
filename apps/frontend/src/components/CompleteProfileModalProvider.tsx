"use client";

import React, { useState, useEffect, useCallback } from "react";
import CompleteProfileModal from "@/features/profile/components/CompleteProfileModal";
import type { UserProfile, Education } from "@/app/(protected)/user/profile/types";

function parseStoredUser(): UserProfile {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!raw) return {};
    const u = JSON.parse(raw);

    const educationList: Education[] = Array.isArray(u.educationList)
      ? u.educationList
      : u.degree || u.field_of_study || u.institution
      ? [
          {
            degree: u.degree || "",
            field_of_study: u.field_of_study || "",
            institution: u.institution || "",
            start_year: u.start_year || "",
            end_year: u.end_year || "",
          },
        ]
      : [];

    return {
      id: u.id || u._id,
      full_name: u.fullName || u.full_name || "",
      email: u.email || "",
      role: u.role || "user",
      avatar_url: u.avatarUrl || u.avatar_url || "",
      professional_title: u.professionalTitle || u.professional_title || "",
      phone_no: u.phoneNo || u.phone_no || "",
      location: u.location || "",
      portfolio_url: u.portfolioUrl || u.portfolio_url || "",
      github: u.github || "",
      linkedin: u.linkedin || "",
      bio: u.bio || "",
      educationList,
      degree: u.degree || "",
      field_of_study: u.field_of_study || "",
      institution: u.institution || "",
      start_year: u.start_year,
      end_year: u.end_year,
    };
  } catch {
    return {};
  }
}

export default function CompleteProfileModalProvider() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => parseStoredUser());

  const checkShouldOpen = useCallback(() => {
    try {
      const shouldShowFlag = localStorage.getItem("show_complete_profile_modal");
      const current = parseStoredUser();
      setProfile(current);

      // Show if explicitly triggered on login
      if (shouldShowFlag === "true") {
        setIsOpen(true);
        return;
      }

      // Or if logged in and profile is missing key details
      if (current.email && !current.professional_title) {
        setIsOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkShouldOpen();

    const handleOpen = () => {
      setProfile(parseStoredUser());
      setIsOpen(true);
    };

    const handleUserUpdated = () => {
      setProfile(parseStoredUser());
    };

    window.addEventListener("open-complete-profile-modal", handleOpen);
    window.addEventListener("user-profile-updated", handleUserUpdated);
    window.addEventListener("storage", handleUserUpdated);

    return () => {
      window.removeEventListener("open-complete-profile-modal", handleOpen);
      window.removeEventListener("user-profile-updated", handleUserUpdated);
      window.removeEventListener("storage", handleUserUpdated);
    };
  }, [checkShouldOpen]);

  const handleClose = () => {
    try {
      localStorage.removeItem("show_complete_profile_modal");
    } catch {}
    setIsOpen(false);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    try {
      const raw = localStorage.getItem("user");
      const prev = raw ? JSON.parse(raw) : {};

      const merged = {
        ...prev,
        ...updated,
        fullName: updated.full_name || prev.fullName || prev.full_name,
        avatarUrl: updated.avatar_url || prev.avatarUrl || prev.avatar_url,
        professionalTitle: updated.professional_title || prev.professionalTitle || prev.professional_title,
        phoneNo: updated.phone_no || prev.phoneNo || prev.phone_no,
        portfolioUrl: updated.portfolio_url || prev.portfolioUrl || prev.portfolio_url,
        profile_completed: true,
      };

      localStorage.setItem("user", JSON.stringify(merged));
      localStorage.removeItem("show_complete_profile_modal");
      setProfile(updated);

      window.dispatchEvent(new Event("user-profile-updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  return (
    <CompleteProfileModal
      isOpen={isOpen}
      onClose={handleClose}
      profile={profile}
      onSaveProfile={handleSaveProfile}
    />
  );
}
