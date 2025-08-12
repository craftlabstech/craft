import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailWithRetry } from "@/lib/email";
import { databaseBreaker } from "@/lib/api-error-handler";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists and is not verified
        const user = await databaseBreaker.execute(async () => {
            return await prisma.user.findUnique({
                where: { email: normalizedEmail },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    emailVerified: true
                },
            });
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { error: "Email is already verified" },
                { status: 400 }
            );
        }

        // Delete any existing verification tokens for this email
        await databaseBreaker.execute(async () => {
            await prisma.verificationToken.deleteMany({
                where: { identifier: normalizedEmail },
            });
        });

        // Create new verification token
        const verificationToken = crypto.randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await databaseBreaker.execute(async () => {
            return await prisma.verificationToken.create({
                data: {
                    identifier: normalizedEmail,
                    token: verificationToken,
                    expires,
                },
            });
        });

        // Send verification email
        try {
            const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

            await sendEmailWithRetry(
                normalizedEmail,
                verificationUrl,
                3, // maxRetries
                1000, // delay
                'signin' // emailType
            );

            return NextResponse.json({
                success: true,
                message: "Verification email sent successfully",
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            return NextResponse.json(
                { error: "Failed to send verification email" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error resending verification email:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
