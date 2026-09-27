import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static getTransporter() {
    return nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  public static async sendEmail(options: EmailOptions): Promise<void> {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn(`SMTP credentials not configured. Email to ${options.to} skipped.`);
      return;
    }

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
    }
  }
}
