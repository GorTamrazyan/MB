// src/lib/email.service.ts
import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_PORT === 465,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(
    to: string,
    verificationLink: string,
    firstName?: string,
) {
    console.log("📧 sendVerificationEmail called"); // ← LOG

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify your email</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome to Tina Marketplace!</h2>
        <p>Hello ${firstName || "User"},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f3f4f6; padding: 10px; word-break: break-all;">${verificationLink}</p>
        <p>This link will expire in 7 days.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

    try {
        const info = await transporter.sendMail({
            from: env.SMTP_FROM || "Tina Marketplace <noreply@tina.com>",
            to,
            subject: "Verify your email - Tina Marketplace",
            html,
        });
        console.log("✅ Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Email send error:", error);
        throw error;
    }
}

// Optional: Verify SMTP connection on startup
export async function verifyEmailConnection() {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection verified");
        return true;
    } catch (error) {
        console.error("❌ SMTP connection failed:", error);
        return false;
    }
}
