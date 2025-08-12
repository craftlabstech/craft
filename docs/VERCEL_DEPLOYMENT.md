# Vercel Production Deployment Guide

This guide walks you through deploying your Next.js app to Vercel with Redis rate limiting.

## Prerequisites

- Vercel account
- Upstash account (for Redis)
- Your code pushed to GitHub/GitLab/Bitbucket

## Step 1: Set Up Upstash Redis

### 1.1 Create Upstash Account

1. Go to [upstash.com](https://upstash.com/)
2. Sign up for a free account
3. Verify your email

### 1.2 Create Redis Database

1. Click "Create Database"
2. Choose a name (e.g., `craftjs-prod`)
3. Select a region close to your users
4. Choose "Global" for multi-region or "Regional" for single region
5. Click "Create"

### 1.3 Get Connection Details

After creating the database, you'll see:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Copy these values - you'll need them for Vercel.

## Step 2: Configure Vercel Environment Variables

### 2.1 In Vercel Dashboard

1. Go to your project in Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

**Redis Configuration:**

```
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Database Configuration:**

```
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url (if using Prisma with connection pooling)
```

**Authentication:**

```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

**Email (if using):**

```
RESEND_API_KEY=your-resend-api-key
```

**AWS S3 (if using for file uploads):**

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

### 2.2 Environment Scopes

Set all variables for:

- ✅ Production
- ✅ Preview
- ✅ Development (optional)

## Step 3: Update Your Code (Already Done!)

The following files have been configured for Vercel deployment:

### ✅ Package Dependencies

```json
{
  "dependencies": {
    "@upstash/redis": "^latest"
  }
}
```

### ✅ Auto-Initialization

- `lib/app-init.ts` - Automatically initializes Redis
- `middleware.ts` - Imports initialization
- `lib/rate-limit-init.ts` - Handles Redis configuration

### ✅ Rate Limiting Ready

Your API routes can now use:

```typescript
import { checkRateLimit, RateLimitError } from "@/lib/api-error-handler";

// In your API route
const isAllowed = await checkRateLimit("user:123", 10, 60000);
if (!isAllowed) {
  throw new RateLimitError("Too many requests");
}
```

## Step 4: Deploy to Vercel

### 4.1 Connect Repository

1. In Vercel dashboard, click "New Project"
2. Import your Git repository
3. Configure build settings (usually auto-detected)

### 4.2 Build Configuration

Vercel should auto-detect your Next.js app. Verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (auto)
- **Install Command:** `npm install`

### 4.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Check deployment logs for any issues

## Step 5: Verify Redis Connection

### 5.1 Check Logs

After deployment, check the function logs in Vercel:

```
✅ Rate limiting configured with Upstash Redis
✅ App services initialized successfully
```

If you see:

```
⚠️ No Redis configuration found, using in-memory rate limiting
```

Double-check your environment variables.

### 5.2 Test Rate Limiting

Create a test API call:

```bash
# Test rate limiting (should work)
curl -X POST https://your-app.vercel.app/api/example-rate-limit

# Spam requests to trigger rate limit
for i in {1..20}; do curl -X POST https://your-app.vercel.app/api/example-rate-limit; done
```

Look for HTTP 429 responses when rate limited.

## Step 6: Monitor and Scale

### 6.1 Upstash Dashboard

Monitor your Redis usage in the Upstash dashboard:

- Request count
- Data usage
- Response times

### 6.2 Vercel Analytics

Enable Vercel Analytics to monitor:

- API response times
- Error rates
- Function invocations

### 6.3 Scaling Considerations

**Free Tier Limits:**

- Upstash: 10,000 requests/day
- Vercel: 100GB-hrs function execution

**Upgrade Triggers:**

- High traffic applications
- Complex rate limiting needs
- 24/7 availability requirements

## Troubleshooting

### Redis Connection Issues

```bash
# Check environment variables
vercel env ls

# Check function logs
vercel logs --follow
```

### Common Issues

**1. "Cannot find module '@upstash/redis'"**

- Ensure package is in dependencies, not devDependencies
- Redeploy after adding the package

**2. "Redis connection failed"**

- Verify UPSTASH_REDIS_REST_URL and TOKEN
- Check Upstash dashboard for database status

**3. "Rate limiting using in-memory store"**

- Environment variables not set correctly
- Check variable names and scopes

**4. Build failures**

- Check TypeScript errors
- Verify all imports are correct
- Review build logs in Vercel

### Performance Optimization

**1. Redis Connection Pooling**
Already handled by Upstash REST API

**2. Edge Function Deployment**
Consider using Vercel Edge Functions for rate limiting:

```typescript
// vercel.json (optional)
{
  "functions": {
    "app/api/*/route.ts": {
      "runtime": "edge"
    }
  }
}
```

**3. Caching Strategies**
Implement appropriate caching headers:

```typescript
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "public, max-age=60",
    ...rateLimitHeaders,
  },
});
```

## Production Checklist

- ✅ Upstash Redis database created
- ✅ Environment variables configured
- ✅ `@upstash/redis` package installed
- ✅ Code deployed to Vercel
- ✅ Redis connection verified in logs
- ✅ Rate limiting tested
- ✅ Monitoring set up
- ✅ Error handling tested

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Update NEXTAUTH_SECRET periodically
   - Rotate Upstash tokens

2. **Environment Isolation**
   - Use different Redis databases for production/preview
   - Separate API keys for each environment

3. **Rate Limiting Strategy**
   - Implement progressive rate limits
   - Use different limits for authenticated vs anonymous users
   - Monitor for abuse patterns

4. **Error Handling**
   - Never expose Redis connection details in errors
   - Implement graceful degradation
   - Log security events

Your application is now production-ready with Redis-backed rate limiting on Vercel! 🚀
