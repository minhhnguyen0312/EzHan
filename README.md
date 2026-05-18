# EzHan

EzHan is a Next.js app for daily Chinese practice. Users pick an HSK level, get a daily writing prompt and vocabulary set, submit writing for AI feedback, and track streaks over time.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- Uploadthing
- Local LLM / Gemini fallback for AI generation

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required for local boot:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`

Notes:

- `DATABASE_URL` must point to an existing PostgreSQL database.
- `SESSION_SECRET` is the session signing secret used by `src/lib/session.ts`.
- `ENCRYPTION_KEY` must be a 64-character hex string for AES-256-GCM encryption.

### 3. Create the database

Create the Postgres database referenced by `DATABASE_URL`.

Example:

```sql
CREATE DATABASE ezhan;
```

### 4. Apply the schema

Push the Prisma schema to your database:

```bash
npx prisma db push
```

If you prefer migrations:

```bash
npx prisma migrate deploy
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### Sign up or login returns a database configuration error

If auth returns an error like:

```text
Database is not configured correctly. Check DATABASE_URL and run database setup.
```

verify that:

- `DATABASE_URL` points to a real database
- PostgreSQL is running
- you have already run `npx prisma db push`

### `SESSION_SECRET is not set`

Set `SESSION_SECRET` in `.env` and restart the dev server.

### `ENCRYPTION_KEY` problems

Use a 64-character hex string. Example generation command:

```bash
openssl rand -hex 32
```

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx prisma generate
npx prisma studio
```
