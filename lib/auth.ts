import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createResilientPrismaAdapter } from "./resilient-prisma-adapter";
import { prisma } from "@/lib/prisma";
import { databaseBreaker } from "./api-error-handler";
import bcrypt from "bcryptjs";

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
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await databaseBreaker.execute(async () => {
            return await (prisma as any).user.findUnique({
              where: { email: credentials.email.toLowerCase() },
            });
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Check if email is verified for password-based accounts
          if (!user.emailVerified) {
            // Instead of throwing an error, return null but set a custom error
            // We'll handle this in the signIn callback
            throw new Error("EmailNotVerified");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          // Re-throw EmailNotVerified errors so they can be handled properly
          if (error instanceof Error && error.message === "EmailNotVerified") {
            throw error;
          }
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error", // Use our custom error page
  },
  callbacks: {
    async jwt({ token, user, trigger, account }) {
      console.log("JWT callback - Input:", {
        hasUser: !!user,
        trigger,
        tokenId: token.id,
        tokenOnboarding: token.onboardingCompleted,
        tokenEmailVerified: token.emailVerified,
        accountProvider: account?.provider,
      });

      // If user object is available (sign in), update token
      if (user) {
        token.id = user.id;
        console.log("JWT callback - User sign in, setting token.id:", user.id);
      }

      // Always fetch fresh user data from database for session updates or when user signs in
      if ((user || trigger === "update") && token.id) {
        try {
          console.log("JWT callback - Fetching user data for ID:", token.id);

          // For new OAuth users, we might need to wait a bit for the database events to complete
          if (user && account && (account.provider === "google" || account.provider === "github")) {
            console.log("JWT callback - New OAuth user detected, waiting for database setup");
            // Small delay to ensure createUser and signIn events have completed
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const dbUser = await databaseBreaker.execute(async () => {
            return await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                onboardingCompleted: true,
                emailVerified: true
              },
            });
          });

          console.log("JWT callback - Database user data:", dbUser);

          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.emailVerified = dbUser.emailVerified;
            console.log("JWT callback - Updated token:", {
              onboardingCompleted: token.onboardingCompleted,
              emailVerified: token.emailVerified,
            });
          } else {
            // Fallback for new users that might not be in DB yet
            console.log("JWT callback - No database user found, using fallbacks");
            token.onboardingCompleted = false;
            token.emailVerified = null;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
          // Continue with existing values instead of failing
          if (!token.onboardingCompleted) {
            token.onboardingCompleted = false;
          }
        }
      }

      console.log("JWT callback - Final token:", {
        id: token.id,
        onboardingCompleted: token.onboardingCompleted,
        emailVerified: token.emailVerified,
      });

      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Input:", {
        tokenId: token.id,
        tokenOnboarding: token.onboardingCompleted,
        tokenEmailVerified: token.emailVerified,
        sessionUserEmail: session.user?.email,
      });

      if (token) {
        session.user.id = token.id as string;
        session.user.onboardingCompleted = token.onboardingCompleted || false;
        session.user.emailVerified = token.emailVerified || null;

        console.log("Session callback - Updated session:", {
          userId: session.user.id,
          onboardingCompleted: session.user.onboardingCompleted,
          emailVerified: session.user.emailVerified,
        });
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
      console.log("createUser event - New user created:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });

      try {
        // Set default values for new users
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            onboardingCompleted: false,
          },
        });
        console.log("createUser event - User updated with defaults:", {
          id: updatedUser.id,
          onboardingCompleted: updatedUser.onboardingCompleted,
        });
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },
    async signIn({ user, account }) {
      console.log(`signIn event - User signed in:`, {
        email: user.email,
        provider: account?.provider,
        userId: user.id,
      });

      // For OAuth providers (Google, GitHub), automatically mark email as verified
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
          console.log("signIn event - Updating OAuth user email verification");
          const updatedUser = await prisma.user.update({
            where: { email: user.email! },
            data: {
              emailVerified: new Date(),
            },
          });
          console.log("signIn event - OAuth user email verified:", {
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
          });
        } catch (error) {
          console.error("Error updating email verification for OAuth user:", error);
        }
      }
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
