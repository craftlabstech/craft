-- Test script to check onboarding status for OAuth users
-- Run this in your database to see current user states

SELECT 
    id,
    email,
    name,
    "emailVerified",
    "onboardingCompleted",
    "createdAt",
    "updatedAt"
FROM "User"
WHERE email IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check accounts table to see OAuth connections
SELECT 
    u.email,
    u."onboardingCompleted",
    u."emailVerified",
    a.provider,
    a."providerAccountId",
    a."createdAt"
FROM "User" u
JOIN "Account" a ON u.id = a."userId"
WHERE a.provider IN ('google', 'github')
ORDER BY a."createdAt" DESC
LIMIT 10;
