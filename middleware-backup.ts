import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req: NextRequest) {
        // Allow the request to proceed
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Handle database errors in auth
                if (req.nextUrl.pathname.startsWith('/api/auth')) {
                    return true; // Always allow auth API calls to proceed
                }

                // For protected routes, check if user is authenticated
                if (req.nextUrl.pathname.startsWith('/dashboard') ||
                    req.nextUrl.pathname.startsWith('/onboarding')) {
                    return !!token;
                }

                return true;
            },
        },
        pages: {
            signIn: '/auth/signin',
            error: '/auth/error',
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes that don't need auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
