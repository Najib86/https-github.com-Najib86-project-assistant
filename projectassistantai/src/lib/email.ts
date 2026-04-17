// src/lib/email.ts
// Email sending via Nodemailer (Gmail SMTP or custom SMTP)

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT ?? "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ProjectAssistantAI";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.projectassistantai.com.ng";
const FROM = process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@projectassistantai.com.ng>`;

// ── Base email template ───────────────────────────────────────────────────
function baseTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0d12;font-family:'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;padding:0 20px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1F4E79,#0a0d12);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
      <div style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#8a6f32);border-radius:10px;padding:10px 16px;margin-bottom:16px">
        <span style="color:#0a0d12;font-size:20px;font-weight:900;letter-spacing:-0.5px">P</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0">${APP_NAME}</h1>
      <p style="color:#8a9bb5;font-size:12px;margin:4px 0 0">Nigeria's Premier Academic Project AI</p>
    </div>
    <!-- Body -->
    <div style="background:#111620;border:1px solid #1e2a3a;border-top:none;border-radius:0 0 12px 12px;padding:40px">
      ${content}
    </div>
    <!-- Footer -->
    <p style="color:#4a5a72;font-size:11px;text-align:center;margin:20px 0">
      © ${new Date().getFullYear()} ${APP_NAME} | 
      <a href="${APP_URL}" style="color:#c9a84c;text-decoration:none">www.projectassistantai.com.ng</a>
    </p>
  </div>
</body>
</html>`;
}

// ── Email functions ───────────────────────────────────────────────────────

export async function sendVerificationEmail({
  to,
  name,
  verifyUrl,
}: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  const content = `
    <h2 style="color:#e8edf5;font-size:20px;margin:0 0 12px">Verify Your Email Address</h2>
    <p style="color:#8a9bb5;line-height:1.7;margin:0 0 24px">
      Hi ${name}, welcome to ${APP_NAME}! Please verify your email address to activate your account and start generating your research projects.
    </p>
    <div style="text-align:center;margin:32px 0">
      <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#8a6f32);color:#0a0d12;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none">
        ✓ Verify Email Address
      </a>
    </div>
    <p style="color:#4a5a72;font-size:12px;text-align:center">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
    <div style="border-top:1px solid #1e2a3a;margin-top:24px;padding-top:16px">
      <p style="color:#4a5a72;font-size:11px;margin:0">
        Can't click the button? Copy this link:<br/>
        <a href="${verifyUrl}" style="color:#c9a84c;font-size:10px;word-break:break-all">${verifyUrl}</a>
      </p>
    </div>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Verify your ${APP_NAME} account`,
    html: baseTemplate("Verify Email", content),
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const content = `
    <h2 style="color:#e8edf5;font-size:20px;margin:0 0 12px">Reset Your Password</h2>
    <p style="color:#8a9bb5;line-height:1.7;margin:0 0 24px">
      Hi ${name}, we received a request to reset your password. Click the button below to create a new password. This link is valid for 1 hour.
    </p>
    <div style="text-align:center;margin:32px 0">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#8a6f32);color:#0a0d12;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none">
        Reset Password
      </a>
    </div>
    <p style="color:#4a5a72;font-size:12px;text-align:center">
      If you did not request a password reset, please ignore this email. Your account is safe.
    </p>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: baseTemplate("Password Reset", content),
  });
}

export async function sendSupervisorInviteEmail({
  to,
  studentName,
  projectTitle,
  inviteUrl,
}: {
  to: string;
  studentName: string;
  projectTitle: string;
  inviteUrl: string;
}) {
  const content = `
    <h2 style="color:#e8edf5;font-size:20px;margin:0 0 12px">Supervision Invitation</h2>
    <p style="color:#8a9bb5;line-height:1.7;margin:0 0 16px">
      You have been invited by <strong style="color:#c9a84c">${studentName}</strong> to supervise their research project:
    </p>
    <div style="background:#0a0d12;border:1px solid #2a3a52;border-radius:8px;padding:16px 20px;margin:0 0 24px">
      <p style="color:#e8edf5;font-weight:600;margin:0;font-size:15px">"${projectTitle}"</p>
    </div>
    <div style="text-align:center;margin:32px 0">
      <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#8a6f32);color:#0a0d12;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none">
        Accept Supervision
      </a>
    </div>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Supervision invitation from ${studentName} — ${APP_NAME}`,
    html: baseTemplate("Supervision Invitation", content),
  });
}
