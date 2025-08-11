# Craft.js Authentication Setup

> **Note**: This documentation references onboarding functionality that has been removed from the current implementation. The onboarding flow and related features are no longer active.

This guide will help you set up the improved authentication system with PostgreSQL, Prisma, NextAuth v4, and Resend.

## Prerequisites

1. PostgreSQL database (local or cloud)
2. Google OAuth app credentials
3. GitHub OAuth app credentials
4. Resend account for email delivery

## Setup Steps

### 1. Database Setup

```bash
# Create a PostgreSQL database
createdb craftjs

# Or use a cloud service like Neon, Supabase, or Railway
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

### 4. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth app
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 5. Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Add your domain (or use resend.dev for testing)
4. Set the API key in your environment variables

### 6. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 7. Start the Application

```bash
npm run dev
```

## Features

### Authentication Methods

- **Google OAuth**: One-click sign in with Google
- **GitHub OAuth**: One-click sign in with GitHub
- **Email + Magic Link**: Magic link sent via Resend

### User Flow

1. **Sign Up**: Choose authentication method
2. **Onboarding**: Complete profile (bio, occupation, company)
3. **Dashboard**: Access protected content

### Pages

- `/auth/signin` - Sign in page with multiple options
- `/auth/signup` - Sign up page with multiple options
- `/auth/verify-request` - Email verification waiting page
- `/onboarding` - Complete profile setup
- `/` - Home page (protected if not onboarded)

## Database Schema

The Prisma schema includes:

- **User**: Core user information with onboarding fields
- **Account**: OAuth account connections
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

## Security Features

- Session-based authentication
- CSRF protection
- Secure HTTP-only cookies
- Email verification
- Protected routes with middleware
- Onboarding requirement for new users
