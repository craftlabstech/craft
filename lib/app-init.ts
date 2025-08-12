/**
 * Server-side initialization for production services
 * This runs once when the app starts up at runtime (not build time)
 */

import { initializeRateLimit } from '@/lib/rate-limit-init';

let isInitialized = false;

export async function initializeApp() {
    if (isInitialized) return;

    try {
        // Only initialize in runtime, not during build
        if (process.env.NODE_ENV !== undefined) {
            // Initialize rate limiting with Redis for production
            await initializeRateLimit();

            console.log('✅ App services initialized successfully');
        }

        isInitialized = true;
    } catch (error) {
        console.error('❌ Failed to initialize app services:', error);
        // Don't throw - let the app continue with fallbacks
    }
}

// Only auto-initialize in runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== undefined) {
    // This will run when the module is imported at runtime
    initializeApp();
}
