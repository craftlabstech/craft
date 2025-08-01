"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Home, RotateCcw } from "lucide-react";

export default function AuthErrorContent() {
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const { message, details } = getErrorInfo(errorParam);
      setError(message);
      setErrorDetails(details);
    }
  }, [searchParams]);

  const getErrorInfo = (
    errorCode: string
  ): { message: string; details: string | null } => {
    switch (errorCode) {
      case "Configuration":
        return {
          message: "Server Configuration Error",
          details:
            "There is a problem with the authentication service configuration. Please contact support.",
        };
      case "AccessDenied":
        return {
          message: "Access Denied",
          details:
            "You don't have permission to sign in. Your account may be restricted or disabled.",
        };
      case "Verification":
        return {
          message: "Verification Error",
          details:
            "The verification token has expired or has already been used. Please request a new sign-in link.",
        };
      case "OAuthSignin":
        return {
          message: "OAuth Sign-in Error",
          details:
            "There was an error creating the authorization URL. Please try again.",
        };
      case "OAuthCallback":
        return {
          message: "OAuth Callback Error",
          details:
            "There was an error handling the response from the OAuth provider. Please try again.",
        };
      case "OAuthCreateAccount":
        return {
          message: "OAuth Account Creation Failed",
          details:
            "Could not create your account with the OAuth provider. The email may already be in use.",
        };
      case "EmailCreateAccount":
        return {
          message: "Email Account Creation Failed",
          details:
            "Could not create your account with email. The email may already be in use.",
        };
      case "Callback":
        return {
          message: "Callback Error",
          details:
            "There was an error in the OAuth callback handler. Please try again.",
        };
      case "OAuthAccountNotLinked":
        return {
          message: "Account Not Linked",
          details:
            "This email is already associated with another account. Please sign in with your original provider or use a different email.",
        };
      case "EmailSignin":
        return {
          message: "Email Sign-in Error",
          details:
            "Could not send the email. Please check your email address and try again.",
        };
      case "CredentialsSignin":
        return {
          message: "Invalid Credentials",
          details:
            "The credentials you provided are incorrect. Please check and try again.",
        };
      case "SessionRequired":
        return {
          message: "Session Required",
          details:
            "You must be signed in to access this page. Please sign in and try again.",
        };
      case "Default":
      default:
        return {
          message: "Authentication Error",
          details:
            "An unexpected error occurred during authentication. Please try again.",
        };
    }
  };

  const handleRetry = () => {
    router.push("/auth/signin");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            {error || "Authentication Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorDetails ||
                "An error occurred during authentication. Please try again."}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Contact support
              </Link>
            </p>
          </div>

          {/* Additional troubleshooting tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check that your browser allows cookies</li>
              <li>• Try clearing your browser cache</li>
              <li>• Disable browser extensions temporarily</li>
              <li>• Try using an incognito/private browsing window</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
