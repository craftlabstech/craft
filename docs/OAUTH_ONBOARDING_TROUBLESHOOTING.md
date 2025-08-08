## OAuth Onboarding Troubleshooting Guide

### Issue: New Google/GitHub users not seeing onboarding flow

### Most Likely Causes:

1. **User Already Exists with Completed Onboarding**
   - You previously signed in with this Google/GitHub account
   - The user record has `onboardingCompleted: true`
   - Solution: Reset onboarding status or test with different account

2. **Environment Variables Missing**
   - Check if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - Check if OAuth apps are configured correctly
   - Verify redirect URIs match

3. **Race Condition in JWT Callback**
   - JWT callback might run before database events complete
   - Added delay for OAuth users in JWT callback

### Testing Steps:

1. **Check Current User Status**
   - Visit: http://localhost:3001/debug
   - Sign in and click "Check Database Status"
   - Look for `onboardingCompleted` value

2. **Reset Onboarding (if needed)**
   - On debug page, click "Reset Onboarding Status"
   - This sets `onboardingCompleted: false`
   - Try the flow again

3. **Test with Fresh Account**
   - Use a different Google/GitHub account
   - Or delete the user record from database
   - Test the complete flow

4. **Check Console Logs**
   - Open browser dev tools
   - Look for "HomeLayout - Detailed session data"
   - Look for "JWT callback" and "Session callback" logs

### Expected Log Flow for New OAuth User:

```
createUser event - New user created: {id: "...", email: "..."}
createUser event - User updated with defaults: {onboardingCompleted: false}
signIn event - User signed in: {provider: "google"}
signIn event - OAuth user email verified: {emailVerified: "2025-08-08..."}
JWT callback - Input: {hasUser: true, trigger: undefined}
JWT callback - New OAuth user detected, waiting for database setup
JWT callback - Database user data: {onboardingCompleted: false, emailVerified: "2025-08-08..."}
HomeLayout - Detailed session data: {onboardingCompleted: false, emailVerified: "2025-08-08..."}
HomeLayout - Redirect decision: {shouldRedirectToOnboarding: true}
HomeLayout - Redirecting to onboarding
```

### If Logs Show Different Values:

- `onboardingCompleted: true` → User already completed onboarding
- `emailVerified: null` → OAuth sign-in event didn't run properly
- No JWT/session logs → Authentication didn't complete

### Quick Fix Command:

If you have database access, run this to reset all OAuth users:

```sql
UPDATE "User"
SET "onboardingCompleted" = false,
    "bio" = null,
    "occupation" = null,
    "company" = null
WHERE id IN (
    SELECT DISTINCT "userId"
    FROM "Account"
    WHERE provider IN ('google', 'github')
);
```
