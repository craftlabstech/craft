/**
 * Rate limiting initialization for production environments
 * 
 * This file provides a simple way to configure rate limiting with Redis
 * for production deployments. Import and call the setup function during
 * app initialization.
 */

import { configureRateLimitStore } from './api-error-handler';

/**
 * Initialize rate limiting with Redis if available
 * Falls back to memory store if Redis is not configured
 */
export async function initializeRateLimit(): Promise<void> {
    // Check if Redis is configured
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

    if (!redisUrl) {
        console.log('No Redis configuration found, using in-memory rate limiting');
        return;
    }

    try {
        // Try to load and configure Redis
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            // Use Upstash Redis (serverless-friendly)
            try {
                const { Redis } = await import('@upstash/redis');
                const redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });

                // Test connection
                await redis.ping();
                configureRateLimitStore(redis);
                console.log('Rate limiting configured with Upstash Redis');
                return;
            } catch {
                console.warn('Upstash Redis not available, install @upstash/redis package');
            }

        } else if (process.env.REDIS_URL) {
            // Use standard Redis client
            try {
                const { default: Redis } = await import('ioredis');
                const redis = new Redis(process.env.REDIS_URL);

                // Test connection
                await redis.ping();
                configureRateLimitStore(redis);
                console.log('Rate limiting configured with Redis');

                // Handle connection errors gracefully
                redis.on('error', (err: Error) => {
                    console.error('Redis connection error, falling back to memory store:', err);
                    configureRateLimitStore(); // Fall back to memory store
                });
                return;
            } catch {
                console.warn('ioredis not available, install ioredis package');
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Failed to initialize Redis rate limiting, using memory store:', errorMessage);
    }

    // Fall back to memory store if Redis setup fails
    console.log('Using in-memory rate limiting (not recommended for production)');
}

/**
 * Helper function to get rate limit headers for API responses
 * Use this to add standard rate limiting headers to your API responses
 */
export async function getRateLimitHeaders(
    identifier: string,
    limit: number = 5,
    windowMs: number = 60000
): Promise<Record<string, string>> {
    try {
        const { getRateLimitStatus } = await import('./api-error-handler');
        const status = await getRateLimitStatus(identifier, limit, windowMs);

        return {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': status.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(status.resetTime / 1000).toString(),
        };
    } catch (error) {
        console.error('Error getting rate limit headers:', error);
        return {};
    }
}
