import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseBreaker } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const email = url.searchParams.get("email");

        if (!token || !email) {
            return NextResponse.redirect(
                new URL("/auth/verify-request?error=InvalidParameters", request.url)
            );
        }

        // Find and validate the verification token
        const verificationToken = await databaseBreaker.execute(async () => {
            return await prisma.verificationToken.findUnique({
                where: {
                    token,
                },
            });
        });

        if (!verificationToken) {
            return NextResponse.redirect(
                new URL("/auth/verify-request?error=InvalidToken", request.url)
            );
        }

        // Check if token has expired
        if (verificationToken.expires < new Date()) {
            // Delete expired token
            await databaseBreaker.execute(async () => {
                await prisma.verificationToken.delete({
                    where: { token },
                });
            });

            return NextResponse.redirect(
                new URL("/auth/verify-request?error=TokenExpired", request.url)
            );
        }

        // Check if the email matches
        if (verificationToken.identifier !== email.toLowerCase()) {
            return NextResponse.redirect(
                new URL("/auth/verify-request?error=EmailMismatch", request.url)
            );
        }

        // Update user email verification status
        await databaseBreaker.execute(async () => {
            await prisma.user.update({
                where: { email: email.toLowerCase() },
                data: { emailVerified: new Date() },
            });
        });

        // Delete the verification token (one-time use)
        await databaseBreaker.execute(async () => {
            await prisma.verificationToken.delete({
                where: { token },
            });
        });

        // Redirect to sign in page with success message
        return NextResponse.redirect(
            new URL("/auth/signin?message=EmailVerified", request.url)
        );
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.redirect(
            new URL("/auth/verify-request?error=ServerError", request.url)
        );
    }
}
