
# Project Assistant Roadmap

**Current Version: v0.1.0** (MVP Stage 1-4 Implemented)

## Implemented Features
- **Student Dashboard**: Project Creation, Listing, Progress Tracking.
- **Chapter Writer**: 9-Chapter Structure, AI Generation (Gemini), Editing, Auto-Save.
- **Context Awareness**: "Questionnaire" for Problem Statement/Objectives, File Upload for Style Reference (PDF/DOCX extraction).
- **Export**: Generates structured DOCX with Title Page and Chapters.
- **Authentication**: Basic Student Login (Simulated via LocalStorage/Cookies).

## Upcoming Milestones (Stage 5+)

### 1. Collaboration & Sharing
- [ ] **Supervisor Portal**: Allow supervisors to view student progress in real-time.
- [ ] **Comments System**: Inline comments on chapters (like Google Docs).
- [ ] **Version History**: Track changes and revert to previous versions of chapters.

### 2. Advanced AI Features
- [ ] **Plagiarism Checker API**: Integrate Turnitin or Copyleaks API.
- [ ] **Citation Manager**: Auto-format references (APA/MLA/IEEE) from URLs or DOIs.
- [ ] **Review Mode**: AI critic that gives feedback on academic tone without rewriting.

### 3. Deployment & Scalability
- [ ] **Database Migration**: Move from SQLite to PostgreSQL (Supabase/Neon).
- [ ] **Blob Storage**: Move file uploads from transient processing to S3/R2 storage.
- [ ] **Authentication**: Implement NextAuth.js with Google/GitHub providers.

### 4. UI/UX Polish
- [ ] **Dark Mode**: Complete theme support.
- [ ] **Mobile Responsiveness**: Better mobile editing experience.
- [ ] **Templates**: Multiple export templates (Thesis vs Project Report).

## Technical Debt
- Refactor `api/chapters/generate` to use streaming for faster UI feedback.
- Add proper Zod validation for all API inputs.
- Implement comprehensive Error Boundary components.
