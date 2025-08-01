import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import {
    handleApiError,
    checkRateLimit,
    ValidationError,
    AuthenticationError,
    databaseBreaker,
    validateString
} from '@/lib/api-error-handler';

const onboardingSchema = z.object({
    bio: z.string().min(1).max(500).optional(),
    occupation: z.string().min(1).max(100).optional(),
    company: z.string().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        if (!checkRateLimit(`onboarding:${clientIp}`, 5, 60000)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_ERROR',
                        message: 'Too many requests. Please try again later.',
                    },
                },
                { status: 429 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new AuthenticationError('You must be signed in to complete onboarding');
        }

        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch {
            throw new ValidationError('Invalid JSON in request body');
        }

        // Validate with Zod
        const validatedData = onboardingSchema.parse(body);

        // Additional custom validation
        if (validatedData.bio) {
            validateString(validatedData.bio, 'bio', 1, 500);
        }
        if (validatedData.occupation) {
            validateString(validatedData.occupation, 'occupation', 1, 100);
        }
        if (validatedData.company) {
            validateString(validatedData.company, 'company', 1, 100);
        }

        // Update user profile with error handling
        const updatedUser = await databaseBreaker.execute(async () => {
            return await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    bio: validatedData.bio || null,
                    occupation: validatedData.occupation || null,
                    company: validatedData.company || null,
                    onboardingCompleted: true,
                },
            });
        });

        return NextResponse.json(
            {
                success: true,
                message: "Onboarding completed successfully",
                user: {
                    id: updatedUser.id,
                    bio: updatedUser.bio,
                    occupation: updatedUser.occupation,
                    company: updatedUser.company,
                    onboardingCompleted: updatedUser.onboardingCompleted,
                },
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Onboarding error:', error);
        return handleApiError(error);
    }
}
