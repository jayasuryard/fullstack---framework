#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Add your product seed scripts here, e.g.:
# node seed/seedConfig.js

echo "Starting worker in background..."
node worker.js &
WORKER_PID=$!

cleanup() {
  echo "Shutting down worker..."
  kill $WORKER_PID 2>/dev/null || true
}

trap cleanup INT TERM

echo "Starting API server..."
exec node server.js
