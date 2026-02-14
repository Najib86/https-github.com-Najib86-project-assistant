# Project Assistant

**Project Assistant** is an AI-powered platform designed to guide students through the thesis/project writing process and streamline the supervision loop. It bridges the gap between AI capabilities and academic rigor, offering a dual-interface for Students and Supervisors.

## 🌟 Overview

The transition from coursework to independent research is often overwhelming. ProjectAssistant addresses this by:
*   **For Students:** Providing an AI Co-Pilot that acts as an "Academic Mentor," helping structure chapters, refine tone, and track progress.
*   **For Supervisors:** Offering a centralized dashboard to track student progress, review drafts, and provide inline feedback.

### Key Differentiators
*   **Academic Tone Engine:** Unlike generic AI, ProjectAssistant is prompted to strictly follow academic standards and "5-Chapter" structures.
*   **Role-Based Workflows:** Distinct experiences for students (creation) and supervisors (review).
*   **Real-time Feedback:** Integrated commenting and review systems.

---

## 🏗️ Architecture & Tech Stack

The application is built as a modern full-stack web app:

*   **Frontend:** [Next.js 16](https://nextjs.org/) (React 19) - App Router.
*   **Styling:** Tailwind CSS v4, Lucide React icons.
*   **Backend:** Next.js API Routes.
*   **Database:**
    *   **Primary:** PostgreSQL (Production) / SQLite (Dev) via [Prisma ORM](https://www.prisma.io/).
    *   **Caching/Rate Limiting:** Upstash Redis.
*   **AI Engine:** Google Gemini API (`gemini-1.5-flash` / `gemini-pro`).
*   **Authentication:** NextAuth.js (v4) with Role-Based Access Control (RBAC).
*   **Real-time:** Socket.io (server & client).
*   **File Handling:** `docx`, `pdf-parse`, `mammoth` for document processing.

### Directory Structure
```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication routes (login, signup)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── student/      # Student-specific pages
│   │   └── supervisor/   # Supervisor-specific pages
│   └── api/              # API Endpoints
├── components/           # Reusable React components
│   ├── ui/               # UI primitives (buttons, inputs)
│   └── providers/        # Context providers (Auth, Theme)
├── lib/                  # Utilities and configurations
│   ├── prisma.ts         # Database client
│   ├── redis.ts          # Redis client
│   ├── ai-service.ts     # Gemini AI integration
│   └── auth.ts           # Auth helpers
└── hooks/                # Custom React hooks
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   npm or pnpm
*   A Google Cloud Project with Gemini API enabled.
*   Upstash Redis database (for caching/ratelimiting).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/project-assistant.git
    cd project-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:

    ```env
    # App
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    NODE_ENV="development"

    # Database (Prisma)
    # Use generic SQLite for local dev if not using Postgres yet
    DATABASE_URL="file:./dev.db"
    
    # Authentication (NextAuth)
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-base64"
    
    # AI (Google Gemini)
    GEMINI_API_KEY="your-gemini-api-key"

    # Redis (Upstash)
    UPSTASH_REDIS_REST_URL="your-upstash-url"
    UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

    # Optional: Google OAuth
    GOOGLE_CLIENT_ID=""
    GOOGLE_CLIENT_SECRET=""
    ```

4.  **Database Migration:**
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

---

## 💎 Features & Status

*Current Status as of Feb 2026*

### ✅ Core Features (Implemented)
*   **Authentication:** Secure Login/Signup with robust Role-Based Access Control (Student/Supervisor).
*   **Student Dashboard:**
    *   Project creation w/ metadata (Title, Department, Level).
    *   **Chapter Writer:** Full-screen rich text editor with AI copilot.
    *   **AI Tools:** "Rewrite for Clarity", "Make Formal", Plagiarism check mock-up.
    *   **Export:** Generate formatted DOCX files.
*   **Supervisor Dashboard:**
    *   Invite code generation for students.
    *   Project overview & status tracking.
    *   Review mode: View chapters and add comments.
*   **AI Integration:**
    *   Real-time content generation via Gemini.
    *   Context-aware suggestions based on project topic.

### ⚠️ In Progress / Partial
*   **Interview Bot:** Questionnaire exists but integration with Chapter Generation is pending.
*   **Real-time Collaboration:** Socket.io setup exists but chat interface is not fully connected.
*   **Citations:** Manual entry working; auto-formatting pending.

### 📅 Roadmap
*   **Phase 1 (Immediate):** Fix Interview Bot data flow, implement real-time Chat.
*   **Phase 2:** Advanced Literature Search (DOI integration), Notification System.
*   **Phase 3:** Mobile App (PWA), Plagiarism API integration (Turnitin).

---

## 🛠️ Development Guide

### Authentication
The project uses **NextAuth.js**.
*   **Middleware:** Protected routes are handled in `middleware.ts`.
*   **Client:** Use `useAuth` hook in `src/hooks/useAuth.ts` to access user session and role.
    ```typescript
    const { user, role, isAuthenticated } = useAuth();
    ```

### Database Management
*   **Schema:** Defined in `prisma/schema.prisma`.
*   **Studio:** Run `npx prisma studio` to view/edit data in the browser.

### AI Service
Located in `src/lib/ai-service.ts`.
*   Uses `@google/generative-ai`.
*   **Prompts:** System prompts are carefully engineered to enforce academic tone.

---

## ❓ Troubleshooting

### Connection Issues
*   **Prisma Error:** If you see connection errors, ensure `DATABASE_URL` is correct and run `npx prisma generate`.
*   **Redis Error:** Check `UPSTASH_REDIS_REST_URL` and `TOKEN`.

### Build Errors
*   **Type Errors:** TypeScript strict mode is on. Ensure all props and state variables are typed.
*   **Linting:** Run `npm run lint` to catch issues before committing.

### Authentication
*   **Login Loop:** Check `NEXTAUTH_URL` matches your running host. Clear cookies if issues persist.
*   **Credentials:** Default dev accounts (if seeded) or create new ones via Sign Up.

---

## 🧪 Testing

*   **Auth Tests:** `npm run test:auth` (checks for plaintext passwords, etc.)
*   **Manual Testing:**
    *   Login as Student -> Create Project -> Write Chapter.
    *   Login as Supervisor -> View Project -> Comment.

---

## 📄 License
This project is proprietary.

---
*Documentation consolidated from internal project files.*
