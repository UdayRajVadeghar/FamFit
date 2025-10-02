# Deployment Checklist - Database Connection Fix

## ✅ Changes Applied

The intermittent 500 errors have been fixed by implementing automatic retry logic for database connections. Here's what was done:

### Files Modified

1. **src/lib/prisma.ts** - Enhanced Prisma client configuration
2. **src/lib/db-utils.ts** - NEW: Retry utility for database operations
3. **src/app/api/user/sync/route.ts** - Added retry logic
4. **src/app/api/family/user-families/route.ts** - Added retry logic
5. **src/app/api/family/create/route.ts** - Added retry logic
6. **src/app/api/family/join/route.ts** - Added retry logic
7. **src/app/api/family/[familyId]/route.ts** - Added retry logic

### Documentation Created

- **docs/database-connection-fix.md** - Technical details about the fix
- **DEPLOYMENT_CHECKLIST.md** - This file

---

## 🚀 Before Deploying to Production

### 1. Check Your DATABASE_URL

Your `DATABASE_URL` environment variable should use Supabase's **Transaction Mode** connection pooling:

```env
# ✅ CORRECT - Transaction Mode (Port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ❌ WRONG - Session Mode without pooling
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

**Key differences:**

- Port **6543** for transaction pooling (recommended)
- Add `?pgbouncer=true` parameter
- This enables connection pooling which prevents exhaustion

### 2. Environment Variables to Set

#### On Vercel/Production:

```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Optional - For Prisma Migrations:

If you run migrations, you may also need:

```bash
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

### 3. Update Prisma Schema (Optional)

If you want to use both pooled and direct connections, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

---

## 🔍 What to Monitor After Deployment

### Expected Behavior

1. **Automatic Retries**: If a database connection fails, the system will automatically retry up to 3 times with exponential backoff
2. **Console Logs**: In development, you'll see retry attempts:
   ```
   Database operation failed (attempt 1/3), retrying in 100ms...
   Database operation failed (attempt 2/3), retrying in 200ms...
   ```
3. **No More Intermittent Errors**: 500 errors should be eliminated or drastically reduced

### Monitor These Metrics

1. **Supabase Dashboard**:

   - Go to Database → Connection Pooling
   - Watch for "Connection pool exhaustion" warnings
   - Monitor active connections

2. **Vercel Logs** (or your hosting platform):

   - Check for retry log messages
   - Monitor 500 error rates
   - Watch response times

3. **User Experience**:
   - Endpoints should work consistently
   - No more "random" failures
   - Slightly higher latency on retried requests (acceptable)

---

## 🧪 Testing the Fix

### Local Testing

1. **Start your development server**:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Test these endpoints**:

   - User sync: `POST /api/user/sync`
   - Get families: `GET /api/family/user-families`
   - Create family: `POST /api/family/create`
   - Join family: `POST /api/family/join`

3. **Simulate connection issues** (optional):
   - Temporarily use an invalid DATABASE_URL
   - You should see retry attempts in console
   - After 3 attempts, it will fail gracefully

### Production Testing

1. **Deploy to staging first** (if available)
2. **Monitor logs** for retry patterns
3. **Load test** critical endpoints
4. **Verify** no more intermittent 500 errors

---

## 📊 Success Criteria

- ✅ No more intermittent 500 errors on `/api/family/user-families`
- ✅ No more intermittent 500 errors on `/api/user/sync`
- ✅ Application loads consistently
- ✅ User sync works on first login
- ✅ Family operations work reliably

---

## 🆘 Troubleshooting

### If you still see errors:

1. **Check DATABASE_URL format**:

   - Must use port 6543 for connection pooling
   - Must include `?pgbouncer=true`
   - Password must be URL-encoded if it contains special characters

2. **Check Supabase dashboard**:

   - Ensure database is running
   - Check connection pool limits
   - Verify no IP blocking

3. **Check environment variables**:

   - Verify `DATABASE_URL` is set in production
   - Restart your deployment after changing env vars

4. **Increase retry attempts** (if needed):
   Edit `src/lib/db-utils.ts`:
   ```typescript
   // Change maxRetries from 3 to 5
   export async function executeWithRetry<T>(
     operation: (prisma: PrismaClient) => Promise<T>,
     prismaClient: PrismaClient,
     maxRetries = 5, // <-- Increase this
     delayMs = 100
   );
   ```

---

## 📝 Next Steps

1. ✅ Verify `DATABASE_URL` is correct
2. ✅ Deploy to production
3. ✅ Monitor for 24-48 hours
4. ✅ Check error logs
5. ✅ Celebrate when errors are gone! 🎉

---

## 🔗 Related Documentation

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Database Connection Fix Details](./docs/database-connection-fix.md)
