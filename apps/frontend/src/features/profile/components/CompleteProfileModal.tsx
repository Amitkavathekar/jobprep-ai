
"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { UserProfile } from "@/app/(protected)/user/profile/types";

interface Education {
  degree: string;
  field_of_study: string;
  institution: string;
  start_year: number | "";
  end_year: number | "";
}

type CompleteProfileForm = Omit<UserProfile, "start_year" | "end_year"> & {
  start_year?: number | "";
  end_year?: number | "";
  educationList: Education[];
};

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void | Promise<void>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 9,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#aeb8cc",
  marginBottom: 6,
  fontWeight: 600,
};

const sectionStyle: React.CSSProperties = {
  background: "rgba(124,58,237,0.05)",
  border: "1px solid rgba(124,58,237,0.2)",
  borderRadius: 16,
  padding: 20,
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 9,
  cursor: "pointer",
};

function getInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function getDefaultValues(profile: UserProfile): CompleteProfileForm {
  return {
    ...profile,
    avatar_url: profile.avatar_url || "",
    professional_title: profile.professional_title || "",
    phone_no: profile.phone_no || "",
    location: profile.location || "",
    portfolio_url: profile.portfolio_url || "",
    github: profile.github || "",
    linkedin: profile.linkedin || "",
    bio: profile.bio || "",
    educationList: [
      {
        degree: profile.degree || "",
        field_of_study: profile.field_of_study || "",
        institution: profile.institution || "",
        start_year: profile.start_year || "",
        end_year: profile.end_year || "",
      },
    ],
  };
}

