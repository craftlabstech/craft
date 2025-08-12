# Email Verification Flow Implementation

This document outlines the implemented email verification flow when users try to sign in with an unverified email address.

## Overview

When a user attempts to sign in with credentials (email and password) but their email address is not verified, the system now:

1. **Validates credentials first** - Ensures the email and password are correct
2. **Detects unverified email** - Checks if the user's email is verified
3. **Automatically sends verification email** - Triggers a verification email without requiring user action
4. **Redirects to verification page** - Guides the user through the verification process
5. **Provides clear instructions** - Shows the user what to do next

## Implementation Details

### 1. Updated Authentication Flow (`lib/auth.ts`)

The credentials provider now properly throws an `EmailNotVerified` error when a user's email is not verified, which is caught and handled by the signin form.

### 2. Enhanced Signin Form (`app/auth/signin/signin-form.tsx`)

The signin form now:

- Catches the `EmailNotVerified` error during signin
- Automatically calls the trigger-verification API to send a verification email
- Redirects the user to the verification page with appropriate messaging
- Provides clear error messages

### 3. New API Endpoint (`app/api/auth/trigger-verification/route.ts`)

A new API endpoint that:

- Validates the user's credentials before sending verification email
- Ensures security by not sending emails to invalid email/password combinations
- Creates a new verification token
- Sends the verification email
- Returns success/error status

### 4. Enhanced Verification Page (`app/auth/verify-request/`)

The verification page now:

- Detects when arriving from the signin flow
- Shows contextual messaging based on the trigger source
- Provides helpful tips for completing the verification process
- Includes a "resend verification email" option

### 5. Error Handling

Comprehensive error handling for:

- Failed email sending
- Invalid credentials
- Already verified emails
- Network errors

## User Flow

1. **User enters credentials** on signin page
2. **System validates** email and password
3. **If email not verified:**
   - System automatically sends verification email
   - User is redirected to verification page
   - Clear instructions are provided
4. **User clicks verification link** in email
5. **Email is verified** and user is redirected back to signin
6. **User can now sign in** successfully

## API Endpoints

### `/api/auth/trigger-verification` (POST)

- **Purpose**: Send verification email during signin flow
- **Body**: `{ email: string, password: string }`
- **Security**: Validates credentials before sending email
- **Response**: Success/error status

### `/api/auth/resend-verification` (POST)

- **Purpose**: Resend verification email from verification page
- **Body**: `{ email: string }`
- **Usage**: When user needs to resend the verification email

### `/api/auth/verify-email` (GET)

- **Purpose**: Verify email address using token
- **Query**: `token` and `email` parameters
- **Action**: Updates user emailVerified status

## Security Considerations

- Verification emails are only sent after validating user credentials
- Tokens expire after 24 hours
- One-time use tokens (deleted after verification)
- Rate limiting through existing API error handlers

## User Experience Improvements

- **Automatic email sending**: No need for user to manually request verification
- **Contextual messaging**: Different messages based on how user arrived at verification page
- **Clear instructions**: Step-by-step guidance for completing verification
- **Error recovery**: Options to resend emails if delivery fails
- **Seamless flow**: User returns to signin after verification

## Testing the Flow

To test the email verification flow:

1. Create a user account with an unverified email
2. Attempt to sign in with correct credentials
3. Verify that:
   - Verification email is automatically sent
   - User is redirected to verification page
   - Appropriate messaging is displayed
   - User can resend verification email if needed
   - After email verification, user can sign in successfully

## Files Modified

- `lib/auth.ts` - Enhanced error handling for unverified emails
- `app/auth/signin/signin-form.tsx` - Added automatic verification email trigger
- `app/auth/verify-request/verify-request-content.tsx` - Enhanced messaging and UX
- `app/api/auth/trigger-verification/route.ts` - New API endpoint (created)

## Benefits

- **Improved UX**: Users don't need to figure out how to get verification emails
- **Security**: Credentials are validated before sending emails
- **Clarity**: Clear messaging about what the user needs to do
- **Reliability**: Automatic retry and error handling mechanisms
- **Seamless**: Minimal friction in the verification process
