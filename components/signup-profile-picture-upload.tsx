"use client";

import React, { useState, useRef } from "react";
import NextImage from "next/image";
import { Upload, Trash2, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignupProfilePictureUploadProps {
  className?: string;
  onImageChange?: (file: File | null, previewUrl: string | null) => void;
  initialImage?: string | null;
}

export default function SignupProfilePictureUpload({
  className = "",
  onImageChange,
  initialImage = null,
}: SignupProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): string | null => {
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "File must be JPEG, PNG, or WebP format";
    }

    return null;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
      setImageError(false);

      // Notify parent component
      onImageChange?.(file, url);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError("Failed to process image");
    }
  };

  const handleRemoveImage = () => {
    // Clean up object URL to prevent memory leaks
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setImageError(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Notify parent component
    onImageChange?.(null, null);
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          {previewUrl && !imageError ? (
            <NextImage
              src={previewUrl}
              alt="Profile picture preview"
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

        {/* Remove button for uploaded image */}
        {previewUrl && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Overlay for hover effect when no image */}
        {!previewUrl && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
            onClick={handleFileSelect}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex space-x-2">
        <Button
          onClick={handleFileSelect}
          variant="outline"
          size="sm"
          type="button"
        >
          <Upload className="w-4 h-4 mr-2" />
          {previewUrl ? "Change" : "Upload"}
        </Button>

        {previewUrl && (
          <Button
            onClick={handleRemoveImage}
            variant="outline"
            size="sm"
            type="button"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
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
      {!uploadError && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Optional. Max size: 5MB. Formats: JPEG, PNG, WebP.
        </p>
      )}
    </div>
  );
}
