import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
        errorFormat: 'pretty',
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database health check utility
export async function checkDatabaseConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return { healthy: true, error: null }
    } catch (error) {
        console.error('Database connection failed:', error)
        return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown database error'
        }
    }
}

// Database table existence check
export async function checkDatabaseTables() {
    try {
        // Try to query a basic table to see if schema exists
        await prisma.user.findFirst({ take: 1 })
        return { tablesExist: true, error: null }
    } catch (error: any) {
        if (error.code === 'P2021') {
            console.warn('Database tables do not exist - please run migrations')
            return {
                tablesExist: false,
                error: 'Database tables not found. Please run database migrations.'
            }
        }
        return {
            tablesExist: false,
            error: error.message || 'Unknown database error'
        }
    }
}
