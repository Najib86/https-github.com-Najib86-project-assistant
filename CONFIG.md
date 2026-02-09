# Project Configuration Guide

## Environment Variables

Create a `.env` file in the root of your project. You can copy the structure below:

```env
# Database Connection (SQLite for Development)
DATABASE_URL="file:./dev.db"

# Google Gemini AI API Key
# Get your key here: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"

# (Optional) NextAuth Secret if using NextAuth in future
# NEXTAUTH_SECRET="your_secret_key"
```

## Database Configuration (Prisma)

The project uses Prisma ORM with SQLite by default for ease of local development.
- **Schema File**: `prisma/schema.prisma`
- **Migration Command**: `npx prisma migrate dev`
- **Studio Interface**: Run `npx prisma studio` to view and edit data visually.

## AI Configuration

The AI logic is handled in `src/app/api/generate-chapter/route.ts` (and similar routes).
- **Model**: Default is `gemini-1.5-flash` or `gemini-pro`.
- **Temperature**: Adjusted for academic tone (lower temperature for more deterministic/formal output).
- **Max Tokens**: Configured to allow for substantial chapter drafts.

## Deployment Config (Vercel)

1.  **Build Command**: `next build`
2.  **Install Command**: `npm install`
3.  **Environment Variables**: ensuring `GEMINI_API_KEY` is set in Vercel project settings.
    *Note: For Vercel, SQLite will not persist between deploys. You must use a cloud database like Vercel Postgres or Supabase for production.*

### Migrating to Production Database (PostgreSQL)

1.  Update `prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
2.  Update `.env` `DATABASE_URL` to your Postgres connection string.
3.  Run `npx prisma migrate deploy`.
