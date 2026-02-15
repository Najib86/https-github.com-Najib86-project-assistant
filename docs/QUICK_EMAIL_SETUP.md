# Quick Email Setup - 5 Minutes

## 🚀 Fast Setup Guide

### 1. Enable 2FA on Gmail (2 min)
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow prompts to enable

### 2. Generate App Password (1 min)
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail → Other (Custom name)
3. Name it: "Project Assistant"
4. Click "Generate"
5. **Copy the 16-character password**

### 3. Add to .env (1 min)
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
APP_NAME=Project Assistant
NEXT_PUBLIC_URL=http://localhost:3000
```

### 4. Test (1 min)
```bash
npm run dev
```

Add a member with a non-existing email - they should receive an invitation email!

## ✅ Done!

That's it! Your system now sends beautiful invitation emails automatically.

## 📧 What Happens Now

When you add a member:
- **Email exists** → Added immediately
- **Email doesn't exist** → Invitation email sent automatically

## 🎨 Email Preview

Recipients will receive a beautiful HTML email with:
- Project details
- Accept invitation button
- Expiry date
- Professional design

## 🔒 Security Notes

- ✅ Use App Password (not your Gmail password)
- ✅ Never commit `.env` file
- ✅ Keep App Password secret

## 🐛 Issues?

See full guide: [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)

Common fixes:
- Wrong password → Generate new App Password
- 2FA not enabled → Enable it first
- Emails not sending → Check console logs

---

**Need help?** Check the detailed [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)
