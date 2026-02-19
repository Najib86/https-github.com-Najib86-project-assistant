# Project Assistant AI - Comprehensive Documentation

**Project Assistant** is an advanced AI-powered platform designed to guide university students through the thesis/project writing process while streamlining the supervision workflow. It bridges the gap between Generative AI capabilities and strict academic rigor, offering tailored interfaces for **Students** and **Supervisors**.

---

## 🏗️ System Architecture

The application is built as a modern, full-stack web application using the **Next.js 16 App Router**. It leverages a robust set of technologies to ensure performance, security, and scalability.

### Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 16 (React 19) | Server Components, Suspense, and App Router for routing. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with `lucide-react` for icons and `shadcn/ui` patterns. |
| **Backend** | Next.js API Routes | Serverless functions handling business logic and DB interactions. |
| **Database** | PostgreSQL / SQLite | Managed via **Prisma ORM**. SQLite for dev, Postgres for production. |
| **Authentication** | NextAuth.js (v4) | Handles sessions, credentials, and RBAC (Role-Based Access Control). |
| **AI Engine** | Google Gemini / Groq | Orchestrated via Vercel AI SDK (`ai`) and `@google/generative-ai`. |
| **Caching** | Upstash Redis | Caching AI responses and handling API rate limiting. |
| **Real-time** | Socket.io | Used for collaboration features (pending full integration). |
| **File Processing** | `docx`, `pdf-parse` | For exporting reports and parsing uploaded reference materials. |

### Directory Structure

```
src/
├── app/                  # Next.js App Router (Pages & API)
│   ├── (auth)/           # Login, Signup, Verify Email, Password Reset
│   ├── (dashboard)/      # Protected routes for Student & Supervisor
│   └── api/              # Backend endpoints
├── components/           # React Components
│   ├── ui/               # Reusable UI primitives (Buttons, Inputs)
│   └── providers/        # Context providers (Auth, Theme)
├── lib/                  # Core Business Logic
│   ├── ai/               # AI Orchestrator & Providers
│   ├── auth/             # Security logic (Rate limits, Tokens)
│   ├── prisma.ts         # Database client
│   └── guidelines.ts     # Academic "Constitution" for AI prompts
└── hooks/                # Custom React hooks (useAuth, etc.)
```

---

## 🧠 AI Engine & Orchestration

The core differentiator of Project Assistant is its **Academic Tone Engine**, designed to produce content that adheres to strict university guidelines rather than generic AI output.

### AI Orchestrator (`src/lib/ai/ai.orchestrator.ts`)
The system uses a custom **AI Orchestrator** pattern to ensure high availability and reliability:
1.  **Provider Fallback:** Automatically rotates through providers if one fails:
    *   **Primary:** Groq (Llama models for speed)
    *   **Secondary:** Google Gemini (1.5 Flash/Pro for context window)
    *   **Tertiary:** HuggingFace (Backup)
    *   **Fallback:** Mock Data (for offline dev/testing)
2.  **Retry Logic:** Implements exponential backoff for transient errors.
3.  **Circuit Breaking:** Temporarily marks providers as "unhealthy" after permanent errors (e.g., 401, 404).

### Prompt Engineering (`src/lib/guidelines.ts`)
The AI is not just "asking for text." Every request is injected with `RESEARCH_GUIDELINES`, a const containing 170+ lines of specific academic rules:
*   **"5-Chapter" Structure:** Enforces standard Introduction -> Lit Review -> Methodology -> Results -> Conclusion format.
*   **Citation Style:** Mandates APA formatting for in-text citations.
*   **Tone:** Enforces objective, scholarly language (avoiding "I feel", "In my opinion").

### Redis Caching
To reduce costs and latency, generated content is hashed and cached in **Upstash Redis** for 1 hour. Repeated requests for the same prompt context return instant results.

---

## 🔒 Authentication & Security

The application implements "Security Hardening" features to protect user data and prevent abuse.

### Features
*   **Role-Based Access Control (RBAC):** Distinct sessions/permissions for `student` vs `supervisor`.
*   **Rate Limiting:**
    *   Login: 5 attempts per 15 minutes.
    *   Signup: 3 attempts per hour.
    *   Implemented via in-memory tracking (Production-ready for single instance) or Redis.
