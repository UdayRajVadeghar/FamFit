import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Execute a Prisma operation with automatic retry logic
 * Useful for handling transient database connection errors
 */
export async function executeWithRetry<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  prismaClient: PrismaClient,
  maxRetries = 3,
  delayMs = 100
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation(prismaClient);
    } catch (error) {
      lastError = error;

      // Check if it's a connection error
      const isConnectionError =
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError;

      // Don't retry on validation errors or unique constraint violations
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2002" || error.code === "P2025")
      ) {
        throw error;
      }

      if (!isConnectionError) {
        throw error;
      }

      // Don't sleep on the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(
          `Database operation failed (attempt ${
            attempt + 1
          }/${maxRetries}), retrying in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error(
    `Database operation failed after ${maxRetries} attempts:`,
    lastError
  );
  throw lastError;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseConnection(
  prismaClient: PrismaClient
): Promise<boolean> {
  try {
    await prismaClient.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection health check failed:", error);
    return false;
  }
}
