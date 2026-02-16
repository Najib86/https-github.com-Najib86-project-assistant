import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.APP_NAME || 'Project Assistant'}" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

// Email Templates

export function getMemberInviteEmailTemplate({
    inviterName,
    projectTitle,
    projectLevel,
    projectType,
    inviteUrl,
    expiresAt,
}: {
    inviterName: string;
    projectTitle: string;
    projectLevel: string;
    projectType: string;
    inviteUrl: string;
    expiresAt: Date;
}) {
    const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px;">👥</span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                                You're Invited!
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Join a project team
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hi there,
                            </p>
                            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                                <strong>${inviterName}</strong> has invited you to join their project team. Here are the details:
                            </p>
                            
                            <!-- Project Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Project
                                        </p>
                                        <p style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 700; line-height: 1.4;">
                                            ${projectTitle}
                                        </p>
                                        <div style="display: flex; gap: 8px; align-items: center;">
                                            <span style="color: #6b7280; font-size: 13px; font-weight: 500;">${projectLevel}</span>
                                            <span style="color: #d1d5db;">•</span>
                                            <span style="color: #6b7280; font-size: 13px; font-weight: 500;">${projectType}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                By accepting this invitation, you'll gain access to:
                            </p>
                            <ul style="margin: 0 0 30px; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                                <li>Project workspace and chapters</li>
                                <li>Team collaboration tools</li>
                                <li>Real-time updates and notifications</li>
                                <li>Document sharing and comments</li>
                            </ul>
                            
                            <!-- Expiry Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">
                                            ⏰ This invitation expires on ${expiryDate}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; line-height: 1.6;">
                                If you don't have an account yet, you'll be able to create one when you click the link above.
                            </p>
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; color: #667eea; font-size: 12px; word-break: break-all;">
                                ${inviteUrl}
                            </p>
                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                                © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Assistant'}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const text = `
You're Invited to Join a Project Team!

Hi there,

${inviterName} has invited you to join their project team.

Project Details:
- Title: ${projectTitle}
- Level: ${projectLevel}
- Type: ${projectType}

Accept your invitation here:
${inviteUrl}

By accepting, you'll gain access to:
- Project workspace and chapters
- Team collaboration tools
- Real-time updates and notifications
- Document sharing and comments

⏰ This invitation expires on ${expiryDate}

If you don't have an account yet, you'll be able to create one when you click the link.

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Assistant'}
    `;

    return { html, text };
}

export async function sendMemberInviteEmail({
    to,
    inviterName,
    projectTitle,
    projectLevel,
    projectType,
    inviteUrl,
    expiresAt,
}: {
    to: string;
    inviterName: string;
    projectTitle: string;
    projectLevel: string;
    projectType: string;
    inviteUrl: string;
    expiresAt: Date;
}) {
    const { html, text } = getMemberInviteEmailTemplate({
        inviterName,
        projectTitle,
        projectLevel,
        projectType,
        inviteUrl,
        expiresAt,
    });

    return sendEmail({
        to,
        subject: `You're invited to join "${projectTitle}"`,
        html,
        text,
    });
}

export function getMemberAddedEmailTemplate({
    inviterName,
    projectTitle,
    projectLevel,
    projectType,
    projectUrl,
}: {
    inviterName: string;
    projectTitle: string;
    projectLevel: string;
    projectType: string;
    projectUrl: string;
}) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've been added to a project</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px;">✅</span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                                You've been added!
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Welcome to the team
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                Hi there,
                            </p>
                            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                                <strong>${inviterName}</strong> has added you to their project team. You can now access the project workspace.
                            </p>
                            
                            <!-- Project Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Project
                                        </p>
                                        <p style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 700; line-height: 1.4;">
                                            ${projectTitle}
                                        </p>
                                        <div style="display: flex; gap: 8px; align-items: center;">
                                            <span style="color: #6b7280; font-size: 13px; font-weight: 500;">${projectLevel}</span>
                                            <span style="color: #d1d5db;">•</span>
                                            <span style="color: #6b7280; font-size: 13px; font-weight: 500;">${projectType}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="${projectUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                                            View Project
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                                © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Assistant'}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const text = `
You've been added to a project team!

Hi there,

${inviterName} has added you to their project team.

Project Details:
- Title: ${projectTitle}
- Level: ${projectLevel}
- Type: ${projectType}

Access the project here:
${projectUrl}

---
© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Assistant'}
    `;

    return { html, text };
}

export async function sendMemberAddedEmail({
    to,
    inviterName,
    projectTitle,
    projectLevel,
    projectType,
    projectUrl,
}: {
    to: string;
    inviterName: string;
    projectTitle: string;
    projectLevel: string;
    projectType: string;
    projectUrl: string;
}) {
    const { html, text } = getMemberAddedEmailTemplate({
        inviterName,
        projectTitle,
        projectLevel,
        projectType,
        projectUrl,
    });

    return sendEmail({
        to,
        subject: `You've been added to "${projectTitle}"`,
        html,
        text,
    });
}

// Email Verification Template
export function getVerificationEmailTemplate({
    name,
    verificationUrl
}: {
    name: string;
    verificationUrl: string;
}): string {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
      .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; text-align: center; }
      .footer { color: #666; font-size: 12px; margin-top: 20px; }
      .code { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to Project Assistant</h1>
      </div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please verify your email address to get started.</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button" style="width: 200px;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link:<br><div class="code">${verificationUrl}</div></p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
      <div class="footer">
        <p>If you didn't sign up, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>
    `;
}

export async function sendVerificationEmail({
    to,
    name,
    verificationUrl
}: {
    to: string;
    name: string;
    verificationUrl: string;
}): Promise<void> {
    const html = getVerificationEmailTemplate({ name, verificationUrl });

    await sendEmail({
        to,
        subject: "Verify Your Email - Project Assistant",
        html,
        text: `Verify your email: ${verificationUrl}`
    });
}

// Password Reset Email Template
export function getPasswordResetEmailTemplate({
    name,
    resetUrl
}: {
    name: string;
    resetUrl: string;
}): string {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
      .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; text-align: center; }
      .warning { background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 14px; border-left: 4px solid #dc2626; }
      .footer { color: #666; font-size: 12px; margin-top: 20px; }
      .code { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button" style="width: 200px;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy this link:<br><div class="code">${resetUrl}</div></p>
        <div class="warning">
          <strong>⚠️ Security Note:</strong> This link expires in 1 hour and can only be used once.
        </div>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Project Assistant. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `;
}

export async function sendPasswordResetEmail({
    to,
    name,
    resetUrl
}: {
    to: string;
    name: string;
    resetUrl: string;
}): Promise<void> {
    const html = getPasswordResetEmailTemplate({ name, resetUrl });

    await sendEmail({
        to,
        subject: "Password Reset - Project Assistant",
        html,
        text: `Reset your password: ${resetUrl}`
    });
}
