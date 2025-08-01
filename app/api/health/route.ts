import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, databaseBreaker } from '@/lib/api-error-handler';

export async function GET() {
    try {
        const startTime = Date.now();

        // Check database connectivity
        const dbStatus = await checkDatabaseHealth();

        // Check email service (if configured)
        const emailStatus = await checkEmailServiceHealth();

        // Check environment variables
        const envStatus = checkEnvironmentVariables();

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const overall = dbStatus.healthy && emailStatus.healthy && envStatus.healthy;

        const health = {
            status: overall ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            services: {
                database: dbStatus,
                email: emailStatus,
                environment: envStatus,
            },
            version: process.env.npm_package_version || '1.0.0',
        };

        return NextResponse.json(health, {
            status: overall ? 200 : 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Health check error:', error);
        return handleApiError(error);
    }
}

async function checkDatabaseHealth() {
    try {
        await databaseBreaker.execute(async () => {
            // Simple query to check database connectivity
            await prisma.$queryRaw`SELECT 1`;
            return true;
        });

        return {
            healthy: true,
            message: 'Database is accessible',
            responseTime: Date.now(),
        };
    } catch (error: unknown) {
        console.error('Database health check failed:', error);

        let message = 'Database is not accessible';
        if (error instanceof Error) {
            if (error.message.includes('does not exist')) {
                message = 'Database tables not found - run migrations';
            } else if (error.message.includes('timeout')) {
                message = 'Database connection timeout';
            } else if (error.message.includes('connection')) {
                message = 'Cannot connect to database server';
            }
        }

        return {
            healthy: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined,
        };
    }
}

async function checkEmailServiceHealth() {
    try {
        // Check if email configuration is present
        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
            return {
                healthy: false,
                message: 'Email service not configured',
            };
        }

        // In production, you might want to make a test API call to Resend
        // For now, just check if the configuration exists
        return {
            healthy: true,
            message: 'Email service configured',
        };
    } catch (error) {
        console.error('Email service health check failed:', error);
        return {
            healthy: false,
            message: 'Email service check failed',
            error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined,
        };
    }
}

function checkEnvironmentVariables() {
    const requiredVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'DATABASE_URL',
    ];

    const optionalVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
        'RESEND_API_KEY',
        'EMAIL_FROM',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    const configured = optionalVars.filter(varName => process.env[varName]);

    return {
        healthy: missing.length === 0,
        message: missing.length === 0
            ? 'All required environment variables are set'
            : `Missing required variables: ${missing.join(', ')}`,
        details: {
            required: {
                total: requiredVars.length,
                configured: requiredVars.length - missing.length,
                missing: missing,
            },
            optional: {
                total: optionalVars.length,
                configured: configured.length,
                available: configured,
            },
        },
    };
}
