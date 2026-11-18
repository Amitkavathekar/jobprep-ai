"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onBackToLanding?: () => void;
  defaultEmail?: string;
}

export default function ForgotPassword({
  onBackToLogin,
  onBackToLanding,
  defaultEmail = "",
}: ForgotPasswordProps) {
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(45);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "verify" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password/send-otp", {
        email: email.trim().toLowerCase(),
      });
      setStep("verify");
      setResendCountdown(45);
    } catch (err: any) {
      console.error("send otp error:", err);
      const message =
        err.response?.data?.message || "Failed to send verification code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextIdx = Math.min(pastedData.length, 5);
      document.getElementById(`otp-input-${nextIdx}`)?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredOtp = otp.join("").trim();
    if (enteredOtp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password/reset-password", {
        email: email.trim().toLowerCase(),
        otp: enteredOtp,
        newPassword,
      });
      setStep("success");
    } catch (err: any) {
      console.error("reset password error:", err);
      const message =
        err.response?.data?.message || "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/auth/forgot-password/send-otp", {
        email: email.trim().toLowerCase(),
      });
      setResendCountdown(45);
    } catch (err: any) {
      console.error("resend otp error:", err);
      const message =
        err.response?.data?.message || "Failed to resend code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength check
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
    if (score === 2 || score === 3) return { score: 2, label: "Good", color: "#f59e0b" };
    return { score: 3, label: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "48px 16px",
      }}
      className="mesh-bg"
    >
      {/* Back to landing or login in top-left */}
      <div style={{ position: "absolute", top: 24, left: 24, display: "flex", gap: 10, zIndex: 10 }}>
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            ← Back to Home
          </button>
        )}
        <button
          onClick={onBackToLogin}
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#a78bfa",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
        >
          Sign In
        </button>
      </div>

      {/* Decorative Orbs */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="fade-in" style={{ width: "100%", maxWidth: 460, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            className="gradient-text"
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            JobPrep AI
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.7)",
              fontSize: 14,
              marginTop: 4,
            }}
          >
          </div>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: "32px 28px" }}>
          {/* STEP 1: Enter Email */}
          {step === "request" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(124, 58, 237, 0.15)",
                    border: "1px solid rgba(124, 58, 237, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px auto",
                    fontSize: 22,
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.25)",
                  }}
                >
                  🔒
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  Forgot Password?
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(148,163,184,0.8)",
                    lineHeight: 1.5,
                    maxWidth: 340,
                    margin: "0 auto",
                  }}
                >
                Enter your registered email to receive a 6-digit OTP.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(148,163,184,0.8)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    className="glass-input"
                    type="email"
                    placeholder="arjun@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "13px 0",
                    fontSize: 15,
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin-slow 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    "Send Verification Code →"
                  )}
                </button>
              </form>

              <div style={{ marginTop: 22, textAlign: "center" }}>
                <span
                  onClick={onBackToLogin}
                  style={{
                    fontSize: 13,
                    color: "#a78bfa",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "color 0.2s",
                  }}
                >
                  ← Back to Sign In
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Verify Code & Set New Password */}
          {step === "verify" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px auto",
                    fontSize: 22,
                    boxShadow: "0 0 20px rgba(6, 182, 212, 0.2)",
                  }}
                >
                  ✉️
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  Reset Your Password
                </h2>
                <p style={{ fontSize: 13, color: "rgba(148,163,184,0.8)", lineHeight: 1.4 }}>
                  Code sent to <span style={{ color: "#67e8f9", fontWeight: 600 }}>{email}</span>
                  {" • "}
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#a78bfa",
                      fontSize: 12,
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Change
                  </button>
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(148,163,184,0.8)",
                      display: "block",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    Enter 6-Digit Verification Code
                  </label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onPaste={handlePasteOtp}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        style={{
                          width: 44,
                          height: 48,
                          textAlign: "center",
                          fontSize: 18,
                          fontWeight: 700,
                          borderRadius: 8,
                          border: digit
                            ? "1px solid rgba(124, 58, 237, 0.7)"
                            : "1px solid rgba(255, 255, 255, 0.12)",
                          background: digit
                            ? "rgba(124, 58, 237, 0.15)"
                            : "rgba(255, 255, 255, 0.05)",
                          color: "#fff",
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(148,163,184,0.8)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="glass-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: "100%", paddingRight: 40 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(148,163,184,0.8)",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 4,
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {newPassword && (
                    <div style={{ marginTop: 6 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 11,
                          marginBottom: 4,
                          color: "rgba(148,163,184,0.7)",
                        }}
                      >
                        <span>Strength:</span>
                        <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          width: "100%",
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(strength.score / 3) * 100}%`,
                            background: strength.color,
                            transition: "all 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "rgba(148,163,184,0.8)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Confirm New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="glass-input"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: "100%", paddingRight: 40 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(148,163,184,0.8)",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 4,
                      }}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                    color: "rgba(148,163,184,0.7)",
                  }}
                >
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCountdown > 0}
                    style={{
                      background: "none",
                      border: "none",
                      color: resendCountdown > 0 ? "rgba(148,163,184,0.4)" : "#67e8f9",
                      fontWeight: 600,
                      cursor: resendCountdown > 0 ? "not-allowed" : "pointer",
                      padding: 0,
                    }}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "13px 0",
                    fontSize: 15,
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin-slow 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    "Reset Password & Finish →"
                  )}
                </button>
              </form>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <span
                  onClick={onBackToLogin}
                  style={{
                    fontSize: 13,
                    color: "#a78bfa",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ← Back to Sign In
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px auto",
                  fontSize: 28,
                  color: "#34d399",
                  boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)",
                }}
              >
                ✓
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                Password Updated!
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: "rgba(148,163,184,0.8)",
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Your password has been successfully reset. You can now securely sign in to JobPrep AI with your new password.
              </p>

              <button
                type="button"
                onClick={onBackToLogin}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "13px 0",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Sign In Now →
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 12,
            color: "rgba(148,163,184,0.4)",
          }}
        >
          Protected by JobPrep AI Security
        </div>
      </div>
    </div>
  );
}
