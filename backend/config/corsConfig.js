// Single source of truth for the allowed frontend origins. Used by the CORS
// middleware (server.js) and by the WS hub's Origin check (helpers/ws/hub.js)
// so the two never drift apart.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);

module.exports = { allowedOrigins };
