# Testing Guide for ProjectAssistant

## Local Development Testing

### 1. Setup
Make sure the server is running:
```bash
npm run dev
```
Visit: http://localhost:3000

### 2. User Flows to Test

#### A. Student Flow
1.  **Login**: Use a test student account.
2.  **Dashboard**: Verify you see the "Create New Project" button or existing projects.
3.  **Chapter Creation**: 
    - Go to a project -> "Write Chapter".
    - Enter prompts (e.g., "Impact of AI on Education").
    - Click "Generate with AI".
    - **Verify**: Content appears in the editor after a few seconds.
4.  **Refinement**: 
    - Select text -> "Make Formal".
    - **Verify**: Text is updated.
5.  **Submit**: Click "Submit for Review". Status should change to "Submitted".

#### B. Supervisor Flow
1.  **Login**: Use a test supervisor account.
2.  **Dashboard**: Look for the "Pending Reviews" list.
3.  **Review**:
    - Open the student's submission.
    - Add a comment to a specific section.
    - Click "Request Changes" or "Approve".
    - **Verify**: Status updates on both Supervisor and Student dashboards.

### 3. API Testing (with Postman/Curl)

**Generate Chapter Endpoint**:
```http
POST /api/generate-chapter
Content-Type: application/json

{
  "prompt": "Write an introduction about...",
  "chapter": "1"
}
```

**Login Endpoint**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@test.com",
  "password": "password"
}
```

## Debugging Common Issues

### "Prisma Client not initialized"
- Run `npx prisma generate` and restart the dev server.

### "Gemini API Error"
- Check server logs.
- Verify `GEMINI_API_KEY` in `.env` is correct and has quota.

### "Database Locked" (SQLite)
- Ensure no other process (like Prisma Studio) is holding a write lock if you are running migrations.
