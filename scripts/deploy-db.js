#!/usr/bin/env node

/**
 * Production Database Deployment Script
 * 
 * This script safely handles database schema updates for production deployments.
 * It automatically detects if this is an initial setup or an update to existing data.
 */

const { execSync } = require('child_process');

async function checkTablesExist() {
    try {
        // Try to query the User table to see if schema exists
        const result = execSync('npx prisma db execute --stdin', {
            input: 'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'User\' AND table_schema = \'public\';',
            encoding: 'utf8',
            stdio: 'pipe'
        });

        // If the query succeeds and returns a count > 0, tables exist
        return result.includes('1') || result.includes('(1 row)');
    } catch (error) {
        // If query fails, assume tables don't exist
        return false;
    }
}

async function deployDatabase() {
    console.log('🔄 Starting database deployment...');

    try {
        // Generate Prisma client first
        console.log('📦 Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit' });

        // Check if tables already exist
        console.log('🔍 Checking database state...');
        const tablesExist = await checkTablesExist();

        if (tablesExist) {
            console.log('📊 Existing database detected - performing safe schema update...');
            console.log('ℹ️  This will NOT remove existing data');

            try {
                // Use safe push without --accept-data-loss
                execSync('npx prisma db push', { stdio: 'inherit' });
                console.log('✅ Schema updated successfully with existing data preserved!');
            } catch (pushError) {
                console.error('⚠️  Safe schema update failed. This might require manual intervention.');
                console.error('💡 Possible reasons:');
                console.error('   - Column type changes that require data transformation');
                console.error('   - Constraints that conflict with existing data');
                console.error('   - Column deletions that would cause data loss');
                console.error('\n🔧 To resolve manually:');
                console.error('   1. Review the schema changes in prisma/schema.prisma');
                console.error('   2. Create a custom migration if needed');
                console.error('   3. Or run: npx prisma db push --accept-data-loss (⚠️ DATA LOSS RISK)');
                throw pushError;
            }
        } else {
            console.log('🆕 Empty database detected - initializing schema...');
            console.log('ℹ️  Using --accept-data-loss for initial setup (safe since no data exists)');
            execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
            console.log('✅ Database schema initialized successfully!');
        }

    } catch (error) {
        console.error('❌ Database deployment failed:', error.message);
        process.exit(1);
    }
}

deployDatabase();
