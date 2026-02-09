# Database Setup Guide

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install`)

## Development Setup (SQLite)

1.  **Configure Environment**:
    Ensure your `.env` file contains:
    ```env
    DATABASE_URL="file:./dev.db"
    ```

2.  **Generate Client**:
    Run the following to generate the Prisma Client based on your schema:
    ```bash
    npx prisma generate
    ```

3.  **Run Migrations**:
    Apply the schema changes to your local database:
    ```bash
    npx prisma migrate dev --name init
    ```
    *This creates the `dev.db` file and applies the SQL migrations.*

4.  **Seed Data (Optional)**:
    If you have a seed script (usually in `prisma/seed.ts`), run:
    ```bash
    npx prisma db seed
    ```

## Managing the Database

-   **View Data**:
    Use Prisma Studio to inspect and edit your data in the browser:
    ```bash
    npx prisma studio
    ```
    (Opens at http://localhost:5555)

-   **Reset Database**:
    To wipe all data and re-apply migrations:
    ```bash
    npx prisma migrate reset
    ```

## Production Setup (PostgreSQL)

For production (e.g., Vercel, Supabase, Render):

1.  Change `datasource` in `prisma/schema.prisma` to `postgresql`.
2.  Update `DATABASE_URL` in your production environment variables.
3.  Run migrations on the production DB:
    ```bash
    npx prisma migrate deploy
    ```
