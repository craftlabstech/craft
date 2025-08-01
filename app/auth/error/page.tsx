"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AuthErrorContent from "./auth-error-content";

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
