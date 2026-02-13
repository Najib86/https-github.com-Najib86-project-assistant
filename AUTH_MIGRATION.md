# Authentication Migration to NextAuth

## What Changed

The authentication system has been migrated from a custom localStorage-based solution to NextAuth.js with proper security measures.

## Key Improvements

1. **Password Security**: Passwords are now hashed using bcrypt (10 rounds)
2. **Session Management**: JWT-based sessions with HTTP-only cookies
3. **OAuth Support**: Google OAuth is now functional
4. **Role-Based Access**: Middleware enforces student/supervisor role separation
5. **Email Verification**: Framework in place (auto-verified in development)

## Breaking Changes

### For Users

- All existing users need to re-register (old plaintext passwords are incompatible)
- Sessions are now server-managed (no more localStorage)

### For Developers

- `localStorage.getItem("user")` is deprecated
- Use `useAuth()` hook or `useSession()` from next-auth/react instead
- Server-side: Use `getCurrentUser()` or `requireAuth()` from `@/lib/auth`

## Migration Steps

### 1. Update Environment Variables

Add to your `.env` file:

```bash
# Required for NextAuth
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl
NEXTAUTH_URL=http://localhost:3000

# Optional: For Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### 2. Update Database (if needed)

The schema already supports the new auth system. If you have existing users with plaintext passwords, you need to either:

**Option A: Reset all passwords**

```sql
UPDATE users SET password = NULL WHERE provider = 'credentials';
```

Then ask users to re-register.

**Option B: Migrate existing passwords** (not recommended, just re-register)

### 3. Update Client Components

Replace localStorage usage with NextAuth hooks:

**Before:**

```typescript
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
```

**After:**

```typescript
import { useAuth } from "@/hooks/useAuth";

const { user, role, isAuthenticated, isLoading } = useAuth();
```

Or use NextAuth directly:

```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
const user = session?.user;
```

### 4. Update Server Components/API Routes

**Before:**

```typescript
// No proper auth checking
```

**After:**

```typescript
import { requireAuth, requireRole } from "@/lib/auth";

// In API routes
const user = await requireAuth(); // Throws if not authenticated
const student = await requireRole("student"); // Throws if not student
```

### 5. Sign Out Users

**Before:**

```typescript
localStorage.removeItem("user");
router.push("/login");
```

**After:**

```typescript
import { signOut } from "next-auth/react";

await signOut({ callbackUrl: "/auth/login" });
```

## New Features

### Google OAuth Login

Users can now sign in with Google. The button is already added to login/signup pages.

### Email Verification

- Framework is in place
- Currently auto-verified in development mode
- Production: Implement email sending in `src/app/api/auth/signup/route.ts`

### Role-Based Routing

Middleware automatically redirects:

- Students trying to access `/supervisor/*` → login
- Supervisors trying to access `/student/*` → login
- Unverified emails → `/verify-email`

## Files Changed

### New Files

- `src/lib/auth.ts` - Server-side auth helpers
- `src/hooks/useAuth.ts` - Client-side auth hook
- `AUTH_MIGRATION.md` - This file

### Modified Files

- `src/app/api/auth/[...nextauth]/route.ts` - Enhanced with bcrypt, better callbacks
- `src/app/api/auth/signup/route.ts` - Now hashes passwords, validates input
- `src/app/(auth)/auth/login/page.tsx` - Uses NextAuth signIn()
- `src/app/(auth)/auth/student/signup/page.tsx` - Auto-login after signup
- `src/app/(auth)/auth/supervisor/signup/page.tsx` - Auto-login after signup
- `src/middleware.ts` - Simplified, role-based protection

### Deleted Files

- `src/app/api/auth/login/route.ts` - Replaced by NextAuth

## Testing

1. **Sign Up**: Create a new student account
2. **Sign In**: Log in with credentials
3. **Google OAuth**: Test Google sign-in (requires OAuth setup)
4. **Role Protection**: Try accessing `/supervisor/dashboard` as a student
5. **Session Persistence**: Refresh page, session should persist

## TODO

- [X] Implement email verification service (SendGrid, Resend, etc.)
- [ ] Add password reset functionality
- [ ] Update all components using localStorage
- [X] Add "Remember me" option
- [ ] Implement rate limiting on auth endpoints
- [ ] Add 2FA support (optional)

## Support

If you encounter issues:

1. Clear browser cookies
2. Check `.env` has `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
3. Verify database connection
4. Check console for errors
