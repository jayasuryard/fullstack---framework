// Express server for the SPA build.
// Serves static files from dist/ and handles:
//   1. SPA routing fallback (all unknown paths → index.html)
//   2. Per-subdomain OG meta tag injection (optional — see getBranding)
//
// Configure via env vars:
//   PORT                — listening port (default 80)
//   VITE_API_BASE_URL   — backend API base (used to fetch per-subdomain branding)
//   PUBLIC_APP_URL      — canonical app URL (used in OG tags)
//   APP_NAME            — default app name shown in OG tags
//   APP_DESCRIPTION     — default description for OG tags
//   BRANDING_API_PATH   — API path suffix for branding lookup, e.g. /common/tenant/branding/:subdomain
//                         Leave unset to disable per-subdomain branding.

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DIST_DIR = path.join(__dirname, "dist");
const API_BASE = process.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const DEFAULT_BRANDING = {
  name:        process.env.APP_NAME        || "SaaS App",
  description: process.env.APP_DESCRIPTION || "Your SaaS Platform",
};

const brandingCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const indexTemplate = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");

// ── Subdomain detection ───────────────────────────────────────────────────────

function extractSubdomain(hostname) {
  if (!hostname) return null;
  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") return parts[0];
  if (hostname.endsWith(".localhost")) return hostname.replace(".localhost", "");
  return null;
}

// ── Per-subdomain branding (optional) ────────────────────────────────────────
// Only active when BRANDING_API_PATH env var is set.
// The API must return { responseData: { result: { name, description, logo, ogImage } } }

async function getBranding(subdomain, requestHost) {
  const fallbackLogo    = `${requestHost}/logo.png`;
  const fallbackOgImage = `${requestHost}/og-default.png`;
  const fallback        = { ...DEFAULT_BRANDING, logo: fallbackLogo, ogImage: fallbackOgImage };

  const brandingPath = process.env.BRANDING_API_PATH;

  if (!brandingPath || !subdomain) return fallback;

  const cached = brandingCache.get(subdomain);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const url = `${API_BASE}${brandingPath.replace(":subdomain", subdomain)}`;
    const res  = await fetch(url);
    const json = await res.json();
    const result = json?.responseData?.result;

    if (!result) return fallback;

    const branding = {
      name:        result.name        || DEFAULT_BRANDING.name,
      description: result.description || DEFAULT_BRANDING.description,
      logo:        result.logo        || fallbackLogo,
      ogImage:     result.ogImage     || fallbackOgImage,
    };

    brandingCache.set(subdomain, { data: branding, expiresAt: Date.now() + CACHE_TTL_MS });
    return branding;
  } catch (e) {
    console.warn("[server] Branding fetch failed for", subdomain, e.message);
    return fallback;
  }
}

// ── OG meta injection ─────────────────────────────────────────────────────────

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function injectMeta(template, branding, requestUrl) {
  return template
    .replace(/__OG_TITLE__/g,       escapeHtml(branding.name))
    .replace(/__OG_DESCRIPTION__/g, escapeHtml(branding.description))
    .replace(/__OG_IMAGE__/g,       escapeHtml(branding.ogImage || ""))
    .replace(/__OG_URL__/g,         escapeHtml(requestUrl));
}

// ── Express setup ─────────────────────────────────────────────────────────────
// Cache strategy: hashed build assets (/assets/*) are content-addressed →
// immutable 1y. The SPA shell (index.html) must revalidate every load — a cached
// old shell references hashed files the new deploy already pruned (stale-404).

app.use(express.static(DIST_DIR, {
  index:   false,
  maxAge:  "1y",
  immutable: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-cache");
    }
  },
}));

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/{*splat}", async (req, res) => {
  const subdomain  = extractSubdomain(req.hostname);
  const requestHost = `${req.protocol}://${req.get("host")}`;
  const branding   = await getBranding(subdomain, requestHost);
  const requestUrl = `${requestHost}${req.originalUrl}`;

  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-cache"); // SPA shell — revalidate, never stale
  res.send(injectMeta(indexTemplate, branding, requestUrl));
});

const PORT = process.env.PORT || 8080; // 8080 (not 80) so the container can run as non-root
app.listen(PORT, () => console.log(`[server] Listening on :${PORT}`));
