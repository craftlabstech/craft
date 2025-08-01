import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { bio, occupation, company } = await request.json();

        // Update user profile
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                bio: bio || null,
                occupation: occupation || null,
                company: company || null,
                onboardingCompleted: true,
            },
        });

        return NextResponse.json(
            { message: "Onboarding completed successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
