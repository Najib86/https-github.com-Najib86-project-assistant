#!/bin/bash

# Helper script to restart the dev server cleanly

echo "🛑 Stopping any running Next.js dev servers..."

# Find and kill node processes using port 3000 or 3001
if command -v lsof &> /dev/null; then
    # Unix/Mac
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
elif command -v netstat &> /dev/null; then
    # Windows (Git Bash)
    for port in 3000 3001; do
        pid=$(netstat -ano | grep ":$port" | awk '{print $5}' | head -1)
        if [ ! -z "$pid" ]; then
            taskkill //F //PID $pid 2>/dev/null || true
        fi
    done
fi

echo "✅ Stopped dev servers"
echo ""
echo "🔄 Regenerating Prisma client..."
npx prisma generate

echo ""
echo "🚀 Starting dev server..."
npm run dev
