# 🔧 Troubleshooting Guide

## Issue: "Port 3000 is in use"

**Problem:** Another Next.js dev server is already running.

**Solution:**

### Option 1: Stop via Ctrl+C
Press `Ctrl+C` in the terminal where the dev server is running.

### Option 2: Kill the process (Windows)
```bash
# Find the process
tasklist | findstr node

# Kill the specific process (replace PID with actual number)
taskkill /F /PID 17000

# Or kill all node processes (nuclear option)
taskkill /F /IM node.exe
```

### Option 3: Use the restart script
```bash
# Windows
scripts/restart-dev.bat

# Unix/Mac/Git Bash
bash scripts/restart-dev.sh
```

---

## Issue: "Unable to acquire lock at .next/dev/lock"

**Problem:** Previous dev server didn't shut down cleanly.

**Solution:**
```bash
# Stop all node processes
taskkill /F /IM node.exe

# Delete the lock file
rm -rf .next

# Restart
npm run dev
```

---

## Issue: "EPERM: operation not permitted" when running Prisma

**Problem:** Dev server is locking Prisma files.

**Solution:**
1. Stop the dev server (`Ctrl+C`)
2. Run `npx prisma generate`
3. Start dev server again

---

## Issue: "Invalid credentials" on login

**Problem:** Trying to use old account with plaintext password.

**Solutions:**

### Option 1: Create a new account
Just sign up again at `/auth/student/signup`

### Option 2: Check for plaintext passwords
```bash
npm run test:auth
```

### Option 3: Clear all passwords
```bash
npx prisma db execute --stdin <<< "UPDATE users SET password_hash = NULL;"
```

---

## Issue: Session not persisting / keeps logging out

**Problem:** Missing or incorrect environment variables.

**Solution:**

1. Check `.env` file has:
```bash
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

2. Generate a new secret:
```bash
openssl rand -base64 32
```

3. Restart dev server:
```bash
# Stop with Ctrl+C
npm run dev
```

4. Clear browser cookies and try again

---

## Issue: "Unauthorized" errors in API routes

**Problem:** Session not being passed correctly.

**Solution:**

1. Check that `AuthProvider` wraps your app in `layout.tsx` ✅ (already done)
2. Verify you're using the correct auth helpers:

```typescript
// Client-side
import { useAuth } from "@/hooks/useAuth";
const { user } = useAuth();

// Server-side
import { requireAuth } from "@/lib/auth";
const user = await requireAuth();
```

3. Check browser console for errors
4. Clear cookies and sign in again

---

## Issue: Google OAuth not working

**Problem:** Missing or incorrect OAuth credentials.

**Solution:**

1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Add to `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
5. Restart dev server

---

## Issue: "Unknown argument `provider`" in Prisma

**Problem:** Prisma client not regenerated after schema changes.

**Solution:**
```bash
# Stop dev server (Ctrl+C)
npx prisma generate
npm run dev
```

---

## Issue: Can't access `/student/dashboard` after login

**Problem:** Middleware redirecting due to email verification.

**Solutions:**

### Check email verification status:
```bash
npx prisma studio
# Look at users table, check email_verified column
```

### Auto-verify in development:
The signup API already auto-verifies in development mode. If not working:

1. Check `NODE_ENV`:
```bash
echo $NODE_ENV  # Should be empty or "development"
```

2. Manually verify in database:
```bash
npx prisma studio
# Set email_verified to true for your user
```

---

## Issue: TypeScript errors in auth files

**Problem:** Type definitions not matching.

**Solution:**

1. Check that bcryptjs types are installed:
```bash
npm install --save-dev @types/bcryptjs
```

2. Regenerate Prisma types:
```bash
npx prisma generate
```

3. Restart TypeScript server in VS Code:
   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"

---

## Issue: Database connection errors

**Problem:** Invalid database URL or connection issues.

**Solution:**

1. Check `.env` has valid database URLs:
```bash
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
```

2. Test connection:
```bash
npx prisma db pull
```

3. Check database is running (if local)

---

## Still Having Issues?

1. **Clear everything and start fresh:**
```bash
# Stop dev server
taskkill /F /IM node.exe

# Clear Next.js cache
rm -rf .next

# Regenerate Prisma
npx prisma generate

# Clear browser data
# In browser: Ctrl+Shift+Delete -> Clear cookies

# Start fresh
npm run dev
```

2. **Check the logs:**
   - Browser console (F12)
   - Terminal output
   - Network tab in DevTools

3. **Verify environment:**
```bash
npm run test:auth
```

4. **Read the docs:**
   - `QUICK_START.md` - Setup guide
   - `AUTH_MIGRATION.md` - Migration details
   - `COMPONENT_UPDATE_EXAMPLE.md` - Code examples

---

## Getting Help

If you're still stuck:

1. Check what error message you're getting
2. Look for that error in this guide
3. Try the suggested solutions
4. Check [NextAuth.js docs](https://next-auth.js.org/)
5. Check [Prisma docs](https://www.prisma.io/docs)
