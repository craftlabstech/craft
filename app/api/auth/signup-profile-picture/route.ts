import { NextRequest, NextResponse } from "next/server";
import { S3Service } from "@/lib/s3";

export async function POST(request: NextRequest) {
    try {
        // Get form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const tempUserId = formData.get("tempUserId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!tempUserId) {
            return NextResponse.json({ error: "No temporary user ID provided" }, { status: 400 });
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

        // Generate unique key with temp prefix
        const key = S3Service.generateProfilePictureKey(`temp-${tempUserId}`, file.name);

        // Upload to S3
        const uploadResult = await S3Service.uploadFile(buffer, key, file.type);

        return NextResponse.json({
            success: true,
            imageUrl: uploadResult.url,
            key: uploadResult.key,
        });
    } catch (error: any) {
        console.error("Error uploading profile picture during signup:", error);

        if (error.message?.includes("File size")) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
        }

        if (error.message?.includes("File type")) {
            return NextResponse.json({ error: "File must be JPEG, PNG, or WebP format" }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
