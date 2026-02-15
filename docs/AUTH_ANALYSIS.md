# Authentication System Analysis

## Overview
This project implements a comprehensive authentication system using **Next.js 16** with **NextAuth.js v4** as the session management layer, **PostgreSQL** via **Prisma** ORM for data persistence, and **bcryptjs** for password hashing.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js)                      │
│  ┌──────────────────────────────────────────────────────┤
│  │  /auth/login     │  /auth/student/signup              │
│  │  /verify-email   │  /auth/supervisor/signup           │
│  └──────────────────────────────────────────────────────┤
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Requests
┌──────────────────────▼──────────────────────────────────┐
│                  API Layer (Route Handlers)              │
│  ┌──────────────────────────────────────────────────────┤
│  │  POST /api/auth/signup                               │
│  │  POST /api/auth/[...nextauth]                        │
│  └──────────────────────────────────────────────────────┤
└──────────────────────┬──────────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────────┐
│                  Database (PostgreSQL)                   │
│  ┌──────────────────────────────────────────────────────┤
│  │  users table (email, password_hash, role, etc.)      │
│  └──────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────┘
```

---

## User Model (Database Schema)

**Location:** [prisma/schema.prisma](prisma/schema.prisma#L12-L28)

```prisma
model User {
  id              Int                @id @default(autoincrement())
  name            String
  email           String             @unique
  password        String?            @map("password_hash")
  role            String             @default("student")
  department      String?
  provider        String?            @default("credentials")
  email_verified  Boolean            @default(false)
  createdAt       DateTime           @default(now())
  
  // Relations
  comments        Comment[]
  exports         Export[]
  projects        Project[]          @relation("StudentProjects")
  supervises      Project[]          @relation("SupervisorProjects")
  projectMembers  ProjectMember[]
  acceptedInvites SupervisorInvite[] @relation("AcceptedInvites")
  sentInvites     MemberInvite[]     @relation("InvitedMembers")
  messages        Message[]
  activities      ProjectActivity[]
}
```

**Key Fields:**
- `email`: Unique identifier, used for login
- `password`: Hashed with bcryptjs (stored as password_hash)
- `role`: Either `"student"` or `"supervisor"`
- `provider`: Authentication provider (`"credentials"`, `"google"`)
- `email_verified`: Boolean flag for email verification status

---

## Authentication Flow

### 1. Sign Up Flow

**Location:** [src/app/(auth)/auth/student/signup/page.tsx](src/app/(auth)/auth/student/signup/page.tsx)

```
User fills signup form
    ↓
[POST] /api/auth/signup
    ↓
Validate input (Zod schema)
    ↓
Check if email exists
    ↓
Hash password with bcryptjs (salt rounds: 10)
    ↓
Create new User in database
    ↓
Auto-verify email (development only)
    ↓
Auto sign in with credentials provider
    ↓
Redirect to /student/dashboard
```

**Signup Validation Schema** - [src/lib/validations/auth.ts](src/lib/validations/auth.ts):
```typescript
signupSchema: {
  name: min 2 characters
  email: valid email format
  password: min 6 characters
  role: "student" | "supervisor" (default: "student")
}
```

**API Endpoint:** [src/app/api/auth/signup/route.ts](src/app/api/auth/signup/route.ts)

**Process:**
1. Validates request body using Zod
2. Checks for duplicate email
3. Hashes password with bcryptjs (10 rounds)
4. Creates user with `email_verified: false` by default
5. **TODO:** Sends verification email (currently auto-verifies in dev)
6. Returns 201 with user data

---

### 2. Login Flow

**Location:** [src/app/(auth)/auth/login/page.tsx](src/app/(auth)/auth/login/page.tsx)

```
User enters email & password
    ↓
[POST] signIn("credentials", {...})
    ↓
NextAuth Credentials Provider validates
    ↓
Find user by email
    ↓
Compare password with bcryptjs
    ↓
Return user object with role & email_verified
    ↓
JWT token created
    ↓
