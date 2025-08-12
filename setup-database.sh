#!/bin/bash

# Database setup script for craftjs-dev
echo "Setting up database for craftjs-dev..."

# Check if Docker is running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "Docker is available. Setting up PostgreSQL container..."
    
    # Stop and remove existing container if it exists
    docker stop craftjs-postgres 2>/dev/null || true
    docker rm craftjs-postgres 2>/dev/null || true
    
    # Start PostgreSQL container
    echo "Starting PostgreSQL container..."
    docker run --name craftjs-postgres \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_DB=craftjs \
        -p 5432:5432 \
        -d postgres:15
    
    echo "Waiting for PostgreSQL to start..."
    sleep 5
    
    # Test connection
    if docker exec craftjs-postgres pg_isready -U postgres; then
        echo "✅ PostgreSQL is ready!"
        echo "Database URL: postgresql://postgres:password@localhost:5432/craftjs"
    else
        echo "❌ Failed to start PostgreSQL"
        exit 1
    fi
else
    echo "Docker is not available. Please install Docker or set up PostgreSQL manually."
    echo ""
    echo "Alternative options:"
    echo "1. Install Docker Desktop and run this script again"
    echo "2. Install PostgreSQL locally"
    echo "3. Use a cloud database (Neon, Supabase, etc.)"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Update your .env.local file with the database URL"
echo "2. Run: npm run db:migrate"
echo "3. Run: npm run db:generate"
