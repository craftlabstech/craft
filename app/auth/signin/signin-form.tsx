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
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";

export default function SignInForm() {
  const [step, setStep] = useState(1); // 1: email, 2: password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);
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
      if (session) {
        const redirectUrl = callbackUrl || "/dashboard";
        router.push(redirectUrl);
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
        return "Email already associated with another account. Please sign in with your original provider.";
      case "EmailSignin":
        return "Check your email for the sign in link.";
      case "CredentialsSignin":
        return "Sign in failed. Please check your credentials.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      case "Configuration":
        return "Authentication service is temporarily unavailable.";
      case "AccessDenied":
        return "Access denied. You don't have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "DatabaseError":
        return "Authentication service is temporarily unavailable. Please try again in a few minutes.";
      default:
        return "An error occurred during sign in. Please try again.";
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(null);
    setError(null);

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(null);
    setError(null);
  };

  const handleEmailStep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Move to password step
    setStep(2);
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPasswordError(null);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Password sign in error:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (providerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const result = await signIn(providerId, {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
        setIsLoading(false);
      }
      // If successful, the redirect will happen automatically
    } catch (error) {
      console.error(`${providerId} sign in error:`, error);
      setError(`Failed to sign in with ${providerId}. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setStep(1);
  };

  // Remove the email sent screen - we're using password auth now
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
                Enter password
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

            <form onSubmit={handlePasswordSignIn} className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
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

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
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

            {/* Forgot password link */}
            <div className="text-center mt-6">
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
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
              Welcome back
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
            {/* Email Sign In */}
            <form onSubmit={handleEmailStep} className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className={`h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border-border/50 outline-none focus:border-border transition-colors text-base ${
                    emailError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  required
                />
                {emailError && (
                  <p className="text-sm text-red-500 px-1">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-base"
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

            {/* Sign up link */}
            <div className="text-center">
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

            {/* OAuth Providers */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
                className="w-full h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-border transition-colors text-foreground hover:text-foreground flex items-center justify-start relative text-base"
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
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading}
                className="w-full h-14 px-6 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-border transition-colors text-foreground hover:text-foreground flex items-center justify-start relative text-base"
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
