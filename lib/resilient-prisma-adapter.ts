import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Wraps the PrismaAdapter to handle database errors gracefully
 * Specifically handles cases where database tables don't exist yet
 * 
 * Note: This file uses 'any' types that are required by NextAuth's adapter interface
 * eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function createResilientPrismaAdapter(prisma: PrismaClient): Adapter {
    const baseAdapter = PrismaAdapter(prisma);

    // Helper function to handle database errors
    const handleDatabaseError = (error: unknown, operation: string) => {
        console.error(`Database error in ${operation}:`, error);

        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P1001':
                    console.warn('Database connection failed - database may not be running');
                    break;
                case 'P2021':
                    console.warn('Database tables do not exist - please run migrations');
                    break;
                default:
                    console.warn(`Database error ${error.code}: ${error.message}`);
                    break;
            }
        } else if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
            console.warn('Database tables do not exist - please run migrations');
        } else {
            console.warn(`Unknown database error in ${operation}:`, error);
        }

        return null;
    };

    // Wrap adapter methods that might fail due to missing database
    const wrappedAdapter: Adapter = {
        ...baseAdapter,

        async getUserByEmail(email: string) {
            try {
                return await baseAdapter.getUserByEmail!(email);
            } catch (error) {
                return handleDatabaseError(error, 'getUserByEmail');
            }
        },

        async getUserByAccount(account: { provider: string; providerAccountId: string }) {
            try {
                return await baseAdapter.getUserByAccount!(account);
            } catch (error) {
                return handleDatabaseError(error, 'getUserByAccount');
            }
        },

        async getUser(id: string) {
            try {
                return await baseAdapter.getUser!(id);
            } catch (error) {
                return handleDatabaseError(error, 'getUser');
            }
        },

        async createUser(user: any) {
            try {
                return await baseAdapter.createUser!(user);
            } catch (error) {
                handleDatabaseError(error, 'createUser');
                // For critical operations, we need to throw but with a user-friendly message
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
        },

        async linkAccount(account: any) {
            try {
                await baseAdapter.linkAccount!(account);
            } catch (error) {
                handleDatabaseError(error, 'linkAccount');
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
        },

        async createSession(session: any) {
            try {
                return await baseAdapter.createSession!(session);
            } catch (error) {
                handleDatabaseError(error, 'createSession');
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
        },

        async getSessionAndUser(sessionToken: string) {
            try {
                return await baseAdapter.getSessionAndUser!(sessionToken);
            } catch (error) {
                return handleDatabaseError(error, 'getSessionAndUser');
            }
        },

        async updateUser(user: any) {
            try {
                return await baseAdapter.updateUser!(user);
            } catch (error) {
                handleDatabaseError(error, 'updateUser');
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
        },

        async updateSession(session: any) {
            try {
                return await baseAdapter.updateSession!(session);
            } catch (error) {
                handleDatabaseError(error, 'updateSession');
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
        },

        async deleteSession(sessionToken: string) {
            try {
                await baseAdapter.deleteSession!(sessionToken);
            } catch (error) {
                handleDatabaseError(error, 'deleteSession');
                // Don't throw for delete operations
            }
        },

        async createVerificationToken(verificationToken: any) {
            try {
                return await baseAdapter.createVerificationToken!(verificationToken);
            } catch (error) {
                handleDatabaseError(error, 'createVerificationToken');
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
        },

        async useVerificationToken(identifier_token: any) {
            try {
                return await baseAdapter.useVerificationToken!(identifier_token);
            } catch (error) {
                return handleDatabaseError(error, 'useVerificationToken');
            }
        }
    };

    return wrappedAdapter;
}
