"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function VerifyRequestContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const errorParam = searchParams.get("error");
    const triggeredParam = searchParams.get("triggered");

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }

    // If verification was automatically triggered during signin, show success message
    if (triggeredParam === "true") {
      setResendMessage(
        "A verification email has been sent to your email address."
      );
    }
  }, [searchParams]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "Verification":
      case "InvalidToken":
        return "The verification token is invalid or has already been used.";
      case "TokenExpired":
        return "The verification token has expired. Please request a new one.";
      case "EmailMismatch":
        return "The email address doesn't match the verification token.";
      case "InvalidParameters":
        return "Invalid verification parameters.";
      case "ServerError":
        return "A server error occurred during verification.";
      case "AccessDenied":
        return "Access denied. You don't have permission to sign in.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "EmailSendFailed":
        return "We couldn't automatically send a verification email. Please try using the resend button below.";
      default:
        return "An error occurred during verification. Please try again.";
    }
  };

  const handleResendEmail = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("Verification email sent successfully!");
      } else {
        setError(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push("/auth/signin");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button onClick={handleBackToSignIn} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>

              {email && (
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend verification email"
                  )}
                </Button>
              )}

              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary hover:underline"
                >
                  Try signing in again
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {resendMessage && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-muted-foreground">
              {email ? (
                <>
                  {searchParams.get("triggered") === "true" ? (
                    <>
                      Your email address needs to be verified before you can
                      sign in. We&apos;ve sent a verification link to{" "}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                    </>
                  ) : (
                    <>
                      A verification link has been sent to{" "}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                    </>
                  )}
                </>
              ) : (
                "A sign in link has been sent to your email address."
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your email and click the verification link to verify
              your account. Once verified, you can return to the sign-in page.
            </p>
            {searchParams.get("triggered") === "true" && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> After verifying your email, return to
                  the sign-in page and enter your credentials again to complete
                  the sign-in process.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleBackToSignIn}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>

            {email && (
              <Button
                onClick={handleResendEmail}
                variant="secondary"
                className="w-full"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Didn&apos;t receive an email?</p>
              <p className="mt-1">
                Check your spam folder or{" "}
                {email ? (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    resend it
                  </button>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="text-primary hover:underline"
                  >
                    try again
                  </Link>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
