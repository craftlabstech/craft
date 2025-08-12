import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const CDN_URL = process.env.AWS_CLOUDFRONT_URL; // Optional: If you're using CloudFront

export interface UploadResult {
    url: string;
    key: string;
}

export class S3Service {
    /**
     * Upload a file to S3
     */
    static async uploadFile(
        file: Buffer,
        key: string,
        contentType: string
    ): Promise<UploadResult> {
        try {
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: file,
                    ContentType: contentType,
                    // Removed ACL parameter - rely on bucket policy for public access
                },
            });

            await upload.done();

            // Generate the public URL
            const url = CDN_URL
                ? `${CDN_URL}/${key}`
                : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

            return { url, key };
        } catch (error) {
            console.error("Error uploading file to S3:", error);
            throw new Error("Failed to upload file to S3");
        }
    }

    /**
     * Delete a file from S3
     */
    static async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(command);
        } catch (error) {
            console.error("Error deleting file from S3:", error);
            throw new Error("Failed to delete file from S3");
        }
    }

    /**
     * Generate a unique key for profile pictures
     */
    static generateProfilePictureKey(userId: string, originalName: string): string {
        const timestamp = Date.now();
        // Use path.extname for safer extraction, then sanitize
        let extension = path.extname(originalName).replace('.', '').toLowerCase();
        // Only allow certain extensions
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        if (!allowedExtensions.includes(extension)) {
            extension = 'jpg';
        }
        return `profile-pictures/${userId}/${timestamp}.${extension}`;
    }

    /**
     * Validate file type and size for profile pictures
     */
    static validateProfilePicture(file: Express.Multer.File): boolean {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        }

        if (file.size > maxSize) {
            throw new Error('File too large. Maximum size is 5MB.');
        }

        return true;
    }
}
