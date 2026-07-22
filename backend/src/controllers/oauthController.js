import passport from 'passport';
import { OAUTH_PROVIDERS, getEnabledProviders } from '../config/passport.js';
import { sendSuccess } from '../utils/response.js';

export function initiateOAuth(req, res, next) {
  const { provider } = req.params;
  const providerConfig = OAUTH_PROVIDERS[provider];

  if (!providerConfig || !providerConfig.enabled) {
    return res.status(400).json({ success: false, message: `OAuth provider "${provider}" is not configured` });
  }

  const authenticator = passport.authenticate(provider, {
    scope: providerConfig.scope,
    session: false,
  });

  authenticator(req, res, next);
}

export function handleOAuthCallback(req, res, next) {
  const { provider } = req.params;
  const providerConfig = OAUTH_PROVIDERS[provider];

  if (!providerConfig || !providerConfig.enabled) {
    return res.status(400).json({ success: false, message: `OAuth provider "${provider}" is not configured` });
  }

  passport.authenticate(provider, { session: false, failWithError: true }, (err, user, info) => {
    if (err || !user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorMessage = err?.message || 'Authentication failed';
      return res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent(errorMessage)}`);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/oauth/callback?token=${user.accessToken}&refreshToken=${user.refreshToken}`;

    res.redirect(redirectUrl);
  })(req, res, next);
}

export function listProviders(req, res, next) {
  try {
    const providers = getEnabledProviders();
    sendSuccess(res, { providers });
  } catch (error) {
    next(error);
  }
}
