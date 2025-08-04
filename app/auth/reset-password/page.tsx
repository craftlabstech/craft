"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(null);
    setError(null);

    if (value && !validatePassword(value)) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError(null);
    }

    // Re-validate confirm password if it's been entered
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword) {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(null);
    setError(null);

    if (value && password && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!password || !validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-mono tracking-tighter font-semibold text-foreground">
                CraftJS
              </span>
              <span className="px-2 py-0.5 rounded-full border border-border text-xs font-light text-muted-foreground uppercase tracking-wider">
                Beta
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-14 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                Password reset successful
              </h1>
              <p className="text-muted-foreground text-lg">
                Your password has been updated successfully
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
              >
                Sign in with new password
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-mono tracking-tighter font-semibold text-foreground">
              CraftJS
            </span>
            <span className="px-2 py-0.5 rounded-full border border-border text-xs font-light text-muted-foreground uppercase tracking-wider">
              Beta
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <button className="text-xs text-center sm:text-sm rounded-full border border-border text-foreground hover:bg-muted hover:text-foreground hover:border-border px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-all duration-200 focus:outline-none cursor-pointer">
                <span>Sign in</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-14 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-medium text-foreground mb-3">
              Reset password
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your new password
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  disabled={isLoading}
                  className={`h-14 px-6 pr-12 rounded-full bg-card/80 backdrop-blur-sm border-border/50 outline-none focus:border-border transition-colors text-base ${
                    passwordError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 px-1">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  disabled={isLoading}
                  className={`h-14 px-6 pr-12 rounded-full bg-card/80 backdrop-blur-sm border-border/50 outline-none focus:border-border transition-colors text-base ${
                    confirmPasswordError
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-red-500 px-1">
                  {confirmPasswordError}
                </p>
              )}
              <p className="text-xs text-muted-foreground px-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <Button
              type="submit"
              disabled={
                isLoading ||
                !password ||
                !confirmPassword ||
                !validatePassword(password) ||
                password !== confirmPassword ||
                !token
              }
              className="w-full h-14 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <span className="text-muted-foreground">
              Remember your password?{" "}
            </span>
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