Session established
    ↓
Redirect based on role
```

**Login Validation Schema:**
```typescript
loginSchema: {
  email: valid email format
  password: min 6 characters
}
```

---

### 3. Google OAuth Flow

**Location:** [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts#L56-L85)

```
User clicks "Sign in with Google"
    ↓
Google OAuth consent screen
    ↓
Callback to app with OAuth token
    ↓
Check if user exists by email
    ↓
If exists: Update provider & mark email_verified=true
If new: Create user with provider="google" & email_verified=true
    ↓
Session established
    ↓
Redirect to /student/dashboard
```

**Auto-signup behavior:** Google users are automatically created if they don't exist.

---

## NextAuth Configuration

**Location:** [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts)

### Providers

1. **Credentials Provider** - Email/password authentication
   ```typescript
   CredentialsProvider({
     email: { label: "Email", type: "email" },
     password: { label: "Password", type: "password" }
   })
   ```

2. **Google Provider** - OAuth 2.0 with Google
   ```typescript
   GoogleProvider({
     clientId: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET
   })
   ```

### Key Callbacks

**signIn Callback:**
- Handles Google OAuth user creation/update
- Returns `true` to allow sign-in, `false` to deny

**jwt Callback:**
- Adds `id`, `email`, `role`, `emailVerified` to JWT token
- Called whenever JWT is created/updated

**session Callback:**
- Populates session object from JWT token
- Provides user data to client-side `useSession()`

### Session Strategy
- **Strategy:** JWT
- **No database lookup** on each request (faster)
- Token passed in httpOnly cookie

### Configuration
```typescript
session: { strategy: "jwt" },
secret: process.env.NEXTAUTH_SECRET,
pages: {
  signIn: "/auth/login",
  error: "/auth/login"
}
```

---

## Protected Routes & Middleware

**Location:** [src/middleware.ts](src/middleware.ts)

### Route Protection

Applies to: `/student/*` and `/supervisor/*`

**Checks performed:**
1. ✅ User is logged in (token exists)
2. ✅ Email is verified
3. ✅ User has correct role for the route

**Flow:**
```
Request to /student/dashboard
    ↓
Middleware extracts JWT token
    ↓
Check: token.email exists?
    ↓
Check: token.emailVerified === true?
    ↓
Check: token.role === "student"?
    ↓
If all pass → NextResponse.next() (allow)
If any fail → Redirect to /auth/login or /verify-email
```

### Current Protected Routes
- `/student/*` - Requires `role: "student"` + email verification
- `/supervisor/*` - Requires `role: "supervisor"` + email verification

---

## Email Verification

**Location:** [src/app/(auth)/verify-email/page.tsx](src/app/(auth)/verify-email/page.tsx)

### Current Status
- ⚠️ **Placeholder implementation**
- New users get `email_verified: false`
- Auto-verified in development mode
- Middleware blocks unverified users

### Flow
```
User signs up
    ↓
email_verified = false
    ↓
Middleware redirects to /verify-email
    ↓
User sees verification page (placeholder)
    ↓
TODO: Send verification email with OTP/link
    ↓
User verifies email
    ↓
Set email_verified = true
    ↓
Redirect to dashboard
```

---

## Client-Side Authentication

**Location:** [src/lib/auth.ts](src/lib/auth.ts)

### Server Utilities

```typescript
// Get current user session
async function getCurrentUser()

// Require user to be authenticated
async function requireAuth()

// Require specific role
async function requireRole(role: "student" | "supervisor")
```

### Usage on Server
```typescript
// In API routes or server components
const user = await getCurrentUser();
const user = await requireAuth(); // Throws if not authenticated
const user = await requireRole("student"); // Throws if wrong role
```

---

## Auth Pages Structure

| Route | Component | Purpose |
|-------|-----------|---------|
| `/auth/login` | [Login](src/app/(auth)/auth/login/page.tsx) | Email/password login + Google OAuth |
| `/auth/student/signup` | [Student Signup](src/app/(auth)/auth/student/signup/page.tsx) | Create student account |
| `/auth/supervisor/signup` | [Supervisor Signup](src/app/(auth)/auth/supervisor/signup/page.tsx) | Create supervisor account |
| `/verify-email` | [Email Verification](src/app/(auth)/verify-email/page.tsx) | Verify email address (placeholder) |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next-auth` | ^4.24.13 | Session & authentication management |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `prisma` | - | ORM for database operations |
| `zod` | - | Input validation |
| `nextjs` | 16.1.6 | React framework |

---

## Environment Variables Required

```bash
# NextAuth
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# Database
DATABASE_URL=postgresql://user:pass@host/dbname
DATABASE_URL_UNPOOLED=postgresql://user:pass@host/dbname

# Node Environment
NODE_ENV=production
```

---

## Security Features

✅ **Password Hashing**
- Uses bcryptjs with 10 salt rounds
- Never stored in plain text

✅ **JWT Tokens**
- Stored in httpOnly cookie
- CSRF protected

✅ **Email Verification**
- Required before accessing protected routes
- Enforced in middleware

✅ **Role-Based Access**
- Routes protected by role
- Middleware validates role on each request

✅ **Input Validation**
- Zod schemas for all auth inputs
- Type-safe validation

⚠️ **Potential Issues**
- Email verification currently auto-enables in dev
- No rate limiting on signup/login
- No account lockout after failed attempts
- Verification email not yet implemented

---

## Signup vs Login Comparison

| Feature | Signup | Login |
|---------|--------|-------|
| **Email Check** | Must be unique | Must exist |
| **Password** | Hashed and stored | Compared with hash |
| **Email Verified** | False (dev: true) | Required (middleware) |
| **Auto Sign-in** | Yes | No |
| **OAuth Option** | Not used | Available (Google) |
| **Redirect** | `/student/dashboard` | Based on role |

---

## Session Data Structure

```typescript
session.user = {
  id: string;           // User ID
  name: string;         // User name
  email: string;        // User email
  role: "student" | "supervisor";
  emailVerified: boolean;
  image?: string;       // From Google provider
}
```

---

## Key Implementation Details

### Password Hashing
- **Algorithm:** bcryptjs
- **Salt Rounds:** 10
- **Location:** `/api/auth/signup`

### JWT Token
- **Payload:** `{ id, email, role, emailVerified }`
- **Storage:** Secure httpOnly cookie
- **Validity:** Session-based

### Provider Integration
- **Credentials:** Built-in form validation
- **Google:** Auto-creates users, marks email verified
- **Database Sync:** All providers store in same User table

---

## Error Handling

**Signup Errors:**
- `409` - User already exists
- `400` - Invalid input format
- `500` - Server error

**Login Errors:**
- `"Invalid email or password"` - Wrong credentials
- `"Google sign-in failed"` - OAuth error

**Route Protection:**
- Redirects to `/auth/login` - Not authenticated
- Redirects to `/verify-email` - Email not verified
- Redirects to `/auth/login?error=unauthorized` - Wrong role

---

## Testing Commands

Check if authentication is working:
```bash
npm run test:auth  # Run test-auth.mjs script
```

---

## Next Steps / Recommendations

1. **Implement Email Verification**
   - Generate verification tokens
   - Send verification emails
   - Create verification endpoint

2. **Add Rate Limiting**
   - Limit signup/login attempts
   - Use Redis for tracking

3. **Add Account Lockout**
   - Lock after N failed attempts
   - Time-based or manual unlock

4. **Enhance Security**
   - Add CAPTCHA for signup
   - Implement 2FA
   - Add password reset flow

5. **Continue Story**
   - Supervisor role specific pages
   - Member invitation system
   - Email-based invitations

---

## Related Files
- [Email Configuration](EMAIL_SETUP_GUIDE.md)
- [Member Invite System](MEMBER_INVITE_SYSTEM.md)
- [Supervisor Invites](INVITE_SYSTEM.md)
