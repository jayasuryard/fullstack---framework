// PM2 process configuration.
// Replace APP_NAME with your product's name before deploying.
// Usage: pm2 start ecosystem.config.js && pm2 save && pm2 startup
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
    },
    {
      name:           `${APP_NAME}-worker`,
      script:         './worker.js',
      instances:      1,            // fork mode — BLPOP is atomic, single instance is fine
      exec_mode:      'fork',
      watch:          false,
      env_production: { NODE_ENV: 'production' },
      error_file:     './logs/worker-error.log',
      out_file:       './logs/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart:    true,
      restart_delay:  3000,
      max_restarts:   10,
    },
  ],
};
