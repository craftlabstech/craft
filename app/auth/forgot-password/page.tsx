"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(null);
    setError(null);

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setEmailSent(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailSent(false);
    setEmail("");
    setError(null);
    setEmailError(null);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-roboto tracking-tight font-semibold text-foreground">
                Craft
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
          <div className="w-full max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                Check your email
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-foreground font-medium text-lg">{email}</p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-muted-foreground">
                Click the link in the email to reset your password. The link
                will expire in 1 hour.
              </p>
            </div>

            <div className="mb-8 p-4 rounded-2xl bg-muted/50 border border-border/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground text-left">
                  <p className="font-medium mb-2">
                    Didn&apos;t receive the email?
                  </p>
                  <div className="space-y-1">
                    <p>• Check your spam folder</p>
                    <p>• Make sure you entered the correct email address</p>
                    <p>• Wait a few minutes and check again</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="w-full h-12 rounded-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-border transition-colors font-medium text-base"
              >
                Use different email
              </Button>
              <Button
                variant="ghost"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 rounded-full font-medium text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend email"
                )}
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
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to sign in</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-medium text-foreground mb-3">
              Forgot password?
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your email and we&apos;ll send you a reset link
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
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                className={`h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border-border/50 outline-none focus:border-border transition-colors text-base ${
                  emailError ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {emailError && (
                <p className="text-sm text-red-500 px-1">{emailError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !validateEmail(email)}
              className="w-full h-14 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-6">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/auth/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
