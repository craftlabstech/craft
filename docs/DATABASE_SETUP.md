# Database Setup Guide

## Quick Setup

### Option 1: Local PostgreSQL Database

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create the database**:

   ```sql
   CREATE DATABASE craftjs;
   ```

3. **Update your .env.local file** (create if it doesn't exist):

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/craftjs"
   NEXTAUTH_SECRET="your-random-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

### Option 2: Neon (Cloud Database)

1. **Sign up at** https://neon.tech
2. **Create a new project**
3. **Copy the database URL** from your Neon dashboard
4. **Update your .env.local file**:
   ```env
   DATABASE_URL="your-neon-database-url-here"
   NEXTAUTH_SECRET="your-random-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```
5. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

### Option 3: Prisma Cloud (Recommended for Development)

1. **Login to Prisma**:

   ```bash
   npx prisma login
   ```

2. **Create a new database**:

   ```bash
   npx prisma postgres create --name craftjs-dev --region us-east-1
   ```

3. **Update your .env.local file** with the provided connection string

4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

## Environment Variables

Create a `.env.local` file in your project root with:

```env
# Database
DATABASE_URL="your-database-url-here"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional for development)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (optional for development)
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
```

## Database Commands

- **Generate Prisma Client**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`
- **Open Prisma Studio**: `npm run db:studio`
- **Push schema changes**: `npm run db:push`
- **Reset database**: `npm run db:reset`

## Troubleshooting

- **"Database not exist" error**: Run `npm run db:migrate` to create tables
- **"Connection refused" error**: Make sure PostgreSQL is running
- **Permission errors**: Check your database credentials
- **"Schema out of sync" error**: Run `npm run db:reset` (⚠️ This will delete all data)
