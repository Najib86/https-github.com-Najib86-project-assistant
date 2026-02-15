# Email Setup Guide - Gmail with Nodemailer

## Overview

The system uses Nodemailer with Gmail to send invitation emails to team members. This guide will help you set up Gmail for sending emails.

## 📋 Prerequisites

- Gmail account
- Node.js project with Nodemailer installed

## 🔧 Setup Steps

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2FA

**Why?** App Passwords are only available when 2FA is enabled.

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Or navigate: Google Account → Security → 2-Step Verification → App passwords
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Enter name: "Project Assistant" or any name you prefer
6. Click "Generate"
7. **Copy the 16-character password** (you won't see it again!)

**Example App Password:** `abcd efgh ijkl mnop` (remove spaces when using)

### Step 3: Add to Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
APP_NAME=Project Assistant
NEXT_PUBLIC_URL=http://localhost:3000
```

**Important:**
- Use your full Gmail address for `GMAIL_USER`
- Use the App Password (without spaces) for `GMAIL_APP_PASSWORD`
- Update `NEXT_PUBLIC_URL` for production

### Step 4: Test the Configuration

Create a test script or use the API to send a test email:

```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Hello!</h1><p>This is a test email.</p>',
});
```

## 🎨 Email Template

The system includes a beautiful HTML email template with:
- Gradient header with icon
- Project details box
- Call-to-action button
- Expiry notice
- Plain text fallback

### Preview

```
┌─────────────────────────────────────┐
│  [Gradient Header with 👥 Icon]     │
│  You're Invited!                    │
│  Join a project team                │
├─────────────────────────────────────┤
│                                      │
│  Hi there,                          │
│                                      │
│  John Doe has invited you to join   │
│  their project team.                │
│                                      │
│  ┌───────────────────────────────┐  │
│  │ PROJECT                       │  │
│  │ AI in Healthcare              │  │
│  │ UG • System-Based             │  │
│  └───────────────────────────────┘  │
│                                      │
│      [Accept Invitation Button]     │
│                                      │
│  ⏰ Expires on February 22, 2026    │
│                                      │
└─────────────────────────────────────┘
```

## 🔒 Security Best Practices

### 1. Never Commit Credentials
```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Use App Passwords
- ✅ Use App Passwords (16 characters)
- ❌ Never use your actual Gmail password

### 3. Rotate Passwords Regularly
- Generate new App Password every 3-6 months
- Revoke old App Passwords

### 4. Limit Access
- Only give App Password to trusted team members
- Use separate App Passwords for different environments

### 5. Monitor Usage
- Check Gmail "Sent" folder for unusual activity
- Review Google Account activity regularly

## 🚨 Troubleshooting

### Error: "Invalid login"
**Cause:** Wrong email or App Password

**Solution:**
1. Verify `GMAIL_USER` is correct
2. Verify `GMAIL_APP_PASSWORD` has no spaces
3. Generate a new App Password
4. Ensure 2FA is enabled

### Error: "Username and Password not accepted"
**Cause:** Using regular password instead of App Password

**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new App Password
3. Use that instead of your regular password

### Error: "Less secure app access"
**Cause:** Old Gmail security setting (deprecated)

**Solution:**
- This setting no longer exists
- Use App Passwords instead

### Emails Not Sending
**Possible Causes:**
1. Wrong credentials
2. 2FA not enabled
3. App Password revoked
4. Gmail sending limits reached

**Solution:**
1. Check console logs for errors
2. Verify credentials in `.env`
3. Check Gmail "Sent" folder
4. Wait if rate limited (Gmail has daily limits)

### Emails Going to Spam
**Possible Causes:**
1. No SPF/DKIM records
2. Suspicious content
3. High volume

**Solution:**
1. Ask recipients to mark as "Not Spam"
2. Use professional email content
3. Don't send too many emails at once
4. Consider using a dedicated email service for production

## 📊 Gmail Sending Limits

### Free Gmail Account
- **500 emails per day**
- **500 recipients per email**
- **2000 emails per day** (if using Google Workspace)

### Rate Limiting
If you hit the limit:
- Wait 24 hours
- Emails will queue automatically
- Consider upgrading to Google Workspace

## 🌐 Production Considerations

### For Production, Consider:

1. **Dedicated Email Service**
   - SendGrid
   - AWS SES
   - Mailgun
   - Postmark

2. **Custom Domain**
   - Use your own domain instead of Gmail
   - Better deliverability
   - Professional appearance

3. **Email Tracking**
   - Track opens and clicks
   - Monitor bounce rates
   - Analyze engagement

4. **Transactional Email Service**
   - Better reliability
   - Higher sending limits
   - Advanced features

## 🔄 Alternative: Using Google Workspace

If you have Google Workspace (formerly G Suite):

```env
GMAIL_USER=your-email@yourdomain.com
GMAIL_APP_PASSWORD=your-app-password
```

**Benefits:**
- Higher sending limits (2000/day)
- Custom domain
- Better for business use

## 📝 Environment Variables Reference

```env
# Required
GMAIL_USER=your-email@gmail.com          # Your Gmail address
GMAIL_APP_PASSWORD=abcdefghijklmnop      # 16-char App Password (no spaces)

# Optional
APP_NAME=Project Assistant                # App name in emails
NEXT_PUBLIC_URL=http://localhost:3000    # Base URL for invite links
```

## 🧪 Testing

### Test Email Sending

```bash
# In your project
npm run dev

# Then test via API or create a test route
```

### Test Route (Optional)

Create `src/app/api/test-email/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
    const result = await sendEmail({
        to: 'your-test-email@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1><p>If you receive this, email is working!</p>',
    });

    return NextResponse.json(result);
}
```

Visit: `http://localhost:3000/api/test-email`

## ✅ Verification Checklist

Before going live:

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated
- [ ] Environment variables set in `.env`
- [ ] `.env` added to `.gitignore`
- [ ] Test email sent successfully
- [ ] Email appears in recipient's inbox (not spam)
- [ ] Invite link works correctly
- [ ] Email template looks good on mobile
- [ ] Plain text version readable

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Google 2FA Setup](https://support.google.com/accounts/answer/185839)
- [Gmail Sending Limits](https://support.google.com/mail/answer/22839)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all environment variables are set
4. Test with a simple email first
5. Check Gmail "Sent" folder

## 🔐 Security Reminder

**Never share or commit:**
- Your Gmail password
- Your App Password
- Your `.env` file

**Always:**
- Use App Passwords
- Enable 2FA
- Rotate passwords regularly
- Monitor account activity

---

**Setup Complete!** 🎉

Your system is now ready to send beautiful invitation emails to team members.
