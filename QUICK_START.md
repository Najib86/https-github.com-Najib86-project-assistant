# 🚀 Quick Start - NextAuth Setup

## 1. Set Environment Variables (2 minutes)

Create or update your `.env` file:

```bash
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=paste-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Your existing database URLs
DATABASE_URL=your-database-url
DATABASE_URL_UNPOOLED=your-database-url-unpooled

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 2. Test the System (1 minute)

```bash
# Run auth system test
npm run test:auth

# Start dev server
npm run dev
```

## 3. Test Authentication (3 minutes)

Open http://localhost:3000

1. Go to `/auth/student/signup`
2. Create a new account
3. You'll be auto-logged in and redirected to `/student/dashboard`
4. Try accessing `/supervisor/dashboard` - should redirect (wrong role)
5. Sign out and sign in again

## 4. Update Your Components (10-30 minutes)

Replace localStorage usage with NextAuth:

**Find files to update:**
```bash
grep -r "localStorage.getItem" src/
```

**Update pattern:**
```typescript
// Before
const userStr = localStorage.getItem("user");
const user = JSON.parse(userStr);

// After
import { useAuth } from "@/hooks/useAuth";
const { user, role, isAuthenticated } = useAuth();
```

See `COMPONENT_UPDATE_EXAMPLE.md` for detailed examples.

## 5. Optional: Setup Google OAuth (10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

## Common Commands

```bash
# Test auth system
npm run test:auth

# Start development server
npm run dev

# Restart dev server (if stuck)
# Windows:
scripts/restart-dev.bat
# Unix/Mac:
bash scripts/restart-dev.sh

# Or manually:
# 1. Stop dev server (Ctrl+C)
# 2. Regenerate Prisma: npx prisma generate
# 3. Start again: npm run dev

# Open Prisma Studio (view database)
npx prisma studio

# Clear all passwords (if migrating)
npx prisma db execute --stdin <<< "UPDATE users SET password_hash = NULL;"
```

## Troubleshooting

### Can't login with old account?
Old accounts have plaintext passwords. Create a new account or clear passwords:
```bash
npm run test:auth  # Check for plaintext passwords
```

### Session not persisting?
- Check `NEXTAUTH_SECRET` is set in `.env`
- Clear browser cookies
- Restart dev server

### Google OAuth not working?
- Verify OAuth credentials in Google Cloud Console
- Check redirect URI matches exactly
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env`

## What's Next?

- [ ] Update components using localStorage (see `COMPONENT_UPDATE_EXAMPLE.md`)
- [ ] Test all authentication flows
- [ ] Setup email verification (optional)
- [ ] Configure Google OAuth (optional)
- [ ] Add password reset (optional)

## Need Help?

- `AUTH_MIGRATION.md` - Detailed migration guide
- `COMPONENT_UPDATE_EXAMPLE.md` - Code examples
- `AUTH_SETUP_COMPLETE.md` - Complete overview
- [NextAuth Docs](https://next-auth.js.org/)

---

**Time to complete**: ~15-45 minutes depending on component updates
