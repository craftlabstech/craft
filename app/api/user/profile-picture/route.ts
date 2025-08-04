import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Service } from "@/lib/s3";

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create a multer-like file object for validation
        const multerFile = {
            buffer,
            mimetype: file.type,
            size: file.size,
            originalname: file.name,
        } as Express.Multer.File;

        // Validate file
        S3Service.validateProfilePicture(multerFile);

        // Generate unique key
        const key = S3Service.generateProfilePictureKey(session.user.id, file.name);

        // Upload to S3
        const uploadResult = await S3Service.uploadFile(buffer, key, file.type);

        // Get current user data to check for existing profile picture
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true },
        });

        // Delete old profile picture if it exists and is stored in S3
        if (currentUser?.image && currentUser.image.includes('amazonaws.com')) {
            try {
                // Extract key from old URL
                const oldKey = currentUser.image.split('.amazonaws.com/')[1];
                if (oldKey && oldKey.startsWith('profile-pictures/')) {
                    await S3Service.deleteFile(oldKey);
                }
            } catch (error) {
                console.error("Error deleting old profile picture:", error);
                // Continue with update even if deletion fails
            }
        }

        // Update user profile picture in database
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: uploadResult.url },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            },
        });

        return NextResponse.json({
            message: "Profile picture updated successfully",
            user: updatedUser,
            imageUrl: uploadResult.url,
        });

    } catch (error) {
        console.error("Error uploading profile picture:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get current user data
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true },
        });

        if (!currentUser?.image) {
            return NextResponse.json({ error: "No profile picture to delete" }, { status: 404 });
        }

        // Delete from S3 if it's stored there
        if (currentUser.image.includes('amazonaws.com')) {
            try {
                const key = currentUser.image.split('.amazonaws.com/')[1];
                if (key && key.startsWith('profile-pictures/')) {
                    await S3Service.deleteFile(key);
                }
            } catch (error) {
                console.error("Error deleting file from S3:", error);
                // Continue with database update even if S3 deletion fails
            }
        }

        // Remove profile picture from database (set to default)
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: null },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            },
        });

        return NextResponse.json({
            message: "Profile picture deleted successfully",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Error deleting profile picture:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
