"use client";

import React from "react";
// import { useTheme } from "./theme-provider";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className = "" }: LoadingProps) {
  // const { theme } = useTheme();

  // Define size in pixels based on the size prop
  const sizeInPixels = {
    sm: 16,
    md: 24,
    lg: 32,
  }[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-muted-foreground`}
        xmlns="http://www.w3.org/2000/svg"
        width={sizeInPixels}
        height={sizeInPixels}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}

export default Loading;
