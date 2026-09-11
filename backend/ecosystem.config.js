// PM2 process configuration.
// Replace APP_NAME with your product's name before deploying.
// Two ways this runs, both supervising the SAME two apps:
//  - Bare VPS: `pm2 start ecosystem.config.js --env production && pm2 save && pm2 startup`
//  - Docker (see start.sh/dockerfile): `pm2-runtime start ecosystem.config.js --env production`
//    as the container's single foreground process (PID 1) — pm2-runtime forwards
//    SIGTERM/SIGINT to every managed app and waits (up to kill_timeout) for a clean
//    exit, which a plain background-then-exec shell script cannot do (the shell's
//    own trap is discarded the moment `exec` replaces its process image — see F10).
const APP_NAME = 'my-app';  // ← change this

module.exports = {
  apps: [
    {
      name:           `${APP_NAME}-api`,
      script:         './server.js',
      instances:      'max',        // cluster mode — one per CPU core
      exec_mode:      'cluster',
      watch:          false,
      env_production: { NODE_ENV: 'production' },
      error_file:     './logs/api-error.log',
      out_file:       './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_restarts:   15,
      min_uptime:     '10s',        // a restart inside this window counts toward max_restarts (crash-loop guard)
      kill_timeout:   10000,        // matches server.js's own 10s drain-timeout force-exit
    },
    {
      name:           `${APP_NAME}-worker`,
      script:         './worker.js',
      instances:      1,            // fork mode — BLMOVE claim is atomic, single instance is fine
      exec_mode:      'fork',
      watch:          false,
      env_production: { NODE_ENV: 'production' },
      error_file:     './logs/worker-error.log',
      out_file:       './logs/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart:    true,
      restart_delay:  3000,
      max_restarts:   10,
      min_uptime:     '10s',        // crash-loop guard — see api entry above
      kill_timeout:   27000,        // worker.js's own drain deadline (25s) + headroom to exit cleanly before PM2 SIGKILLs it
    },
  ],
};
