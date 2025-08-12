/**
 * Example API route demonstrating rate limiting usage
 * 
 * This shows how to implement rate limiting in your API routes
 * using the improved rate limiting system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RateLimitError, handleApiError } from '@/lib/api-error-handler';
import { getRateLimitHeaders } from '@/lib/rate-limit-init';

export async function POST(request: NextRequest) {
    try {
        // Get client identifier (IP address or user ID)
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown';

        // Different rate limits for different scenarios
        const identifier = `example:${ip}`;

        // Check rate limit: 10 requests per minute
        const isAllowed = await checkRateLimit(identifier, 10, 60000);

        if (!isAllowed) {
            throw new RateLimitError('Too many requests. Please try again later.');
        }

        // Get rate limit headers for the response
        const rateLimitHeaders = await getRateLimitHeaders(identifier, 10, 60000);

        // Your API logic here
        const response = {
            success: true,
            message: 'Request processed successfully',
            timestamp: new Date().toISOString(),
        };

        // Return response with rate limit headers
        return NextResponse.json(response, {
            headers: rateLimitHeaders,
        });

    } catch (error) {
        // The error handler will automatically include rate limit information
        // in the error response if it's a RateLimitError
        return handleApiError(error);
    }
}

// Example: Different rate limits for authenticated users
export async function GET(request: NextRequest) {
    try {
        // Example of user-specific rate limiting
        // In a real app, you'd get the user ID from the session/JWT
        const userId = request.headers.get('x-user-id') || 'anonymous';

        let identifier: string;
        let limit: number;
        let windowMs: number;

        if (userId === 'anonymous') {
            // Stricter limits for anonymous users
            const forwarded = request.headers.get('x-forwarded-for');
            const realIp = request.headers.get('x-real-ip');
            const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown';
            identifier = `anon:${ip}`;
            limit = 5; // 5 requests per minute
            windowMs = 60000;
        } else {
            // More generous limits for authenticated users
            identifier = `user:${userId}`;
            limit = 60; // 60 requests per minute
            windowMs = 60000;
        }

        const isAllowed = await checkRateLimit(identifier, limit, windowMs);

        if (!isAllowed) {
            throw new RateLimitError(
                userId === 'anonymous'
                    ? 'Rate limit exceeded. Please sign in for higher limits.'
                    : 'Rate limit exceeded. Please try again later.'
            );
        }

        const rateLimitHeaders = await getRateLimitHeaders(identifier, limit, windowMs);

        const response = {
            success: true,
            data: {
                userId,
                userType: userId === 'anonymous' ? 'anonymous' : 'authenticated',
                rateLimit: {
                    limit,
                    windowMs,
                },
            },
        };

        return NextResponse.json(response, {
            headers: rateLimitHeaders,
        });

    } catch (error) {
        return handleApiError(error);
    }
}
