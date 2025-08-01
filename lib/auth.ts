import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { createResilientPrismaAdapter } from "./resilient-prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmailWithRetry, validateEmailDeliverability } from "./email";
import { databaseBreaker, ExternalServiceError } from "./api-error-handler";

export const authOptions: NextAuthOptions = {
  adapter: createResilientPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM!,
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier, url }) => {
        try {
          // Validate email deliverability
          if (!await validateEmailDeliverability(identifier)) {
            throw new ExternalServiceError('Invalid or undeliverable email address');
          }

          // Send email with retry mechanism
          await sendEmailWithRetry(identifier, url);
        } catch (error) {
          console.error("Failed to send verification email:", error);

          if (error instanceof ExternalServiceError) {
            throw error;
          }

          throw new ExternalServiceError("Failed to send verification email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error", // Use our custom error page
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user object is available (sign in), update token
      if (user) {
        token.id = user.id;
        try {
          const dbUser = await databaseBreaker.execute(async () => {
            return await prisma.user.findUnique({
              where: { id: user.id },
              select: { onboardingCompleted: true },
            });
          });
          token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
          // Continue with default value instead of failing
          token.onboardingCompleted = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Handle email sign in
        if (account?.provider === "email") {
          // Check if user exists with database error handling
          const existingUser = await databaseBreaker.execute(async () => {
            return await prisma.user.findUnique({
              where: { email: user.email! },
            });
          });

          if (!existingUser) {
            // For new users via email, allow sign in (account will be created)
            return true;
          }

          // Check if user has other sign in methods
          const accounts = await prisma.account.findMany({
            where: { userId: existingUser.id },
          });

          // If user has OAuth accounts but trying to sign in with email
          const hasOAuthAccounts = accounts.some(acc => acc.provider !== "email");
          if (hasOAuthAccounts && !accounts.some(acc => acc.provider === "email")) {
            // User exists with OAuth but no email provider linked
            return "/auth/signin?error=OAuthAccountNotLinked";
          }
        }

        // For OAuth providers, extract additional info
        if (account?.provider === "google" && profile) {
          user.image = (profile as { picture?: string }).picture;
          user.name = (profile as { name?: string }).name;
        }
        if (account?.provider === "github" && profile) {
          user.image = (profile as { avatar_url?: string }).avatar_url;
          user.name = (profile as { name?: string; login?: string }).name || (profile as { login?: string }).login;
        }

        // Check for existing user with same email but different provider
        if (account?.provider !== "email" && user.email && account) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
              },
            });

            if (!existingAccount) {
              // Link the account to existing user
              return true;
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);

        // Handle specific database errors
        if (error && typeof error === 'object' && 'code' in error) {
          const prismaError = error as { code: string };
          if (prismaError.code === 'P1001' || prismaError.code === 'P2021') {
            // Database connection or schema issues
            console.warn('Database not available during sign in');
            return "/auth/database-setup";
          }
        }

        return "/auth/error";
      }
    },
    async redirect({ url, baseUrl }) {
      // Handle error redirects
      if (url.includes("error=")) {
        return url;
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        // Set default values for new users
        await prisma.user.update({
          where: { id: user.id },
          data: {
            onboardingCompleted: false,
          },
        });
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },
    async signIn({ user, account }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut() {
      console.log('User signed out');
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

// Don't export NextAuth instance, just export the options
// The NextAuth instance should be created in the route handler
