#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Add your product seed scripts here, e.g.:
# node seed/seedConfig.js

# Both the API and worker apps run under pm2-runtime as this container's single
# foreground process (PID 1). This replaces the old "background worker, trap,
# exec server.js" pattern (F10): that pattern lost its own trap the instant
# `exec` replaced the shell's process image, so a SIGTERM from `docker stop`
# never reached the backgrounded worker, and nothing restarted the worker if
# it crashed on its own — the API could stay "healthy" while jobs silently
# stopped. pm2-runtime forwards SIGTERM/SIGINT to every app it manages and
# waits (per app kill_timeout, see ecosystem.config.js) for a clean exit, and
# its own supervision (autorestart/max_restarts/min_uptime) restarts a
# crashed worker without needing the whole container to restart.
echo "Starting API + worker under pm2-runtime..."
# `exec` the local binary directly, NOT `npx pm2-runtime` — npx spawns
# pm2-runtime as a child of itself rather than exec'ing into it, so a
# SIGTERM delivered to npx (PID 1) never reaches pm2-runtime and its managed
# apps get no chance to drain. Calling the binary straight out of
# node_modules/.bin keeps pm2-runtime as PID 1, where it can catch and
# forward the signal itself.
exec ./node_modules/.bin/pm2-runtime start ecosystem.config.js --env production
