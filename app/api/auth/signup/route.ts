import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateEmailDeliverability } from "@/lib/email";
import { databaseBreaker, ExternalServiceError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
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

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        // Validate name if provided
        if (name && (name.trim().length < 2 || name.trim().length > 50)) {
            return NextResponse.json(
                { error: "Name must be between 2 and 50 characters" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email is deliverable
        try {
            if (!await validateEmailDeliverability(normalizedEmail)) {
                return NextResponse.json(
                    { error: "Invalid or undeliverable email address" },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.warn("Email validation failed, proceeding anyway:", error);
        }

        // Check if user already exists
        const existingUser = await databaseBreaker.execute(async () => {
            return await prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await databaseBreaker.execute(async () => {
            return await (prisma as any).user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    name: name?.trim() || null,
                    emailVerified: new Date(), // Auto-verify for password signup
                    onboardingCompleted: false,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);

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
