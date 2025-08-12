"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { Upload, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfilePictureUploadProps {
  className?: string;
  onImageUpdate?: (imageUrl: string | null) => void;
}

export default function ProfilePictureUpload({
  className = "",
  onImageUpdate,
}: ProfilePictureUploadProps) {
  const { data: session, update: updateSession } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/profile-picture", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      // Update session with new image URL
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: data.imageUrl,
        },
      });

      // Notify parent component
      onImageUpdate?.(data.imageUrl);

      setImageError(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!session?.user?.image) return;

    setIsDeleting(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/user/profile-picture", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete image");
      }

      // Update session to remove image
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: null,
        },
      });

      // Notify parent component
      onImageUpdate?.(null);

      setImageError(false);
    } catch (error) {
      console.error("Error deleting image:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to delete image"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const currentImage = session?.user?.image;
  const isCustomImage =
    currentImage &&
    !currentImage.includes("avatars.githubusercontent.com") &&
    !currentImage.includes("lh3.googleusercontent.com");

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          {currentImage && !imageError ? (
            <NextImage
              src={currentImage}
              alt="Profile picture"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Overlay for hover effect */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Upload/Delete Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={handleFileSelect}
          disabled={isUploading || isDeleting}
          variant="outline"
          size="sm"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {currentImage ? "Change" : "Upload"}
            </>
          )}
        </Button>

        {isCustomImage && (
          <Button
            onClick={handleDeleteImage}
            disabled={isUploading || isDeleting}
            variant="outline"
            size="sm"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {uploadError && (
        <p className="text-sm text-destructive text-center max-w-xs">
          {uploadError}
        </p>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Upload a profile picture. Max size: 5MB. Formats: JPEG, PNG, WebP.
      </p>
    </div>
  );
}
