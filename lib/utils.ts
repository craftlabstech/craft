import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image file constants
export const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"] as const;
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
