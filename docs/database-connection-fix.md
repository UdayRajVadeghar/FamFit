# Database Connection Fix for Intermittent 500 Errors

## Problem

The application was experiencing intermittent 500 errors with the following symptoms:

- Random failures on `/api/family/user-families` (GET)
- Random failures on `/api/user/sync` (POST)
- Error message: `Invalid prisma.users.findUnique() invocation` with connection to Supabase pooler
- Works sometimes, fails other times (classic connection pool exhaustion)

## Root Cause

The issue was caused by **connection pool exhaustion** in serverless environments:

1. Prisma connections weren't properly configured for Supabase's connection pooler
2. No retry logic for transient connection failures
3. Connections not properly cleaned up in serverless edge functions

## Solution Applied

### 1. Enhanced Prisma Client Configuration (`src/lib/prisma.ts`)

- Added explicit datasource configuration
- Added better logging (query, error, warn in development)
- Added graceful shutdown handler to disconnect connections on process exit

### 2. Created Database Utility with Retry Logic (`src/lib/db-utils.ts`)

- `executeWithRetry()` - Automatically retries database operations on connection errors
- Uses exponential backoff (100ms, 200ms, 400ms)
- Retries up to 3 times by default
- Only retries on connection errors, not validation errors
- `checkDatabaseConnection()` - Health check utility

### 3. Updated API Routes

Updated the following routes to use retry logic:

- `/api/user/sync` - User synchronization endpoint
- `/api/family/user-families` - Family listing endpoint

## Important: Supabase Connection String Setup

For **Supabase with Prisma in production**, make sure your `DATABASE_URL` is configured correctly:

### Connection Pooling Modes

Supabase offers two connection pooling modes:

1. **Transaction Mode (Port 6543)** - Recommended for Prisma

   ```
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

   - Use when you need connection pooling
   - Add `?pgbouncer=true` parameter
   - Best for serverless environments

2. **Session Mode (Port 5432)** - Direct connection
   ```
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
   ```
   - Use for migrations and when you need full PostgreSQL features
   - No connection pooling

### Recommended Setup

For **Next.js with Vercel/Serverless**:

1. Use Transaction Mode (port 6543) with `?pgbouncer=true`
2. Set connection pool size appropriately (default is usually fine)
3. Use the retry logic implemented in this fix

### Environment Variables

```env
# Production - Use Transaction Mode for connection pooling
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For migrations - Use Session Mode or direct connection
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

## Testing the Fix

1. **Local Development**: The retry logic will log attempts:

   ```
   Database operation failed (attempt 1/3), retrying in 100ms...
   Database operation failed (attempt 2/3), retrying in 200ms...
   ```

2. **Monitor for improvements**:

   - Watch for reduced 500 errors
   - Check logs for retry patterns
   - Ensure connection errors are auto-recovered

3. **Health Check**: You can use the `checkDatabaseConnection()` utility:

   ```typescript
   import { checkDatabaseConnection } from "@/lib/db-utils";
   import { prisma } from "@/lib/prisma";

   const isHealthy = await checkDatabaseConnection(prisma);
   ```

## Additional Recommendations

1. **Monitor connection metrics** in Supabase dashboard
2. **Set up alerts** for database connection failures
3. **Consider Prisma Accelerate** for additional connection pooling and caching
4. **Review serverless timeout settings** - ensure they're adequate for retries

## Files Modified

- `src/lib/prisma.ts` - Enhanced Prisma client configuration
- `src/lib/db-utils.ts` - New utility with retry logic (NEW FILE)
- `src/app/api/user/sync/route.ts` - Added retry logic to all DB operations
- `src/app/api/family/user-families/route.ts` - Added retry logic to DB operations

## Future Improvements

- [ ] Add database connection metrics/monitoring
- [ ] Consider implementing circuit breaker pattern
- [ ] Add health check endpoint for database status
- [ ] Review and optimize all other API routes with the same retry pattern
