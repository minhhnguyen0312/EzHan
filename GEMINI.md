# EzHan - AI Chinese Learning Platform

EzHan is a modern web application designed to help users learn Chinese (Mandarin) by providing personalized daily content based on HSK levels. It leverages multiple AI models to generate vocabulary sets, writing topics, and provide detailed feedback on user submissions.

## Project Overview

*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript
*   **Database:** Prisma with PostgreSQL
*   **Authentication:** NextAuth.js v5 (Auth.js)
*   **Styling:** Tailwind CSS v4
*   **State Management:** TanStack Query (React Query) v5
*   **AI Integration:**
    *   **Anthropic (Claude):** Primary model for vocabulary generation, topic generation, and writing review.
    *   **Google (Gemini):** Configured as a secondary/alternative model (`gemini-2.5-flash-lite`).
    *   **Llama/Gemma:** Local or remote inference support via OpenAI-compatible API.
*   **File Handling:** Uploadthing for handling image-based writing submissions (OCR/Feedback).

## Architecture

*   `src/app`: Contains all pages and API routes.
    *   `(dashboard)`: Authenticated user dashboard, vocabulary, progress, and writing sections.
    *   `api`: Backend endpoints for auth, cron jobs, and feature-specific services.
*   `src/components`: React components organized by domain.
    *   `layout`: Sidebar, topbar, and navigation.
    *   `vocabulary`: Flashcards and vocabulary sets.
    *   `writing`: Writing forms, topic cards, and feedback panels.
    *   `ui`: Reusable primitive components.
*   `src/services`: Core business logic and AI orchestration.
    *   `claude/`: Specific implementations for Anthropic-powered features.
*   `src/lib`: Shared utilities, database client, and AI configurations.
*   `prisma/schema.prisma`: Defines the data model for users, daily content, and activity tracking.

## Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   PostgreSQL database
*   API keys for Anthropic, Google Gemini, and Uploadthing.

### Setup and Running

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file with the following keys:
    *   `DATABASE_URL`
    *   `AUTH_SECRET`
    *   `ANTHROPIC_API_KEY`
    *   `GEMINI_API_KEY`
    *   `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`
    *   `LLAMA_SERVER_URL` (optional, defaults to localhost:8080)

3.  **Database Migration:**
    ```bash
    npx prisma db push
    ```

4.  **Run development server:**
    ```bash
    npm run dev
    ```

### Key Commands

*   `npm run dev`: Start the development server.
*   `npm run build`: Build the application for production.
*   `npm run start`: Start the production server.
*   `npm run lint`: Run ESLint to check for code quality issues.
*   `npx prisma generate`: Regenerate the Prisma client.
*   `npx prisma studio`: Open a web UI to view and edit database records.

## Development Conventions

*   **API Routes:** Use Next.js 15+ route handlers in `src/app/api`.
*   **Server Components:** Prefer Server Components for data fetching to minimize client-side bundle size.
*   **Types:** All models and shared types should be defined in `src/types` or inferred from Prisma.
*   **AI Services:** Abstract AI-specific logic into `src/services` to allow for model switching or fallback mechanisms.
*   **Linting:** Adhere to the provided ESLint and TypeScript configurations.
