import { NextResponse } from 'next/server';
import { ZodError, ZodIssue } from 'zod';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';

export interface ApiError {
    code: string;
    message: string;
    details?: string;
    statusCode: number;
}

export class AuthApiError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: string;

    constructor(code: string, message: string, statusCode: number = 500, details?: string) {
        super(message);
        this.name = 'AuthApiError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class DatabaseError extends AuthApiError {
    constructor(message: string = 'Database error occurred', details?: string) {
        super('DATABASE_ERROR', message, 500, details);
    }
}

export class ValidationError extends AuthApiError {
    constructor(message: string = 'Validation failed', details?: string) {
        super('VALIDATION_ERROR', message, 400, details);
    }
}

export class AuthenticationError extends AuthApiError {
    constructor(message: string = 'Authentication failed', details?: string) {
        super('AUTHENTICATION_ERROR', message, 401, details);
    }
}

export class AuthorizationError extends AuthApiError {
    constructor(message: string = 'Not authorized', details?: string) {
        super('AUTHORIZATION_ERROR', message, 403, details);
    }
}

export class RateLimitError extends AuthApiError {
    constructor(message: string = 'Too many requests', details?: string) {
        super('RATE_LIMIT_ERROR', message, 429, details);
    }
}

export class ExternalServiceError extends AuthApiError {
    constructor(message: string = 'External service error', details?: string) {
        super('EXTERNAL_SERVICE_ERROR', message, 502, details);
    }
}

export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    // Handle our custom AuthApiError
    if (error instanceof AuthApiError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            },
            { status: error.statusCode }
        );
    }

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
        return handlePrismaError(error);
    }

    if (error instanceof PrismaClientUnknownRequestError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'An unknown database error occurred',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
            },
            { status: 500 }
        );
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: error.issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', '),
                },
            },
            { status: 400 }
        );
    }

    // Handle NextAuth.js errors
    if (error instanceof Error && error.name?.includes('Auth')) {
        return handleNextAuthError(error);
    }

    // Handle network/fetch errors
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Network error occurred',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
            },
            { status: 503 }
        );
    }

    // Handle generic errors
    if (error instanceof Error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
            },
            { status: 500 }
        );
    }

    // Fallback for unknown error types
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: 'An unknown error occurred',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
        },
        { status: 500 }
    );
}

function handlePrismaError(error: PrismaClientKnownRequestError): NextResponse {
    switch (error.code) {
        case 'P1001':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DATABASE_CONNECTION_ERROR',
                        message: 'Unable to connect to the database',
                        details: 'Database server is not reachable. Please try again later.',
                    },
                },
                { status: 503 }
            );

        case 'P1002':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DATABASE_TIMEOUT_ERROR',
                        message: 'Database connection timeout',
                        details: 'Database operation took too long. Please try again.',
                    },
                },
                { status: 503 }
            );

        case 'P2002':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DUPLICATE_ENTRY_ERROR',
                        message: 'A record with this information already exists',
                        details: 'This email address is already registered.',
                    },
                },
                { status: 409 }
            );

        case 'P2025':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'RECORD_NOT_FOUND',
                        message: 'Record not found',
                        details: 'The requested user or record does not exist.',
                    },
                },
                { status: 404 }
            );

        case 'P2021':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DATABASE_SCHEMA_ERROR',
                        message: 'Database schema error',
                        details: 'The database tables have not been set up. Please contact support.',
                    },
                },
                { status: 503 }
            );

        case 'P2003':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
                        message: 'Invalid reference',
                        details: 'Referenced record does not exist.',
                    },
                },
                { status: 400 }
            );

        case 'P2014':
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'RELATION_VIOLATION_ERROR',
                        message: 'Relation constraint violation',
                        details: 'This operation would violate data integrity.',
                    },
                },
                { status: 400 }
            );

        default:
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: 'Database error occurred',
                        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                    },
                },
                { status: 500 }
            );
    }
}

function handleNextAuthError(error: Error): NextResponse {
    const errorName = error.name.toLowerCase();
    const errorMessage = error.message.toLowerCase();

    if (errorName.includes('configuration')) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'AUTH_CONFIGURATION_ERROR',
                    message: 'Authentication configuration error',
                    details: 'Server authentication is misconfigured. Please contact support.',
                },
            },
            { status: 500 }
        );
    }

    if (errorName.includes('oauth') || errorMessage.includes('oauth')) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'OAUTH_ERROR',
                    message: 'OAuth authentication failed',
                    details: 'There was an issue with the OAuth provider. Please try again or use a different sign-in method.',
                },
            },
            { status: 502 }
        );
    }

    if (errorName.includes('email') || errorMessage.includes('email')) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'EMAIL_SERVICE_ERROR',
                    message: 'Email service error',
                    details: 'Failed to send verification email. Please check your email address and try again.',
                },
            },
            { status: 502 }
        );
    }

    if (errorName.includes('session') || errorMessage.includes('session')) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SESSION_ERROR',
                    message: 'Session error',
                    details: 'There was an issue with your session. Please sign in again.',
                },
            },
            { status: 401 }
        );
    }

    if (errorName.includes('callback') || errorMessage.includes('callback')) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'AUTH_CALLBACK_ERROR',
                    message: 'Authentication callback error',
                    details: 'There was an issue processing the authentication response. Please try again.',
                },
            },
            { status: 502 }
        );
    }

    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication error',
                details: process.env.NODE_ENV === 'development' ? error.message : 'An authentication error occurred.',
            },
        },
        { status: 500 }
    );
}

// Rate limiting utilities
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(
    identifier: string,
    limit: number = 5,
    windowMs: number = 60000 // 1 minute
): boolean {
    const now = Date.now();
    const current = rateLimitMap.get(identifier) || { count: 0, lastReset: now };

    // Reset if window has passed
    if (now - current.lastReset > windowMs) {
        current.count = 0;
        current.lastReset = now;
    }

    current.count++;
    rateLimitMap.set(identifier, current);

    return current.count <= limit;
}

export function getRateLimitStatus(identifier: string): { remaining: number; resetTime: number } {
    const current = rateLimitMap.get(identifier);
    if (!current) {
        return { remaining: 5, resetTime: Date.now() + 60000 };
    }

    return {
        remaining: Math.max(0, 5 - current.count),
        resetTime: current.lastReset + 60000,
    };
}

// Validation utilities
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
}

export function validateRequired<T>(value: T, fieldName: string): T {
    if (value === null || value === undefined || value === '') {
        throw new ValidationError(`${fieldName} is required`);
    }
    return value;
}

export function validateString(value: unknown, fieldName: string, minLength = 0, maxLength = 255): string {
    if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be a string`);
    }

    if (value.length < minLength) {
        throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
    }

    if (value.length > maxLength) {
        throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters`);
    }

    return value;
}

// Circuit breaker for external services
class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    constructor(
        private threshold = 5,
        private timeout = 60000 // 1 minute
    ) { }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new ExternalServiceError('Service temporarily unavailable');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
        }
    }
}

export const emailServiceBreaker = new CircuitBreaker(3, 30000);
export const databaseBreaker = new CircuitBreaker(5, 60000);
