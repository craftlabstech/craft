import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest, context: any) => {
    try {
        return await NextAuth(authOptions)(req, context);
    } catch (error: any) {
        console.error("NextAuth error:", error);

        // Handle database-related errors
        if (error?.code === 'P1001' || error?.code === 'P2021') {
            // Redirect to database setup page
            const url = new URL('/auth/database-setup', req.url);
            return Response.redirect(url.toString(), 302);
        }

        // Handle other known errors
        if (error?.message?.includes('Service temporarily unavailable')) {
            const url = new URL('/auth/error?error=DatabaseError', req.url);
            return Response.redirect(url.toString(), 302);
        }

        // For unknown errors, fallback to generic error page
        const url = new URL('/auth/error?error=Configuration', req.url);
        return Response.redirect(url.toString(), 302);
    }
};

export { handler as GET, handler as POST };
