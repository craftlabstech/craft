import NextAuth from "@/lib/auth";
import { handleApiError, databaseBreaker } from "@/lib/api-error-handler";
import { NextRequest, NextResponse } from "next/server";

async function authHandler(req: NextRequest) {
    try {
        // Use circuit breaker for database operations
        const response = await databaseBreaker.execute(async () => {
            return NextAuth(req as NextRequest);
        });

        return response;
    } catch (error) {
        console.error("NextAuth error:", error);

        // For API routes, we need to handle errors gracefully
        if (req.url?.includes('/api/auth/')) {
            return handleApiError(error);
        }

        // For auth pages, redirect to error page
        const url = new URL('/auth/error', req.url);
        url.searchParams.set('error', 'Configuration');
        return NextResponse.redirect(url);
    }
}

export { authHandler as GET, authHandler as POST };
