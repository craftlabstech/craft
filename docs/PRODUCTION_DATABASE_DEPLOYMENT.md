# Production Database Deployment Guide

This guide covers how to properly deploy your database to production and handle common deployment issues.

## The Problem

If you see errors like:

```
The table `public.Account` does not exist in the current database.
Database tables do not exist - please run migrations
```

This means your production database doesn't have the required tables.

## Solution

### Step 1: Automatic Database Deployment

Your project is now configured with automatic database deployment:

1. **Build Command Updated**: `vercel.json` now runs database deployment during build
2. **Deploy Script**: `scripts/deploy-db.js` handles schema deployment
3. **Health Checks**: New API endpoint to monitor database status

### Step 2: Manual Database Setup (if needed)

If automatic deployment fails, you can manually run:

```bash
# Connect to your production database
DATABASE_URL="your-production-database-url" npx prisma db push --accept-data-loss
```

**⚠️ Warning**: `--accept-data-loss` will overwrite existing data. Only use on empty databases.

### Step 3: Monitor Database Health

Visit `https://your-app.vercel.app/api/health/database` to check:

- Database connection status
- Table existence
- Error details

Example response:

```json
{
  "database": {
    "connected": true,
    "tablesExist": true,
    "error": null
  },
  "timestamp": "2025-08-12T08:30:00.000Z"
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] Ensure `DATABASE_URL` is set in Vercel environment variables
- [ ] Verify database is accessible from Vercel (not behind VPN/firewall)
- [ ] Test database connection locally with production URL

### Post-Deployment

- [ ] Check `/api/health/database` endpoint
- [ ] Verify authentication works
- [ ] Test user registration/login
- [ ] Monitor Vercel function logs for errors

## Common Issues & Solutions

### Issue: "Connection timeout"

**Solution**: Check if your database allows connections from Vercel's IP ranges.

### Issue: "SSL connection required"

**Solution**: Ensure your `DATABASE_URL` includes `?sslmode=require` for PostgreSQL.

### Issue: "Tables still don't exist after deployment"

**Solution**:

1. Check Vercel build logs for deployment errors
2. Manually run `npx prisma db push` with production URL
3. Contact your database provider for access issues

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# Other variables...
```

## Best Practices

1. **Use `prisma db push` for serverless environments** (like Vercel)
2. **Use `prisma migrate deploy` for traditional servers** with persistent file systems
3. **Always backup before schema changes** in production
4. **Test migrations on staging environment** first
5. **Monitor database health** after deployments

## Troubleshooting

If you continue having issues:

1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Test database connection from your local machine
4. Ensure database accepts connections from Vercel
5. Contact support with specific error messages

## Migration vs Push

- **`prisma migrate`**: For development and traditional servers
- **`prisma db push`**: For serverless/production deployments
- **Current setup**: Uses `db push` for Vercel compatibility
