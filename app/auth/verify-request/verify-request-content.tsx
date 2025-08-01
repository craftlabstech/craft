"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function VerifyRequestContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const errorParam = searchParams.get("error");

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "AccessDenied":
        return "Access denied. You don't have permission to sign in.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      default:
        return "An error occurred during verification. Please try again.";
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
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {email ? (
                <>
                  A sign in link has been sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              ) : (
                "A sign in link has been sent to your email address."
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to sign in to your account.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Email sent successfully</span>
            </div>
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

            <div className="text-sm text-muted-foreground">
              <p>Didn&apos;t receive an email?</p>
              <p className="mt-1">
                Check your spam folder or{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary hover:underline"
                >
                  try again
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
