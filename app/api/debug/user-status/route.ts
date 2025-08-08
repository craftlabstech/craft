import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Debug endpoint to check and optionally reset onboarding status
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get current user data
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                onboardingCompleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Get associated accounts
        const accounts = await prisma.account.findMany({
            where: { userId: session.user.id },
            select: {
                provider: true,
                providerAccountId: true,
            },
        });

        return NextResponse.json({
            user,
            accounts,
            sessionData: {
                id: session.user.id,
                email: session.user.email,
                onboardingCompleted: session.user.onboardingCompleted,
                emailVerified: session.user.emailVerified,
            }
        });
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Reset onboarding status for testing
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Reset onboarding status
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                onboardingCompleted: false,
                bio: null,
                occupation: null,
                company: null,
            },
        });

        return NextResponse.json({
            message: 'Onboarding status reset',
            user: {
                id: user.id,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted,
            }
        });
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
