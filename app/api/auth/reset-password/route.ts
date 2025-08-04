import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { databaseBreaker } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        // Find and validate reset token
        const resetToken = await databaseBreaker.execute(async () => {
            // Note: This will work once Prisma client is regenerated
            return await (prisma as any).passwordResetToken.findUnique({
                where: { token },
                include: { user: true },
            });
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        // Check if token has expired
        if (new Date() > resetToken.expires) {
            // Delete expired token
            await (prisma as any).passwordResetToken.delete({
                where: { token },
            });

            return NextResponse.json(
                { error: "Reset token has expired" },
                { status: 400 }
            );
        }

        // Check if token has already been used
        if (resetToken.used) {
            return NextResponse.json(
                { error: "Reset token has already been used" },
                { status: 400 }
            );
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user password and mark token as used
        await databaseBreaker.execute(async () => {
            // Update user password
            await (prisma as any).user.update({
                where: { id: resetToken.userId },
                data: {
                    password: hashedPassword,
                    emailVerified: new Date(), // Ensure email is verified after password reset
                },
            });

            // Mark token as used
            await (prisma as any).passwordResetToken.update({
                where: { token },
                data: { used: true },
            });
        });

        return NextResponse.json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
