import { UserModel } from "../users/user.model";
import { OtpModel } from "./otp.model";
import { MailService } from "../../services/mail.service";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { hashPassword } from "../../shared/utils/password.util";
import { ResetPasswordInput, SendOtpInput, VerifyOtpInput } from "./forgot-password.types";

export const sendResetPasswordOtp = async (data: SendOtpInput) => {
  const email = data.email?.toLowerCase().trim();

  if (!email || !email.includes("@")) {
    throw new BadRequestError("Please provide a valid email address");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundError("No account found with this email address");
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Remove existing OTPs for this email to avoid duplicates
  await OtpModel.deleteMany({ email });

  // Store new OTP
  await OtpModel.create({
    email,
    otp,
    expiresAt,
  });

  // Send email via Nodemailer
  await MailService.sendPasswordResetOtp(email, otp);

  return {
    email,
    message: "Verification code sent to your email",
  };
};

export const verifyResetOtp = async (data: VerifyOtpInput) => {
  const email = data.email?.toLowerCase().trim();
  const otp = data.otp?.trim();

  if (!email || !otp) {
    throw new BadRequestError("Email and 6-digit verification code are required");
  }

  const existingOtp = await OtpModel.findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!existingOtp) {
    throw new BadRequestError("Invalid or expired verification code");
  }

  return {
    valid: true,
    message: "Verification code verified successfully",
  };
};

export const resetPassword = async (data: ResetPasswordInput) => {
  const email = data.email?.toLowerCase().trim();
  const otp = data.otp?.trim();
  const newPassword = data.newPassword;

  if (!email || !otp || !newPassword) {
    throw new BadRequestError("Email, verification code, and new password are required");
  }

  if (newPassword.length < 6) {
    throw new BadRequestError("Password must be at least 6 characters long");
  }

  // Verify OTP
  const existingOtp = await OtpModel.findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!existingOtp) {
    throw new BadRequestError("Invalid or expired verification code");
  }

  // Find user
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundError("User account not found");
  }

  // Hash new password and update user
  const passwordHash = await hashPassword(newPassword);
  user.passwordHash = passwordHash;
  await user.save();

  // Delete used OTP
  await OtpModel.deleteMany({ email });

  return {
    success: true,
    message: "Password has been successfully reset",
  };
};

