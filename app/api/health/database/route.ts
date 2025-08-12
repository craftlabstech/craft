import { NextResponse } from 'next/server'
import { checkDatabaseConnection, checkDatabaseTables } from '@/lib/prisma'

export async function GET() {
    try {
        const connectionCheck = await checkDatabaseConnection()
        const tablesCheck = await checkDatabaseTables()

        const status = {
            database: {
                connected: connectionCheck.healthy,
                tablesExist: tablesCheck.tablesExist,
                error: connectionCheck.error || tablesCheck.error
            },
            timestamp: new Date().toISOString()
        }

        const isHealthy = connectionCheck.healthy && tablesCheck.tablesExist

        return NextResponse.json(status, {
            status: isHealthy ? 200 : 503
        })
    } catch (error) {
        return NextResponse.json(
            {
                database: {
                    connected: false,
                    tablesExist: false,
                    error: 'Health check failed'
                },
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        )
    }
}
