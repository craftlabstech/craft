import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Debug endpoint to check user status
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
                bio: true,
                occupation: true,
                company: true,
                image: true,
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
                emailVerified: session.user.emailVerified,
            }
        });
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Reset user profile fields for testing
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Reset profile fields
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                bio: null,
                occupation: null,
                company: null,
            },
        });

        return NextResponse.json({
            message: 'Profile fields reset',
            user: {
                id: user.id,
                email: user.email,
                bio: user.bio,
                occupation: user.occupation,
                company: user.company,
            }
        });
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