export function CompleteProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}: CompleteProfileModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileForm>({
    defaultValues: getDefaultValues(profile),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "educationList",
  });

  const avatarUrl = watch("avatar_url");
  const fullName = watch("full_name") || "";

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues(profile));
      setShowSuccess(false);
      setSaveError("");
    }
  }, [isOpen, profile, reset]);

  if (!isOpen) return null;

  // Save profile information
  const onSubmit = async (data: CompleteProfileForm) => {
    setSaveError("");
    setShowSuccess(false);

    try {
      const education = data.educationList[0];

      const updatedProfile: UserProfile = {
        ...profile,
        ...data,
        degree: education?.degree || "",
        field_of_study: education?.field_of_study || "",
        institution: education?.institution || "",
        start_year: education?.start_year || 0,
        end_year: education?.end_year || 0,
        updated_at: new Date().toISOString(),
      };

      delete (updatedProfile as Partial<CompleteProfileForm>)
        .educationList;

      await onSaveProfile(updatedProfile);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveError("Unable to save your profile. Please try again.");
    }
  };

  // Upload profile photo
  const handleAvatarUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        reset({
          ...watch(),
          avatar_url: reader.result,
        });
        setSaveError("");
      }
    };

    reader.readAsDataURL(file);
  };

  // Reusable input field
  const renderField = (
    name: keyof CompleteProfileForm,
    label: string,
    placeholder = "",
    required = false
  ) => (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        {...register(name, {
          required: required ? `${label} is required` : false,
        })}
        placeholder={placeholder}
        style={inputStyle}
      />

      {errors[name] && (
        <p style={{ color: "#f87171", fontSize: 12 }}>
          {String(errors[name]?.message)}
        </p>
      )}
    </div>
  );

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(7,7,26,0.82)",
        backdropFilter: "blur(14px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0d0d2b",
          border: "1px solid rgba(124,58,237,0.38)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 70px rgba(0,0,0,0.7)",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingBottom: 18,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div>
            <span style={{ color: "#a78bfa", fontSize: 11 }}>
              CANDIDATE ACCOUNT PROFILE
            </span>

            <h2>
              Complete Your <span style={{ color: "#a78bfa" }}>Profile</span>
            </h2>
          </div>

          <button type="button" onClick={onClose} style={buttonStyle}>
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Profile Photo */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getInitials(fullName)
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Profile Photo URL</label>

              <input
                {...register("avatar_url")}
                placeholder="https://example.com/photo.jpg"
                style={inputStyle}
              />

              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                Or upload an image (maximum 2 MB).
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          {/* Account Details */}
          <section style={sectionStyle}>
            <h3 style={{ color: "#06b6d4" }}>Account Details</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  value={fullName}
                  disabled
                  style={{ ...inputStyle, opacity: 0.6 }}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value="Password managed by your authentication provider"
                  readOnly
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    ...buttonStyle,
                    background: "transparent",
                    color: "#a78bfa",
                    border: 0,
                  }}
                >
                  {showPassword ? "Hide password information" : "Show password information"}
                </button>
              </div>
            </div>
          </section>

          {/* Professional Details */}
          <section style={sectionStyle}>
            <h3 style={{ color: "#06b6d4" }}>
              Professional Details & Contact Info
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 16,
              }}
            >
              {renderField(
                "professional_title",
                "Professional Title",
                "e.g. Frontend Developer",
                true
              )}

              {renderField("phone_no", "Phone Number", "+91 98765 43210")}
              {renderField("location", "Location", "Mumbai, India / Remote")}
              {renderField("portfolio_url", "Portfolio URL")}
              {renderField("github", "GitHub Profile")}
              {renderField("linkedin", "LinkedIn Profile")}
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Bio / Candidate Summary</label>

              <textarea
                {...register("bio")}
                rows={4}
                placeholder="Describe your skills and experience..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </section>

          {/* Education */}
          <section style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h3 style={{ color: "#a78bfa" }}>Education & Qualifications</h3>

              <button
                type="button"
                onClick={() =>
                  append({
                    degree: "",
                    field_of_study: "",
                    institution: "",
                    start_year: "",
                    end_year: "",
                  })
                }
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  color: "#c4b5fd",
                  border: "1px solid #7c3aed",
                }}
              >
                + Add Education
              </button>
            </div>

            {fields.map((education, index) => (
              <div
                key={education.id}
                style={{
                  padding: 16,
                  marginTop: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <strong>Education {index + 1}</strong>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      style={{
                        ...buttonStyle,
                        color: "#f87171",
                        background: "transparent",
                        border: 0,
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                    gap: 16,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Degree Name</label>
                    <input
                      {...register(`educationList.${index}.degree`)}
                      placeholder="Bachelor of Technology"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Field of Study</label>
                    <input
                      {...register(`educationList.${index}.field_of_study`)}
                      placeholder="Computer Science"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Institution</label>
                    <input
                      {...register(`educationList.${index}.institution`)}
                      placeholder="University name"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Start Year</label>
                    <input
                      type="number"
                      {...register(`educationList.${index}.start_year`, {
                        setValueAs: (value) =>
                          value === "" ? "" : Number(value),
                      })}
                      placeholder="2019"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>End Year</label>
                    <input
                      type="number"
                      {...register(`educationList.${index}.end_year`, {
                        setValueAs: (value) =>
                          value === "" ? "" : Number(value),
                      })}
                      placeholder="2023"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Messages */}
          {saveError && (
            <p role="alert" style={{ color: "#f87171" }}>
              {saveError}
            </p>
          )}

          {showSuccess && (
            <p role="status" style={{ color: "#34d399" }}>
              ✓ Profile saved successfully!
            </p>
          )}

          {/* Footer Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                ...buttonStyle,
                color: "#cbd5e1",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Skip for Now
            </button>

            <button
              type="submit"
              disabled={isSubmitting || showSuccess}
              style={{
                ...buttonStyle,
                background: "#7c3aed",
                color: "#fff",
                border: 0,
                fontWeight: 700,
                opacity: isSubmitting || showSuccess ? 0.7 : 1,
              }}
            >
              {isSubmitting
                ? "Saving Profile..."
                : showSuccess
                  ? "Profile Saved ✓"
                  : "Save Profile Information →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

