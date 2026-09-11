// Branding bootstrap. On the Express server (frontend/server.js) the __OG_*__
// placeholders in index.html are replaced per-subdomain before this script runs —
// it becomes a no-op. On static hosts (frontend/nginx.conf) the raw placeholders
// reach the browser; this script applies the default title and swaps the favicon
// for the product OG image. No flash: runs before React mounts. Multi-tenant
// API-driven branding lives in server.js (getBranding, wired via BRANDING_API_PATH
// env).
//
// Externalized out of index.html (rather than inline) so the page's CSP can use a
// strict script-src 'self' with no 'unsafe-inline' (F11).
(function () {
  var title = document.title;
  if (title.indexOf('__OG_TITLE__') !== -1) {
    document.title = 'SaaS App';
  }
  var favicon = document.getElementById('dynamic-favicon');
  var ogImage = document.querySelector('meta[property="og:image"]');
  if (favicon && ogImage && ogImage.content && ogImage.content.indexOf('__OG_IMAGE__') === -1) {
    favicon.href = ogImage.content;
  }
})();
