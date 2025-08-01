"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Github,
  Mail,
  User,
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function SignUpForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle auth errors from URL params
  useEffect(() => {
    const error = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl");

    if (error) {
      setError(getErrorMessage(error));
    }

    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session && !error) {
        router.push(callbackUrl || "/onboarding");
      }
    };

    checkSession();
  }, [searchParams, router]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "OAuthSignin":
        return "Error in constructing an authorization URL.";
      case "OAuthCallback":
        return "Error in handling the response from an OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create OAuth account.";
      case "EmailCreateAccount":
        return "Could not create email account.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "Email already associated with another account. Please sign in using the original method.";
      case "EmailSignin":
        return "Check your email address.";
      case "CredentialsSignin":
        return "Sign up failed. Check the details you provided are correct.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign up.";
      case "Verification":
        return "The sign up link is no longer valid. It may have been used already or it may have expired.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  };

  const validateImageFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setImageUploadError(
        "Please upload a valid image file (JPEG, PNG, GIF, or WebP)"
      );
      return false;
    }

    if (file.size > maxSize) {
      setImageUploadError("Image size must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(null);
    setError(null);

    if (value && !validateEmail(value)) {
      setIsEmailValid(false);
      setEmailError("Please enter a valid email address");
    } else {
      setIsEmailValid(true);
      setEmailError(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameError(null);
    setError(null);

    if (value && !validateName(value)) {
      setNameError("Name must be between 2 and 50 characters");
    } else {
      setNameError(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isEmailValid) return;

    // If we're on step 2, validate name as well
    if (step === 2 && (!name || !validateName(name))) {
      setNameError("Name must be between 2 and 50 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email: email.toLowerCase().trim(),
        redirect: false,
        callbackUrl: searchParams.get("callbackUrl") || "/onboarding",
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.ok) {
        setEmailSent(true);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignUp = async (providerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(providerId, {
        callbackUrl: searchParams.get("callbackUrl") || "/onboarding",
        redirect: false,
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
        setIsLoading(false);
      }
      // If successful, user will be redirected
    } catch (error) {
      console.error("Error signing up:", error);
      setError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageUploadError(null);

    if (file) {
      if (!validateImageFile(file)) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.onerror = () => {
        setImageUploadError("Failed to read the image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const proceedToEmailDetails = () => {
    if (email && isEmailValid) {
      setStep(2);
    }
  };

  const resetEmailFlow = () => {
    setEmailSent(false);
    setEmail("");
    setName("");
    setProfileImage(null);
    setError(null);
    setEmailError(null);
    setNameError(null);
    setImageUploadError(null);
    setStep(1);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Check your email
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              We&apos;ve sent a sign-up link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to create your account and complete
              the onboarding. The link will expire in 24 hours.
            </p>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Didn&apos;t receive the email?</strong>
                <br />
                • Check your spam folder
                <br />
                • Make sure you entered the correct email address
                <br />• Wait a few minutes and check again
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={resetEmailFlow}
                className="w-full"
              >
                Use different email
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  handleEmailSignUp({
                    preventDefault: () => {},
                  } as React.FormEvent)
                }
                disabled={isLoading}
                className="w-full text-sm"
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete your profile</CardTitle>
            <p className="text-muted-foreground">
              Let&apos;s set up your account details
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25">
                  {profileImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </>
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Upload profile picture (optional)
                </p>
                <p className="text-xs text-muted-foreground">
                  Max 5MB • JPEG, PNG, GIF, WebP
                </p>
              </div>
              {imageUploadError && (
                <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{imageUploadError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={handleNameChange}
                required
                className={
                  nameError ? "border-red-500 focus:border-red-500" : ""
                }
                disabled={isLoading}
              />
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
            </div>

            {/* Email Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} disabled className="bg-muted" />
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleEmailSignUp}
                disabled={isLoading || !name || !validateName(name)}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-muted-foreground">
            Join Craft and start building amazing things
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social Sign Up */}
          <div className="space-y-3">
            <Button
              onClick={() => handleProviderSignUp("google")}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              onClick={() => handleProviderSignUp("github")}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email Sign Up */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              proceedToEmailDetails();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                className={
                  emailError ? "border-red-500 focus:border-red-500" : ""
                }
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !isEmailValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Continue with email"
              )}
            </Button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?
            </p>
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Sign in instead
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
