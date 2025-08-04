"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Github,
  Mail,
  User,
  Camera,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";

export default function SignUpForm() {
  const [step, setStep] = useState(1); // 1: email, 2: password, 3: profile details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
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

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // Just validate email and move to step 2
      if (!email || !isEmailValid) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      // Validate password and create account
      if (!password || !validatePassword(password)) {
        setPasswordError("Password must be at least 8 characters long");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create account via API
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
            name: name.trim() || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create account");
          return;
        }

        // Account created successfully, now sign in
        const result = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
          callbackUrl: searchParams.get("callbackUrl") || "/onboarding",
        });

        if (result?.error) {
          setError(
            "Account created but failed to sign in. Please try signing in manually."
          );
        } else if (result?.ok) {
          setAccountCreated(true);
          // Redirect will be handled by NextAuth
          router.push(searchParams.get("callbackUrl") || "/onboarding");
        }
      } catch (error) {
        console.error("Error creating account:", error);
        setError("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
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

  const proceedToPasswordStep = () => {
    if (email && isEmailValid) {
      setStep(2);
    }
  };

  const resetSignupFlow = () => {
    setAccountCreated(false);
    setEmail("");
    setPassword("");
    setName("");
    setProfileImage(null);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setNameError(null);
    setImageUploadError(null);
    setStep(1);
  };

  if (accountCreated) {
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
              <Link href="mailto:support@craftjs.dev">
                <button className="text-xs text-center sm:text-sm rounded-full bg-primary text-primary-foreground border border-primary hover:bg-primary/90 hover:border-primary/80 px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-all duration-200 focus:outline-none cursor-pointer">
                  <span>Contact</span>
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
                Account created!
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                Welcome to CraftJS
              </p>
              <p className="text-foreground font-medium text-lg">{email}</p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-muted-foreground">
                Your account has been created successfully. You&apos;re being
                redirected to complete your onboarding.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/onboarding")}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
              >
                Continue to Onboarding
              </Button>
              <Button
                variant="ghost"
                onClick={resetSignupFlow}
                className="w-full h-12 rounded-full font-medium text-base"
              >
                Create another account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
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
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-14 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium text-foreground mb-3">
                Create a password
              </h1>
              <p className="text-muted-foreground text-lg">For {email}</p>
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

            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
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
                <p className="text-xs text-muted-foreground px-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Name Input (Optional) */}
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Full name (optional)"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  className={`h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border-border/50 focus:border-border transition-colors text-base ${
                    nameError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {nameError && (
                  <p className="text-sm text-red-500 px-1">{nameError}</p>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  disabled={
                    isLoading || !password || !validatePassword(password)
                  }
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
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
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full h-14 rounded-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-border transition-colors font-medium text-base"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
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
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-14 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-medium text-foreground mb-3">
              Create an account
            </h1>
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

          {/* Main Form Container */}
          <div className="space-y-6">
            {/* Email Sign Up */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                proceedToPasswordStep();
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isLoading}
                  className={`h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border-border/50 outline-none focus:border-border transition-colors text-base${
                    emailError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {emailError && (
                  <p className="text-sm text-red-500 px-1">{emailError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-14 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            {/* Sign in link */}
            <div className="text-center">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/auth/signin"
                className="text-primary hover:underline font-medium"
              >
                Log in
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="space-y-3">
              <Button
                onClick={() => handleProviderSignUp("google")}
                disabled={isLoading}
                className="w-full h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-border transition-colors text-foreground hover:text-foreground flex items-center justify-start relative text-base"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 absolute left-6 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 absolute left-6" viewBox="0 0 24 24">
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
                <span className="flex-1 text-center">Continue with Google</span>
              </Button>

              <Button
                onClick={() => handleProviderSignUp("github")}
                disabled={isLoading}
                className="w-full h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-border transition-colors text-foreground hover:text-foreground flex items-center justify-start relative text-base"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 absolute left-6 animate-spin" />
                ) : (
                  <Github className="w-5 h-5 absolute left-6" />
                )}
                <span className="flex-1 text-center">Continue with GitHub</span>
              </Button>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/terms" className="hover:underline">
                Terms of Use
              </Link>
              <span className="mx-2">|</span>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
