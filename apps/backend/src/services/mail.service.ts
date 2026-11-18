import nodemailer, { Transporter } from "nodemailer";
import { ENV } from "../config/env";

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    if (ENV.SMTP_USER && ENV.SMTP_PASS) {
      const cleanPass = ENV.SMTP_PASS.replace(/\s+/g, "");

      if (ENV.SMTP_HOST.includes("gmail") || ENV.SMTP_USER.includes("@gmail.com")) {
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: ENV.SMTP_USER,
            pass: cleanPass,
          },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: ENV.SMTP_HOST,
          port: ENV.SMTP_PORT,
          secure: ENV.SMTP_SECURE,
          auth: {
            user: ENV.SMTP_USER,
            pass: cleanPass,
          },
        });
      }
      return this.transporter;
    }

    return null;
  }

  public static async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string }> {
    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn("\n=======================================================");
      console.warn("[MailService] No SMTP credentials configured in .env!");
      console.warn(`[MailService] Mock sending email to: ${options.to}`);
      console.warn(`[MailService] Subject: ${options.subject}`);
      if (options.text) {
        console.warn(`[MailService] Body: ${options.text}`);
      }
      console.warn("=======================================================\n");
      return { success: true, messageId: "mock-message-id" };
    }

    try {
      const info = await transporter.sendMail({
        from: ENV.EMAIL_FROM || ENV.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`[MailService] Email sent successfully to ${options.to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("[MailService] Error sending email via Nodemailer:", error);
      throw error;
    }
  }

  public static async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const subject = "JobPrep AI - Your Password Reset Verification Code";

    const text = `Your JobPrep AI verification code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #07071a; color: #f1f5f9; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            JobPrep AI
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(148, 163, 184, 0.7);">
            AI-Powered Career Intelligence Platform
          </p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; text-align: center;">
          <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
            Password Reset Request
          </h2>
          <p style="font-size: 14px; color: rgba(148, 163, 184, 0.85); line-height: 1.5; margin: 0 0 20px 0;">
            We received a request to reset the password for your JobPrep AI account. Use the verification code below to set a new password:
          </p>

          <div style="display: inline-block; padding: 14px 28px; background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.5); border-radius: 10px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #a78bfa; margin: 0 auto 20px auto;">
            ${otp}
          </div>

          <p style="font-size: 12px; color: rgba(148, 163, 184, 0.6); margin: 0;">
            ⏳ This code is valid for <strong>10 minutes</strong>.
          </p>
        </div>

        <p style="font-size: 12px; color: rgba(148, 163, 184, 0.5); text-align: center; margin-top: 24px; line-height: 1.5;">
          If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
        </p>

        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: rgba(148, 163, 184, 0.35); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
          Protected by JobPrep AI Security
        </div>
      </div>
    `;

    await this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }
}
