"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: unknown;
    error: string | null;
}

export function useAuth(): AuthState {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const urlError = searchParams.get("error");
        if (urlError) {
            setError(getErrorMessage(urlError));
        } else {
            setError(null);
        }
    }, [searchParams]);

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
                return "Sign in failed. Check the details you provided are correct.";
            case "SessionRequired":
                return "Please sign in to access this page.";
            case "AccessDenied":
                return "Access denied. You do not have permission to sign in.";
            case "Verification":
                return "The sign in link is no longer valid. It may have been used already or it may have expired.";
            default:
                return "An unexpected error occurred. Please try again.";
        }
    };

    return {
        isLoading: status === "loading",
        isAuthenticated: status === "authenticated",
        user: session?.user || null,
        error,
    };
}

export function useAuthRedirect(redirectTo?: string) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push("/auth/signin");
            return;
        }

        if (redirectTo) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);
}

export function useRequireAuth() {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            window.location.href = "/auth/signin";
        }
    }, [auth.isLoading, auth.isAuthenticated]);

    return auth;
}
