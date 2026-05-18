import { Prisma } from "@prisma/client"

export class AppConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AppConfigError"
  }
}

function isBlank(value: string | undefined): value is undefined {
  return value === undefined || value.trim().length === 0
}

export function assertAuthRuntimeConfig(): void {
  if (isBlank(process.env.DATABASE_URL)) {
    throw new AppConfigError(
      "Database is not configured. Set DATABASE_URL and run database setup."
    )
  }

  if (isBlank(process.env.SESSION_SECRET)) {
    throw new AppConfigError(
      "Session auth is not configured. Set SESSION_SECRET in your environment."
    )
  }
}

export function getAuthDatabaseErrorMessage(error: unknown): string | null {
  if (error instanceof AppConfigError) {
    return error.message
  }

  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code === "P1003") {
    return "Database is not configured correctly. Check DATABASE_URL and run database setup."
  }

  if (error.code === "P1001") {
    return "Database server is unreachable. Check DATABASE_URL and make sure Postgres is running."
  }

  return null
}
