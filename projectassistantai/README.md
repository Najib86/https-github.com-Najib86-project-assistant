# ProjectAssistantAI

**Nigeria's Premier Academic Project AI Platform**  
🇳🇬 www.projectassistantai.com.ng

An advanced AI-powered platform that guides Nigerian university students through the research project writing process while streamlining the supervision workflow. Built with Next.js 15, Neon PostgreSQL, and a multi-provider AI engine.

---

## ✨ Features

### For Students
- **AI Prompt Generator** — Generates precision-engineered prompts that produce complete 90–120 page NOUN-compliant research projects with chapters, charts, tables, and references
- **5-Chapter AI Writing** — Generate each chapter individually using Claude/Gemini/Groq with full NOUN academic guidelines
- **Chapter Editor** — Rich text editor with auto-save, version history, and AI "Continue Writing" copilot
- **Progress Tracking** — Visual chapter progress with word counts and approval status
- **Prompt History** — Save, copy, and download all generated prompts

### For Supervisors
- **Review Dashboard** — View all supervised students and project statuses
- **Chapter Approval** — Approve chapters or request revisions with one click
- **Inline Comments** — Leave specific feedback per chapter
- **Invite System** — Students share a unique code to invite supervisors

### Platform
- **RBAC Authentication** — Student/Supervisor/Admin roles via NextAuth.js
- **Google OAuth** — Sign in with Google with automatic role assignment
- **Security Hardening** — Account lockout, rate limiting, SHA-256 token hashing
- **AI Provider Fallback** — Claude → Gemini → Groq → Mock (circuit breaker pattern)
- **Redis Caching** — 1-hour prompt caching via Upstash
- **Neon PostgreSQL** — Serverless Postgres with Prisma ORM

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/projectassistantai.git
cd projectassistantai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials:

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | [Neon Console](https://console.neon.tech) → Connection string (pooled) |
| `DIRECT_URL` | Neon Console → Connection string (direct, no pooler) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com) |
| `UPSTASH_REDIS_REST_URL` | [Upstash Console](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Console |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail App Password |

> **Minimum required:** `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and at least one AI API key (`ANTHROPIC_API_KEY` recommended).

### 3. Set Up Neon Database

```bash
# Push schema to Neon
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo Accounts:**
- Student: `student@demo.com` / `Student@123`
- Supervisor: `supervisor@demo.com` / `Supervisor@123`

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar + topbar
│   │   ├── generate/page.tsx             # AI Prompt Generator
│   │   ├── student/
│   │   │   ├── dashboard/page.tsx        # Student home
│   │   │   ├── projects/                 # CRUD projects
│   │   │   │   ├── page.tsx              # List
│   │   │   │   ├── new/page.tsx          # Create
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail + AI generate
│   │   │   │       └── chapters/[chapterId]/page.tsx  # Editor
│   │   │   ├── history/page.tsx          # Prompt history
│   │   │   └── settings/page.tsx         # Account settings
│   │   └── supervisor/
│   │       ├── dashboard/page.tsx        # Supervisor home
│   │       └── projects/[id]/page.tsx    # Review project
│   ├── api/
│   │   ├── auth/                         # NextAuth + signup + verify
│   │   ├── projects/                     # CRUD + single project
│   │   ├── chapters/                     # Generate + update + versions
│   │   ├── prompts/                      # Generate + history + single
│   │   ├── comments/                     # Create + list + resolve
│   │   ├── invite/                       # Accept supervisor invitation
│   │   └── user/                         # Profile + password
│   ├── auth/                             # Login + signup pages
│   └── page.tsx                          # Landing page
├── lib/
│   ├── ai/ai.orchestrator.ts             # Claude→Gemini→Groq fallback
│   ├── auth/auth.config.ts               # NextAuth RBAC config
│   ├── auth/rate-limit.ts                # Upstash rate limiting
│   ├── guidelines.ts                     # 170+ line academic constitution
│   ├── prompt-builder.ts                 # Master prompt generator
│   ├── email.ts                          # Nodemailer templates
│   └── prisma.ts                         # Neon + Prisma adapter
├── components/providers/Providers.tsx    # SessionProvider
└── middleware.ts                          # Route protection + RBAC
```

---

## 🗄️ Database Schema (Neon PostgreSQL)

| Model | Purpose |
|-------|---------|
| `User` | Auth data, role, security counters |
| `Project` | Central entity linking student + supervisor |
| `Chapter` | One of 5 chapters with content + status |
| `ChapterVersion` | Version history snapshots |
| `Comment` | Supervisor inline feedback |
| `Citation` | APA citation storage |
| `GeneratedPrompt` | Saved AI prompts with config |
| `ActivityLog` | Audit trail |
| `SiteStats` | Aggregate platform metrics |

---

## 🤖 AI Engine

The AI orchestrator (`src/lib/ai/ai.orchestrator.ts`) provides:
- **Provider chain:** Claude Sonnet → Gemini 1.5 Flash → Groq Llama-3.1 → Mock
- **Circuit breaker:** Marks providers unhealthy after auth errors, resets after 5 minutes
- **Streaming:** Server-sent events for real-time chapter generation
- **Caching:** Upstash Redis with 1-hour TTL keyed by prompt hash

### Academic Guidelines Engine
Every AI request is injected with `NOUN_GUIDELINES` from `src/lib/guidelines.ts`:
- 5-chapter structure enforcement
- APA 7th Edition citation rules
- Objective scholarly voice (no "I think/feel")
- Nigerian university formatting standards
- Chapter-specific prompt templates

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt (12 rounds) |
| Token storage | SHA-256 hashed before DB storage |
| Session tokens | Single-use, deleted on consumption |
| Account lockout | 5 failed attempts → 30 min lock |
| Rate limiting | Upstash Redis (login: 5/15min, signup: 3/1hr, AI: 10/min) |
| Security headers | CSP, X-Frame-Options, HSTS, nosniff |
| RBAC | Middleware + API route guards |

---

## 📦 Deployment (Vercel)

```bash
# Build
npm run build

# Deploy
vercel deploy --prod
```

**Vercel Environment Variables:** Add all variables from `.env.example` to your Vercel project settings.

**Neon Configuration:**
- Use the **pooled** connection string for `DATABASE_URL`
- Use the **direct** connection string for `DIRECT_URL` (needed for migrations)

---

## 🛠️ Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run db:push       # Push schema to Neon (no migration history)
npm run db:migrate    # Run pending migrations
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset DB + re-seed
```

---

## 📄 License

MIT © ProjectAssistantAI.com.ng

---

*Built with ❤️ for Nigerian university students*
