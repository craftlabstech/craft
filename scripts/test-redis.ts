/**
 * Test script for Redis connection (TypeScript version)
 * Run this locally to verify your Redis setup before deploying
 * 
 * Usage: npx tsx scripts/test-redis.ts
 */

import { Redis } from '@upstash/redis';

async function testRedis(): Promise<void> {
    console.log('🔄 Testing Redis connection...\n');

    // Check environment variables
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.error('❌ Missing Redis environment variables:');
        console.error('   UPSTASH_REDIS_REST_URL:', url ? '✅ Set' : '❌ Missing');
        console.error('   UPSTASH_REDIS_REST_TOKEN:', token ? '✅ Set' : '❌ Missing');
        console.error('\n💡 Add these to your .env.local file');
        return;
    }

    try {
        // Initialize Redis client
        const redis = new Redis({ url, token });

        // Test basic connectivity
        console.log('1. Testing basic connectivity...');
        const pingResult = await redis.ping();
        console.log('   ✅ Ping:', pingResult);

        // Test set/get operations
        console.log('\n2. Testing set/get operations...');
        const testKey = 'test:' + Date.now();
        const testValue = { message: 'Hello Redis!', timestamp: new Date().toISOString() };

        await redis.set(testKey, JSON.stringify(testValue));
        console.log('   ✅ Set test data');

        const retrieved = await redis.get(testKey);
        console.log('   ✅ Retrieved:', JSON.parse(retrieved as string));

        // Test expiration
        console.log('\n3. Testing expiration...');
        await redis.setex('temp:test', 5, 'expires in 5 seconds');
        const ttl = await redis.ttl('temp:test');
        console.log('   ✅ TTL for temp key:', ttl, 'seconds');

        // Test rate limiting pattern
        console.log('\n4. Testing rate limiting pattern...');
        const rateLimitKey = 'rate_limit:test_user';
        const windowMs = 60000; // 1 minute

        // Simulate rate limit data
        const rateLimitData = {
            count: 1,
            lastReset: Date.now(),
            windowMs
        };

        await redis.setex(rateLimitKey, Math.ceil(windowMs / 1000), JSON.stringify(rateLimitData));
        const rateLimitResult = await redis.get(rateLimitKey);
        console.log('   ✅ Rate limit data:', JSON.parse(rateLimitResult as string));

        // Cleanup
        console.log('\n5. Cleaning up...');
        await redis.del(testKey);
        await redis.del('temp:test');
        await redis.del(rateLimitKey);
        console.log('   ✅ Cleanup complete');

        console.log('\n🎉 Redis connection test successful!');
        console.log('💡 Your Redis setup is ready for production deployment.');

    } catch (error: any) {
        console.error('\n❌ Redis connection test failed:');
        console.error('Error:', error.message);

        if (error.message.includes('fetch')) {
            console.error('\n💡 This might be a network connectivity issue.');
            console.error('   - Check your internet connection');
            console.error('   - Verify the UPSTASH_REDIS_REST_URL is correct');
        } else if (error.message.includes('auth') || error.message.includes('401')) {
            console.error('\n💡 This looks like an authentication issue.');
            console.error('   - Verify the UPSTASH_REDIS_REST_TOKEN is correct');
            console.error('   - Check if the token has expired');
        } else {
            console.error('\n💡 Check the error message above for more details.');
        }
    }
}

// Run the test
testRedis().catch(console.error);
