# Quick Vercel + Redis Deployment Guide

Your app is now ready for production deployment with Redis rate limiting! 🚀

## ✅ What's Done

1. **@upstash/redis** package installed
2. **Production-ready rate limiting** with automatic Redis initialization
3. **Build successful** - ready for deployment
4. **Environment variables** configured in `.env.example`

## 🚀 Deploy to Vercel

### Step 1: Set up Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create account & verify email
3. Click "Create Database"
4. Name it (e.g., `craftjs-prod`)
5. Choose region (closest to your users)
6. Copy the connection details:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 2: Deploy to Vercel

1. Push your code to GitHub/GitLab
2. Go to [vercel.com](https://vercel.com) and import your repo
3. **Add Environment Variables** in Vercel dashboard:

```env
# Required for Redis
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Your existing variables
DATABASE_URL=your-database-url
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
RESEND_API_KEY=your-resend-key
# ... other vars from your .env
```

4. Click **Deploy**

### Step 3: Verify Deployment

Once deployed, check the function logs in Vercel. You should see:

```
✅ Rate limiting configured with Upstash Redis
```

If you see:

```
ℹ️ Using in-memory rate limiting (Redis not configured)
```

Double-check your environment variables.

## 🧪 Test Rate Limiting

You can test the rate limiting in any of your API routes:

```typescript
import { checkRateLimit, RateLimitError } from '@/lib/api-error-handler';

export async function POST(request: Request) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Check rate limit (5 requests per minute)
  const allowed = await checkRateLimit(\`api:\${ip}\`, 5, 60000);

  if (!allowed) {
    throw new RateLimitError('Too many requests. Please try again later.');
  }

  // Your API logic here...
}
```

## 📊 What You Get

- ✅ **Production-ready rate limiting** with Redis
- ✅ **Automatic failover** to memory if Redis is down
- ✅ **Persistent rate limits** across server restarts
- ✅ **Multi-instance support** for scalability
- ✅ **Clean error handling** with proper HTTP status codes
- ✅ **Vercel-optimized** with Upstash Redis

## 🛠️ Next Steps

1. **Add rate limiting to your API routes** where needed
2. **Monitor usage** in Upstash dashboard
3. **Scale up** Redis plan if needed (free tier: 10k requests/day)
4. **Add monitoring** with Vercel Analytics

## 🔧 Test Redis Locally

If you want to test Redis locally before deployment:

1. Add Redis environment variables to `.env.local`
2. Run: `npm run test:redis`

Your app is production-ready! 🎉
