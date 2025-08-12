# Rate Limiting Setup Guide

This guide explains how to configure production-ready rate limiting for your application.

## Overview

The application includes a flexible rate limiting system that supports both development and production environments:

- **Development**: Uses an in-memory store with automatic cleanup
- **Production**: Supports Redis for persistence across server restarts and multi-instance deployments

## Development Setup (Default)

By default, the application uses an in-memory store suitable for development:

```typescript
// No configuration needed - uses memory store by default
import { checkRateLimit } from "@/lib/api-error-handler";

const isAllowed = await checkRateLimit("user:123", 5, 60000); // 5 requests per minute
```

## Production Setup with Redis

### 1. Install Redis Client

Choose one of these Redis clients:

#### Option A: ioredis (Recommended for traditional Redis)

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

#### Option B: Upstash Redis (Recommended for serverless/Vercel)

```bash
npm install @upstash/redis
```

#### Option C: Standard redis client

```bash
npm install redis
npm install --save-dev @types/redis
```

### 2. Environment Variables

Add to your `.env.local` or production environment:

```env
# Redis connection URL
REDIS_URL=redis://localhost:6379

# Or for Redis with authentication
REDIS_URL=redis://username:password@hostname:port

# For Upstash Redis (serverless-friendly)
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 3. Configure Rate Limiting

#### Option A: Using ioredis

Create `lib/redis.ts`:

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
```

Then configure in your app (e.g., in `middleware.ts` or app startup):

```typescript
import redis from "@/lib/redis";
import { configureRateLimitStore } from "@/lib/api-error-handler";

// Configure rate limiting with Redis
configureRateLimitStore(redis);
```

#### Option B: Using Upstash Redis (Serverless)

```typescript
import { Redis } from "@upstash/redis";
import { configureRateLimitStore } from "@/lib/api-error-handler";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

configureRateLimitStore(redis);
```

### 4. Update API Routes

Your existing API routes will automatically use the configured store:

```typescript
import { checkRateLimit, RateLimitError } from "@/lib/api-error-handler";

export async function POST(request: Request) {
  const clientIP = request.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit (5 requests per minute)
  const isAllowed = await checkRateLimit(`ip:${clientIP}`, 5, 60000);

  if (!isAllowed) {
    throw new RateLimitError("Too many requests. Please try again later.");
  }

  // Continue with your API logic...
}
```

## Advanced Usage

### Custom Rate Limits for Different Endpoints

```typescript
// Different limits for different actions
const loginLimit = await checkRateLimit(`login:${email}`, 3, 300000); // 3 per 5 minutes
const apiLimit = await checkRateLimit(`api:${userId}`, 100, 3600000); // 100 per hour
const resetLimit = await checkRateLimit(`reset:${email}`, 1, 3600000); // 1 per hour
```

### Rate Limit Status

```typescript
import { getRateLimitStatus } from "@/lib/api-error-handler";

const status = await getRateLimitStatus("user:123", 5, 60000);
console.log(
  `Remaining: ${status.remaining}, Reset at: ${new Date(status.resetTime)}`
);
```

### Reset Rate Limits

```typescript
import { resetRateLimit } from "@/lib/api-error-handler";

// Clear rate limit after successful verification
await resetRateLimit(`verification:${email}`);
```

## Deployment Considerations

### Vercel with Upstash Redis

1. Sign up for [Upstash](https://upstash.com/)
2. Create a Redis database
3. Add environment variables to Vercel
4. Configure as shown in Option B above

### Docker with Redis

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### AWS/GCP/Azure

Use managed Redis services:

- AWS ElastiCache
- Google Cloud Memorystore
- Azure Cache for Redis

## Monitoring and Debugging

### Enable Logging

The rate limiting system includes error handling and logging:

```typescript
// Logs are automatically generated for Redis errors
// Check your application logs for:
// - "Rate limiting configured with Redis store"
// - "Rate limiting using in-memory store - not recommended for production"
// - Redis connection errors
```

### Health Checks

Add a health check endpoint to verify Redis connectivity:

```typescript
// app/api/health/rate-limit/route.ts
import redis from "@/lib/redis";

export async function GET() {
  try {
    await redis.ping();
    return Response.json({ status: "ok", store: "redis" });
  } catch (error) {
    return Response.json({
      status: "error",
      store: "memory",
      error: error.message,
    });
  }
}
```

## Migration from Memory Store

If you're upgrading from the memory-based rate limiting:

1. Install and configure Redis as shown above
2. The system will automatically start using Redis
3. Existing rate limits in memory will be lost (this is expected)
4. No code changes needed in your API routes

## Performance Considerations

- Redis operations are async and may add ~1-5ms latency
- Use connection pooling for high-traffic applications
- Consider using Redis Cluster for very high scale
- Monitor Redis memory usage and set appropriate eviction policies

## Security Notes

- Always use TLS/SSL for Redis connections in production
- Use strong authentication credentials
- Consider network-level restrictions (VPC, security groups)
- Regularly rotate Redis passwords
- Monitor for unusual rate limiting patterns