*   **Account Lockout:** Accounts are temporarily locked for 30 minutes after 5 failed login attempts.
*   **Secure Tokens:**
    *   Email Verification & Password Reset tokens are 32-byte cryptographically random strings.
    *   Tokens are **hashed (SHA256)** before storage in the database to prevent leakage if the DB is compromised.
    *   Single-use policy: Tokens are deleted immediately after successful use.

---

## 🎓 Student Workflow

### 1. Project Creation
Students create projects defining:
*   **Topic/Title**
*   **Level** (BSc, MSc, PhD) - influences AI complexity.
*   **Metadata** (Department, Faculty) - adds context to AI generation.

### 2. Chapter Editor (`src/components/ChapterEditor.tsx`)
A custom **Tiptap**-based rich text editor serving as the main workspace:
*   **AI Copilot:** "Continue Writing" button uses context from the last 3,000 characters to generate the next section seamlessly.
*   **Academic Tools:**
    *   **Plagiarism Scan:** (Mock) Returns similarity scores.
    *   **Version History:** snapshots are saved on every save; users can restore previous versions.
    *   **Formatting:** specialized academic styling (Times New Roman, 12pt, Double Spacing).

### 3. Collaboration
*   **Invite Members:** Students can invite peers for group projects.
*   **Comments:** Supervisors/Peers can leave comments on specific chapters.

---

## 👨‍🏫 Supervisor Workflow

### 1. Dashboard
*   **Overview:** View all supervised students and their project statuses.
*   **Progress Tracking:** See exactly which chapters are Draft, Submitted, or Approved.

### 2. Review & Feedback
*   Supervisors can enter any student project in **Review Mode**.
*   **Inline Comments:** Leave feedback on specific parts of the text.
*   **Resolution:** Track which comments have been addressed by the student.

---

## 📅 Roadmap & Future Features

### In Progress
*   **Interview Bot:** An automated questionnaire system (`Questionnaire` model) to gather primary data from subjects, which the AI will then analyze for Chapter 4 (Results).
*   **Real-time Collaboration:** Full socket.io integration for live cursors and chat in the Chapter Editor.
*   **Advanced Citations:** Automated DOI lookup and formatting (currently manual or AI-suggested).

### Planned
*   **Mobile App (PWA):** Offline-first mobile experience for data collection.
*   **Turnitin Integration:** Real API integration for plagiarism (currently using a mock algorithm).

---

## 🔓 Social Authentication

In addition to email/password, the system supports **Google OAuth**:
*   **Provider:** Google
*   **Logic:** Users can sign up or login via Google. Accounts are automatically linked if the email matches.
*   **Redirects:** Handles complex redirect logic to ensure users land on the correct role-based dashboard (`/student/dashboard` or `/supervisor/dashboard`) after login.

---

## 🗄️ Database Schema (Prisma)

### Key Models

*   **User:** Stores auth data, role, and security counters (`failedLoginAttempts`, `lockUntil`).
*   **Project:** The central entity. Links `Student` (Owner) and `Supervisor`.
*   **Chapter:** Represents one of the 5 chapters. Stores `content` (HTML/Text) and `status`.
    *   Has many `ChapterVersion` for history.
    *   Has many `Comment`.
*   **Citation:** Stores bibliographic data.
*   **VerificationToken / PasswordResetToken:** Security tables for auth flows.

---

## 🔌 API Reference

### Auth
*   `POST /api/auth/signup`: Register new user (Rate limited).
*   `POST /api/auth/verify-email`: Validate token.
*   `POST /api/auth/request-password-reset`: Send reset email.

### AI & Chapters
*   `POST /api/chapters/generate`: Core AI generation endpoint. Accepts `topic`, `chapterNumber`, `previousContext`.
*   `PUT /api/chapters/[id]`: Update content and create a new `ChapterVersion`.
*   `GET /api/chapters/[id]/versions`: Retrieve history.

### Collaboration
*   `POST /api/invite/generate`: Create supervisor invite link.
*   `POST /api/project/invite`: Invite team member.

---

## 🚀 Deployment & Setup

### Prerequisites
*   Node.js 18+
*   PostgreSQL Database (or SQLite for local)
*   Google Gemini API Key
*   Upstash Redis REST URL/Token

### Environment Variables (.env)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="custom-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="AIza..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Build
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```
