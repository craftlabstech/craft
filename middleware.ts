import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // Protected routes that require authentication
        const protectedRoutes = ["/profile", "/settings"];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        // Public auth routes
        const authRoutes = ["/auth/signin", "/auth/signup", "/auth/verify-request", "/auth/verify-email"];
        const isAuthRoute = authRoutes.includes(pathname);

        // Onboarding route
        const isOnboardingRoute = pathname === "/onboarding";

        // If user is authenticated but trying to access auth routes
        if (token && isAuthRoute && token.emailVerified) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // If user is authenticated but email not verified (except for verify-request and verify-email pages)
        // OAuth users (Google, GitHub) have emailVerified automatically set, so this mainly applies to credential users
        if (token && !token.emailVerified && !pathname.startsWith("/auth/verify") && !pathname.startsWith("/api/auth")) {
            return NextResponse.redirect(new URL("/auth/verify-request", req.url));
        }

        // If user is authenticated with verified email but hasn't completed onboarding
        // Redirect to onboarding from protected routes, not from home page
        // OAuth users with verified emails should also be redirected to onboarding if not completed
        if (token && token.emailVerified && !token.onboardingCompleted && isProtectedRoute) {
            return NextResponse.redirect(new URL("/onboarding", req.url));
        }

        // If user has completed onboarding but trying to access onboarding page
        if (token && token.onboardingCompleted && isOnboardingRoute) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Protected routes require authentication
                const protectedRoutes = ["/profile", "/settings"];
                const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

                if (isProtectedRoute) {
                    return !!token;
                }

                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*|$).*)",
    ],
};
