import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailWithRetry } from "@/lib/email";
import { databaseBreaker, ExternalServiceError } from "@/lib/api-error-handler";
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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists
        const user = await databaseBreaker.execute(async () => {
            return await prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to database
        await databaseBreaker.execute(async () => {
            return await (prisma as any).passwordResetToken.create({
                data: {
                    token: resetToken,
                    userId: user.id,
                    expires,
                },
            });
        });

        // Send reset email
        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

        try {
            await sendEmailWithRetry(normalizedEmail, resetUrl, 3, 1000, 'password-reset');
        } catch (error) {
            console.error("Failed to send password reset email:", error);

            // Clean up the token if email fails
            try {
                await (prisma as any).passwordResetToken.delete({
                    where: { token: resetToken },
                });
            } catch (cleanupError) {
                console.error("Failed to cleanup reset token:", cleanupError);
            }

            throw new ExternalServiceError("Failed to send password reset email");
        }

        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        if (error instanceof ExternalServiceError) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
