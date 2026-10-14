"use client"

import {
  AlertTriangle,
  Camera,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"
import { useMemo, useState, useSyncExternalStore } from "react"

import type { Education, UserProfile } from "@/app/(protected)/user/profile/types"

type ProfileTab = "general" | "security" | "danger"
type StoredUser = Record<string, unknown>

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60"
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-300"
const panelClassName =
  "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-7"

function isRecord(value: unknown): value is StoredUser {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function normalizeEducation(value: unknown): Education[] {
  if (!Array.isArray(value)) return []

  return value.filter(isRecord).map((item) => ({
    degree: getString(item.degree),
    field_of_study: getString(item.field_of_study),
    institution: getString(item.institution),
    start_year: getNumber(item.start_year) ?? "",
    end_year: getNumber(item.end_year) ?? "",
  }))
}

function toProfile(value: StoredUser): UserProfile {
  const educationList = normalizeEducation(value.educationList)
  const degree = getString(value.degree)
  const fieldOfStudy = getString(value.field_of_study)
  const institution = getString(value.institution)

  if (
    educationList.length === 0 &&
    (degree || fieldOfStudy || institution || value.start_year || value.end_year)
  ) {
    educationList.push({
      degree,
      field_of_study: fieldOfStudy,
      institution,
      start_year: getNumber(value.start_year) ?? "",
      end_year: getNumber(value.end_year) ?? "",
    })
  }

  return {
    id: getString(value.id) || undefined,
    full_name: getString(value.fullName || value.full_name),
    email: getString(value.email),
    role: getString(value.role),
    avatar_url: getString(value.avatar_url),
    professional_title: getString(
      value.professional_title || value.professionalTitle
    ),
    phone_no: getString(value.phone_no),
    location: getString(value.location),
    portfolio_url: getString(value.portfolio_url),
    github: getString(value.github),
    linkedin: getString(value.linkedin),
    bio: getString(value.bio),
    language: getString(value.language) || "en",
    timezone: getString(value.timezone) || "Asia/Kolkata",
    is_2fa_enabled:
      typeof value.is_2fa_enabled === "boolean"
        ? value.is_2fa_enabled
        : false,
    educationList,
    degree,
    field_of_study: fieldOfStudy,
    institution,
    start_year: getNumber(value.start_year),
    end_year: getNumber(value.end_year),
    updated_at: getString(value.updated_at),
  }
}

function subscribeToUserChanges(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener("user-profile-updated", onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("user-profile-updated", onChange)
  }
}

function getStoredUser() {
  try {
    return window.localStorage.getItem("user") || ""
  } catch (error) {
    console.error("Unable to read the signed-in user's profile.", error)
    return ""
  }
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  )
}

export default function ProfilePage() {
  const storedUserJson = useSyncExternalStore(
    subscribeToUserChanges,
    getStoredUser,
    () => ""
  )
  const storedUser = useMemo<StoredUser>(() => {
    if (!storedUserJson) return {}

    try {
      const parsed: unknown = JSON.parse(storedUserJson)
      if (!isRecord(parsed)) {
        throw new Error("Stored user profile must be an object.")
      }
      return parsed
    } catch (error) {
      console.error("Unable to parse the signed-in user's profile.", error)
      return {}
    }
  }, [storedUserJson])
  const profile = useMemo(() => toProfile(storedUser), [storedUser])

  return (
    <ProfileSettings
      key={profile.id || profile.email || "signed-in-profile"}
      profile={profile}
      storedUser={storedUser}
    />
  )
}

function ProfileSettings({
  profile,
  storedUser,
}: {
  profile: UserProfile
  storedUser: StoredUser
}) {
  const [form, setForm] = useState<UserProfile>(profile)
  const [activeTab, setActiveTab] = useState<ProfileTab>("general")
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")

  const updateField = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setSaveMessage("")
    setSaveError("")
  }

  const updateEducation = <K extends keyof Education>(
    index: number,
    key: K,
    value: Education[K]
  ) => {
    const educationList = [...(form.educationList ?? [])]
    educationList[index] = { ...educationList[index], [key]: value }
    updateField("educationList", educationList)
  }

  const saveProfile = () => {
    try {
      const firstEducation = form.educationList?.[0]
      const updatedProfile: UserProfile = {
        ...form,
        degree: firstEducation?.degree || "",
        field_of_study: firstEducation?.field_of_study || "",
        institution: firstEducation?.institution || "",
        start_year:
          typeof firstEducation?.start_year === "number"
            ? firstEducation.start_year
            : undefined,
        end_year:
          typeof firstEducation?.end_year === "number"
            ? firstEducation.end_year
            : undefined,
        updated_at: new Date().toISOString(),
      }
      const updatedUser = {
        ...storedUser,
        ...updatedProfile,
        fullName: updatedProfile.full_name || "",
        professionalTitle: updatedProfile.professional_title || "",
      }

      window.localStorage.setItem("user", JSON.stringify(updatedUser))
      window.dispatchEvent(new Event("user-profile-updated"))
      setForm(updatedProfile)
      setSaveError("")
      setSaveMessage("Your profile changes have been saved.")
    } catch (error) {
      console.error("Unable to save the user's profile.", error)
      setSaveMessage("")
      setSaveError(
        "We couldn't save your profile in this browser. Check available storage and try again."
      )
    }
  }

  const handleAvatarUpload = (file?: File) => {
    if (!file) return
    setSaveMessage("")
    setSaveError("")

    if (!file.type.startsWith("image/")) {
      setSaveError("Choose an image file for your profile photo.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("The profile photo must be smaller than 2 MB.")
      return
    }

    const reader = new FileReader()
    reader.onerror = () => setSaveError("We couldn't read that image file.")
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("avatar_url", reader.result)
      } else {
        setSaveError("We couldn't read that image file.")
      }
    }
    reader.readAsDataURL(file)
  }

  const tabs = [
    { id: "general" as const, label: "General Profile", icon: UserRound },
    { id: "security" as const, label: "Security & Password", icon: ShieldCheck },
    { id: "danger" as const, label: "Danger Zone", icon: AlertTriangle },
  ]

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
          Candidate account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Profile <span className="text-violet-300">Settings</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your personal details, professional profile, and account
          settings.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav
          aria-label="Profile settings"
          className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 lg:h-fit lg:flex-col"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                activeTab === id
                  ? "bg-violet-500/15 font-semibold text-violet-200"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          {activeTab === "general" && (
            <>
              <section className={`${panelClassName} flex flex-wrap items-center gap-5`}>
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-bold text-white">
                  {form.avatar_url ? (
                    // The avatar may be a data URL created by the image picker.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.avatar_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    getInitials(form.full_name || "")
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">Profile photo</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Use a clear image. JPG, PNG, or WEBP, up to 2 MB.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20">
                      <Camera aria-hidden="true" className="size-4" />
                      Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                          handleAvatarUpload(event.target.files?.[0])
                          event.target.value = ""
                        }}
                      />
                    </label>
                    {form.avatar_url && (
                      <button
                        type="button"
                        onClick={() => updateField("avatar_url", "")}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05]"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <section className={panelClassName}>
                <h2 className="mb-5 text-base font-semibold text-white">
                  Personal & professional information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName} htmlFor="full-name">
                      Full name
                    </label>
                    <input
                      id="full-name"
                      className={inputClassName}
                      value={form.full_name || ""}
                      disabled
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Your account name is managed by your sign-in provider.
                    </p>
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={inputClassName}
                      value={form.email || ""}
                      disabled
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="phone">
                      Phone number
                    </label>
                    <input
                      id="phone"
                      className={inputClassName}
                      value={form.phone_no || ""}
                      onChange={(event) =>
                        updateField("phone_no", event.target.value)
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="location">
                      Location
                    </label>
                    <input
                      id="location"
                      className={inputClassName}
                      value={form.location || ""}
                      onChange={(event) =>
                        updateField("location", event.target.value)
                      }
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="portfolio">
                      Portfolio URL
                    </label>
                    <input
                      id="portfolio"
                      type="url"
                      className={inputClassName}
                      value={form.portfolio_url || ""}
                      onChange={(event) =>
                        updateField("portfolio_url", event.target.value)
                      }
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="github">
                      GitHub profile
                    </label>
                    <input
                      id="github"
                      type="url"
                      className={inputClassName}
                      value={form.github || ""}
                      onChange={(event) =>
                        updateField("github", event.target.value)
                      }
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="linkedin">
                      LinkedIn profile
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      className={inputClassName}
                      value={form.linkedin || ""}
                      onChange={(event) =>
                        updateField("linkedin", event.target.value)
                      }
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="title">
                      Professional title
                    </label>
                    <input
                      id="title"
                      className={inputClassName}
                      value={form.professional_title || ""}
                      onChange={(event) =>
                        updateField("professional_title", event.target.value)
                      }
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="language">
                      Preferred language
                    </label>
                    <select
                      id="language"
                      className={inputClassName}
                      value={form.language || "en"}
                      onChange={(event) =>
                        updateField("language", event.target.value)
                      }
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="timezone">
                      Time zone
                    </label>
                    <select
                      id="timezone"
                      className={inputClassName}
                      value={form.timezone || "Asia/Kolkata"}
                      onChange={(event) =>
                        updateField("timezone", event.target.value)
                      }
                    >
                      <option value="Asia/Kolkata">India (Asia/Kolkata)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">
                        Eastern Time (America/New_York)
                      </option>
                      <option value="Europe/London">
                        United Kingdom (Europe/London)
                      </option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClassName} htmlFor="bio">
                      Professional bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      maxLength={1000}
                      className={inputClassName}
                      value={form.bio || ""}
                      onChange={(event) =>
                        updateField("bio", event.target.value)
                      }
                      placeholder="Summarize your experience, strengths, and career goals."
                    />
                    <p className="mt-1 text-right text-xs text-slate-500">
                      {(form.bio || "").length}/1000
                    </p>
                  </div>
                </div>
              </section>

              <section className={panelClassName}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Education & qualifications
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Add your education history to your candidate profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("educationList", [
                        ...(form.educationList || []),
                        {
                          degree: "",
                          field_of_study: "",
                          institution: "",
                          start_year: "",
                          end_year: "",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-violet-400/30 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/10"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Add education
                  </button>
                </div>

                <div className="space-y-4">
                  {(form.educationList || []).map((education, index) => (
                    <div
                      key={`education-${index}`}
                      className="relative rounded-xl border border-white/[0.08] bg-black/10 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="font-medium text-slate-200">
                          Education {index + 1}
                        </h3>
                        <button
                          type="button"
                          aria-label={`Remove education ${index + 1}`}
                          onClick={() =>
                            updateField(
                              "educationList",
                              (form.educationList || []).filter(
                                (_, itemIndex) => itemIndex !== index
                              )
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            className={labelClassName}
                            htmlFor={`degree-${index}`}
                          >
                            Degree
                          </label>
                          <input
                            id={`degree-${index}`}
                            className={inputClassName}
                            value={education.degree}
                            onChange={(event) =>
                              updateEducation(index, "degree", event.target.value)
                            }
                            placeholder="Bachelor of Technology"
                          />
                        </div>
                        <div>
                          <label
                            className={labelClassName}
                            htmlFor={`field-${index}`}
                          >
                            Field of study
                          </label>
                          <input
                            id={`field-${index}`}
                            className={inputClassName}
                            value={education.field_of_study}
                            onChange={(event) =>
                              updateEducation(
                                index,
                                "field_of_study",
                                event.target.value
                              )
                            }
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <label
                            className={labelClassName}
                            htmlFor={`institution-${index}`}
                          >
                            Institution
                          </label>
                          <input
                            id={`institution-${index}`}
                            className={inputClassName}
                            value={education.institution}
                            onChange={(event) =>
                              updateEducation(
                                index,
                                "institution",
                                event.target.value
                              )
                            }
                            placeholder="University name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              className={labelClassName}
                              htmlFor={`start-year-${index}`}
                            >
                              Start year
                            </label>
                            <input
                              id={`start-year-${index}`}
                              type="number"
                              min={1950}
                              max={2100}
                              className={inputClassName}
                              value={education.start_year}
                              onChange={(event) =>
                                updateEducation(
                                  index,
                                  "start_year",
                                  event.target.value
                                    ? Number(event.target.value)
                                    : ""
                                )
                              }
                              placeholder="2019"
                            />
                          </div>
                          <div>
                            <label
                              className={labelClassName}
                              htmlFor={`end-year-${index}`}
                            >
                              End year
                            </label>
                            <input
                              id={`end-year-${index}`}
                              type="number"
                              min={1950}
                              max={2100}
                              className={inputClassName}
                              value={education.end_year}
                              onChange={(event) =>
                                updateEducation(
                                  index,
                                  "end_year",
                                  event.target.value
                                    ? Number(event.target.value)
                                    : ""
                                )
                              }
                              placeholder="2023"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(form.educationList || []).length === 0 && (
                    <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                      No education added yet.
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-white/[0.08] pt-5">
                  {saveError && (
                    <p role="alert" className="mb-3 text-sm text-rose-300">
                      {saveError}
                    </p>
                  )}
                  {saveMessage && (
                    <p role="status" className="mb-3 text-sm text-emerald-300">
                      {saveMessage}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    <Save aria-hidden="true" className="size-4" />
                    Save profile changes
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === "security" && (
            <section className={panelClassName}>
              <div className="flex items-start gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-violet-300"
                />
                <div>
                  <h2 className="font-semibold text-white">
                    Login & account security
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Password changes and two-factor authentication are not
                    connected to a backend endpoint yet. This page will not
                    claim that a password or security setting has changed until
                    those account APIs are available.
                  </p>
                  <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-sm text-amber-100">
                    Sign-in credentials are currently managed by the
                    authentication flow. Contact support if you need help
                    securing your account.
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === "danger" && (
            <section className={`${panelClassName} border-rose-400/20`}>
              <div className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-rose-300"
                />
                <div>
                  <h2 className="font-semibold text-rose-200">Danger zone</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Account deactivation and deletion are permanent account
                    operations. They are unavailable here until the server
                    provides authenticated endpoints for these actions.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="mt-4 cursor-not-allowed rounded-lg border border-rose-400/20 px-3 py-2 text-sm text-rose-200 opacity-60"
                  >
                    Delete account unavailable
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
