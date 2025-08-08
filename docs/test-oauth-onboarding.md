# OAuth Onboarding Test Plan

## Testing Google & GitHub OAuth with Onboarding

### What Should Happen:

1. User clicks "Continue with Google" or "Continue with GitHub" on signin/signup page
2. User completes OAuth flow with provider
3. User is redirected back to the app
4. NextAuth creates user account with:
   - `emailVerified` set to current timestamp (automatic for OAuth)
   - `onboardingCompleted` set to false (default)
5. HomeLayout detects user is authenticated but hasn't completed onboarding
6. User is redirected to `/onboarding`
7. User completes onboarding form
8. API updates user with onboarding data and sets `onboardingCompleted` to true
9. User is redirected to home page

### Key Changes Made:

#### 1. HomeLayout.tsx

- Improved logic to handle OAuth users properly
- Now checks for emailVerified being a Date object (OAuth) or truthy value (credentials)

#### 2. lib/auth.ts

- Enhanced JWT callback to better handle new users
- Improved session callback with fallback values
- OAuth users get emailVerified automatically set in signIn event

#### 3. middleware.ts

- Added API routes exclusion for email verification redirect
- Better comments about OAuth user handling

#### 4. app/onboarding/page.tsx

- Added email verification check before allowing onboarding
- More detailed logging for debugging

### Environment Variables Required:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Testing Steps:

1. Ensure OAuth apps are configured with correct redirect URIs
2. Set environment variables
3. Test Google OAuth signup → onboarding → completion
4. Test GitHub OAuth signup → onboarding → completion
5. Test subsequent logins (should skip onboarding)

### Debug Logs to Check:

- "HomeLayout - Session data:" - shows user state
- "Onboarding - Session data:" - shows onboarding page state
- "User signed in: {email} via {provider}" - confirms OAuth login
- JWT callback logs for token updates
