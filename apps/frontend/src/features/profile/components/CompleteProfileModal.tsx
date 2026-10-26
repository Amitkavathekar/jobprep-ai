"use client";

import { useState, useEffect, useContext } from "react";
import type { UserProfile, Education } from "@/app/(protected)/user/profile/types";
import { SidebarContext } from "@/components/ui/sidebar";
import { Eye, EyeOff } from "lucide-react";

export interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export function CompleteProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}: CompleteProfileModalProps) {
  const sidebarContext = useContext(SidebarContext);
  const isMobile = sidebarContext?.isMobile ?? false;
  const sidebarState = sidebarContext?.state ?? "expanded";

  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("••••••••••••••••••••••••");

  const [educationList, setEducationList] = useState<Education[]>(() => {
    if (Array.isArray(profile.educationList) && profile.educationList.length > 0) {
      return profile.educationList;
    }
    return [
      {
        degree: profile.degree || "Bachelor of Technology (B.Tech)",
        field_of_study: profile.field_of_study || "Computer Science",
        institution: profile.institution || "IIT Bombay",
        start_year: profile.start_year || 2019,
        end_year: profile.end_year || 2023,
      },
    ];
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
      if (Array.isArray(profile.educationList) && profile.educationList.length > 0) {
        setEducationList(profile.educationList);
      } else {
        setEducationList([
          {
            degree: profile.degree || "Bachelor of Technology (B.Tech)",
            field_of_study: profile.field_of_study || "Computer Science",
            institution: profile.institution || "IIT Bombay",
            start_year: profile.start_year || 2019,
            end_year: profile.end_year || 2023,
          },
        ]);
      }
      setShowSuccess(false);
    }
  }, [isOpen, profile]);

  const addEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        degree: "",
        field_of_study: "",
        institution: "",
        start_year: "" as any,
        end_year: "" as any,
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string | number
  ) => {
    setEducationList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleChange = (
    key: keyof UserProfile,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      updated_at: new Date().toISOString(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const firstEdu = educationList[0];
    const finalData: UserProfile = {
      ...formData,
      educationList,
      degree: firstEdu?.degree || "",
      field_of_study: firstEdu?.field_of_study || "",
      institution: firstEdu?.institution || "",
      start_year:
        typeof firstEdu?.start_year === "number"
          ? firstEdu.start_year
          : undefined,
      end_year:
        typeof firstEdu?.end_year === "number"
          ? firstEdu.end_year
          : undefined,
      updated_at: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      onSaveProfile(finalData);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 900);
    }, 500);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  // Compute horizontal offset so the sidebar remains completely visible and uncovered on desktop
  const leftOffset = !isMobile
    ? sidebarState === "collapsed"
      ? "var(--sidebar-width-icon, 3rem)"
      : "var(--sidebar-width, 16rem)"
    : 0;

  return (
    <div
      className="fade-in fixed inset-y-0 right-0 z-40 flex items-center justify-center p-3 sm:p-5 transition-[left] duration-200"
      style={{
        left: leftOffset,
        background: "rgba(7, 7, 26, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxSizing: "border-box",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass custom-scrollbar"
        style={{
          width: "100%",
          maxWidth: 860,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0d0d2b",
          border: "1px solid rgba(124, 58, 237, 0.38)",
          borderRadius: 24,
          padding: "30px 34px",
          boxShadow:
            "0 24px 70px rgba(0, 0, 0, 0.85), 0 0 45px rgba(124, 58, 237, 0.35)",
          color: "#ffffff",
          position: "relative",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 14px",
                borderRadius: 20,
                background: "rgba(124, 58, 237, 0.15)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                fontSize: 11,
                fontWeight: 700,
                color: "#a78bfa",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>⚡ CANDIDATE ACCOUNT PROFILE</span>
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "white",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Complete Your Profile
            </h2>
            <p style={{ fontSize: 13, color: "rgba(148, 163, 184, 0.7)", margin: "4px 0 0" }}>
              Please review and update your profile details to personalize your AI job prep recommendations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "rgba(148, 163, 184, 0.8)",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            title="Close / Skip"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Avatar upload section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 16,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: formData.avatar_url
                  ? `url(${formData.avatar_url}) center/cover`
                  : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
                color: "white",
                flexShrink: 0,
                boxShadow: "0 0 24px rgba(124, 58, 237, 0.45)",
              }}
            >
              {!formData.avatar_url && getInitials(formData.full_name)}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                Profile Photo / Avatar Upload
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="glass-input"
                  style={{ padding: "8px 14px", fontSize: 13, flex: 1 }}
                  placeholder="Paste Image URL (https://...)"
                  value={formData.avatar_url || ""}
                  onChange={(e) => handleChange("avatar_url", e.target.value)}
                />
                <label
                  className="btn-ghost"
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 10,
                  }}
                >
                  <span>📷 Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            handleChange("avatar_url", String(reader.result));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Full Name & Login Password */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "rgba(148, 163, 184, 0.9)",
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Full Name
              </label>
              <input
                className="glass-input"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "rgba(255, 255, 255, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                value={formData.full_name || ""}
                onChange={(e) => handleChange("full_name", e.target.value)}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "rgba(148, 163, 184, 0.9)",
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Login Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="glass-input"
                  type={showPassword ? "text" : "password"}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "rgba(255, 255, 255, 0.9)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    paddingRight: 40,
                    letterSpacing: showPassword ? "normal" : "0.15em",
                  }}
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "rgba(148, 163, 184, 0.8)",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Professional Details & Contact Links */}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#06b6d4",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>💼</span> Professional Details &amp; Contact Info
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Professional Title & Phone Number */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      color: "rgba(148, 163, 184, 0.9)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Professional Title *
                  </label>
                  <input
                    className="glass-input"
                    value={formData.professional_title || ""}
                    onChange={(e) =>
                      handleChange("professional_title", e.target.value)
                    }
                    placeholder="e.g. Senior Frontend Engineer"
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 13,
                      color: "rgba(148, 163, 184, 0.9)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Phone Number (phone_no)
                  </label>
                  <input
                    className="glass-input"
                    value={formData.phone_no || ""}
                    onChange={(e) => handleChange("phone_no", e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  style={{
                    fontSize: 13,
                    color: "rgba(148, 163, 184, 0.9)",
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Location (location)
                </label>
                <input
                  className="glass-input"
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. Mumbai, India"
                />
              </div>

              {/* Portfolio URL, GitHub & LinkedIn Links */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      color: "rgba(148, 163, 184, 0.9)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Portfolio URL (portfolio_url)
                  </label>
                  <input
                    className="glass-input"
                    value={formData.portfolio_url || ""}
                    onChange={(e) =>
                      handleChange("portfolio_url", e.target.value)
                    }
                    placeholder="https://arjun-kumar.dev"
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 13,
                      color: "rgba(148, 163, 184, 0.9)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    GitHub Profile (github)
                  </label>
                  <input
                    className="glass-input"
                    value={formData.github || ""}
                    onChange={(e) => handleChange("github", e.target.value)}
                    placeholder="https://github.com/arjunkumar"
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 13,
                      color: "rgba(148, 163, 184, 0.9)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    LinkedIn Profile (linkedin)
                  </label>
                  <input
                    className="glass-input"
                    value={formData.linkedin || ""}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/arjunkumar"
                  />
                </div>
              </div>

              {/* Bio / Candidate Summary */}
              <div>
                <label
                  style={{
                    fontSize: 13,
                    color: "rgba(148, 163, 184, 0.9)",
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Bio / Candidate Summary
                </label>
                <textarea
                  className="glass-textarea"
                  rows={2}
                  value={formData.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="5+ years building scalable web applications. Passionate about DX and design systems."
                />
              </div>
            </div>
          </div>

          {/* Section: Education Degree (from education_degree table) */}
          <div
            style={{
              background: "rgba(124, 58, 237, 0.05)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#a78bfa",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🎓</span> Education &amp; Degree Qualification
                (education_degree)
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={addEducation}
                style={{
                  fontSize: 12,
                  padding: "5px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderColor: "rgba(167, 139, 250, 0.4)",
                  color: "#a78bfa",
                }}
              >
                <span>➕</span> Add Education Degree
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {educationList.map((edu, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: 12,
                    padding: 16,
                    position: "relative",
                  }}
                >
                  {educationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        borderRadius: 6,
                        fontSize: 11,
                        padding: "3px 8px",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Remove
                    </button>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "rgba(148, 163, 184, 0.9)",
                            display: "block",
                            marginBottom: 4,
                            fontWeight: 600,
                          }}
                        >
                          Degree Name{" "}
                          {educationList.length > 1 ? `#${index + 1}` : ""}
                        </label>
                        <input
                          className="glass-input"
                          value={edu.degree || ""}
                          onChange={(e) => {
                            handleEducationChange(
                              index,
                              "degree",
                              e.target.value
                            );
                            if (index === 0)
                              handleChange("degree", e.target.value);
                          }}
                          placeholder="e.g. Bachelor of Technology (B.Tech)"
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "rgba(148, 163, 184, 0.9)",
                            display: "block",
                            marginBottom: 4,
                            fontWeight: 600,
                          }}
                        >
                          Field of Study
                        </label>
                        <input
                          className="glass-input"
                          value={edu.field_of_study || ""}
                          onChange={(e) => {
                            handleEducationChange(
                              index,
                              "field_of_study",
                              e.target.value
                            );
                            if (index === 0)
                              handleChange("field_of_study", e.target.value);
                          }}
                          placeholder="e.g. Computer Science & Engineering"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          color: "rgba(148, 163, 184, 0.9)",
                          display: "block",
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        Institution / University Name
                      </label>
                      <input
                        className="glass-input"
                        value={edu.institution || ""}
                        onChange={(e) => {
                          handleEducationChange(
                            index,
                            "institution",
                            e.target.value
                          );
                          if (index === 0)
                            handleChange("institution", e.target.value);
                        }}
                        placeholder="e.g. IIT Bombay"
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "rgba(148, 163, 184, 0.9)",
                            display: "block",
                            marginBottom: 4,
                            fontWeight: 600,
                          }}
                        >
                          Start Year
                        </label>
                        <input
                          className="glass-input"
                          type="number"
                          value={edu.start_year || ""}
                          onChange={(e) => {
                            handleEducationChange(
                              index,
                              "start_year",
                              Number(e.target.value) || ("" as any)
                            );
                            if (index === 0)
                              handleChange(
                                "start_year",
                                Number(e.target.value) || ("" as any)
                              );
                          }}
                          placeholder="e.g. 2019"
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "rgba(148, 163, 184, 0.9)",
                            display: "block",
                            marginBottom: 4,
                            fontWeight: 600,
                          }}
                        >
                          End Year
                        </label>
                        <input
                          className="glass-input"
                          type="number"
                          value={edu.end_year || ""}
                          onChange={(e) => {
                            handleEducationChange(
                              index,
                              "end_year",
                              Number(e.target.value) || ("" as any)
                            );
                            if (index === 0)
                              handleChange(
                                "end_year",
                                Number(e.target.value) || ("" as any)
                              );
                          }}
                          placeholder="e.g. 2023"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: 18,
            }}
          >
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              style={{ padding: "10px 20px", fontSize: 13 }}
            >
              Skip for Now
            </button>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {showSuccess && (
                <div
                  className="fade-in"
                  style={{
                    color: "#10b981",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ✓ Profile Saved Successfully!
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isSaving}
                style={{
                  padding: "11px 26px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isSaving ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin-slow 0.8s linear infinite",
                      }}
                    />
                    Saving Profile...
                  </>
                ) : (
                  "Save Profile Information →"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfileModal;
