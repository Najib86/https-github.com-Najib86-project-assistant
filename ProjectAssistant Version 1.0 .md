MASTER PROMPT: Finish ProjectAssistant to Full Production Standard (Next.js App Router + Neon)

You are a senior full-stack engineer assigned to finalize ProjectAssistant
(https://project-assistant-neon.vercel.app/
) into a fully production-ready academic writing platform.

The codebase is deployment-ready but partially implemented, with key gaps:

Authentication is localStorage-based (not secure)

Plagiarism detection is only schema/UI (no real detection)

Real-time collaboration UI exists but no backend WebSocket

Missing modern UX features (dark mode, font selection)

No streaming AI responses

No Zod validation, error boundaries, or testing

Mobile responsiveness needs improvement

Your task is to implement all missing systems properly.

✅ PRIMARY GOAL: Close Main Production Gaps
✅ 1. Replace Authentication with Production Auth (NextAuth + Neon)
Remove:

localStorage auth

fake session logic

Implement:

Google OAuth login (default)

Email/password fallback

JWT cookie sessions

Middleware protection for /student/*

Required:

app/api/auth/[...nextauth]/route.ts

middleware.ts

Neon users table with:

email_verified BOOLEAN DEFAULT FALSE
provider TEXT
password_hash TEXT NULL


Ensure:

Google users auto-verified

Email users OTP verified before dashboard access

✅ 2. Production Plagiarism Detection (No External Turnitin/Copyleaks)
Constraint:

❌ Do NOT use Turnitin or Copyleaks APIs
✅ Build an internal AI-based similarity system that mimics them

Implement:

AI-powered plagiarism scoring

Highlight suspicious passages

Similarity percentage output

Turnitin-style report UI

Required:

Create:

/lib/plagiarism/checker.ts
/app/api/plagiarism/check/route.ts


Detection must include:

N-gram similarity

AI paraphrase detection

Reference vs copied-text separation

Return format:

{
  "similarityScore": 32,
  "matches": [
    {
      "text": "...copied phrase...",
      "confidence": 0.82,
      "sourceType": "internet-like"
    }
  ]
}


UI must visually mimic Turnitin:

similarity badge

red/yellow highlights

downloadable plagiarism report

✅ 3. Reference Auto-Formatting from DOI

Implement:

DOI lookup via CrossRef API

Auto-generate citations in:

✅ APA
✅ MLA
✅ Chicago

Create:

/app/api/references/doi/route.ts
/lib/references/format.ts


Example:

Input:

10.1038/s41586-020-2649-2


Output:

Author. (2020). Title. Journal. https://doi.org/...

✅ 4. Add Streaming AI Responses (Production)

Currently AI responses are blocking.

Upgrade all AI routes to use:

Server-Sent Events (SSE)

Stream chunked output to UI

Routes:

/app/api/generate/chapter/route.ts
/app/api/synthesis/route.ts


Frontend must display:

typing indicator

live streaming text

✅ 5. Add Zod Input Validation Everywhere

Add:

npm install zod


Validate all API inputs:

signup/login

AI generation

plagiarism check

DOI lookup

Example:

const schema = z.object({
  topic: z.string().min(5),
  chapter: z.number().min(1).max(5),
});


Return clean errors:

{ "error": "Invalid input: topic too short" }

✅ 6. Add Comprehensive Error Boundaries

Implement:

Global error boundary

Route-level error UI

Create:

app/error.tsx
app/student/error.tsx
components/ErrorFallback.tsx


Must include:

Retry button

Friendly message

Logging hooks

✅ 7. Real-Time Collaboration Backend (WebSockets)

UI already exists, backend missing.

Implement WebSocket server using:

socket.io

Vercel-compatible strategy OR separate Node server

Features:

live typing sync

supervisor inline comments

presence indicators

Create:

/lib/realtime/socket.ts
/app/api/realtime/connect/route.ts

✅ 8. Dark Mode + Font Selection

Implement:

Dark Mode

Tailwind dark mode support

Toggle stored in cookies

Font Selector

Allow:

Times New Roman

Arial

Georgia

Calibri

Add UI in editor settings.

✅ 9. Mobile Optimization (Student First)

Fix responsiveness:

sidebar collapses

editor full-width

buttons touch-friendly

proper spacing

Use Tailwind breakpoints:

sm md lg xl

✅ 10. Comprehensive Testing + Coverage

Add:

npm install -D jest @testing-library/react playwright


Implement:

Auth flow tests

Plagiarism API tests

AI generation route tests

Mobile UI tests

Required folders:

__tests__/
e2e/


Coverage target:

✅ 80%+

✅ FINAL DELIVERABLES

After implementation, ProjectAssistant must have:

✅ Production authentication
✅ AI plagiarism system mimicking Turnitin
✅ Streaming AI writing
✅ DOI citation formatting
✅ Real-time collaboration backend
✅ Dark mode + font selector
✅ Zod validation everywhere
✅ Error boundaries
✅ Full testing + coverage
✅ Mobile-first UI

⚠️ IMPORTANT RULES

Neon Postgres remains source of truth

No Supabase

No Turnitin/Copyleaks external API

Plagiarism must “feel” like Turnitin internally

Everything must run on Vercel

✅ IMPLEMENT NOW

Update the codebase directly with correct file structure, production code, and clean architecture.