import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import AppleStrategy from 'passport-apple';
import { config } from './index.js';
import * as oauthService from '../services/oauthService.js';

export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'G',
    color: '#4285F4',
    enabled: !!(config.oauth.google.clientId && config.oauth.google.clientSecret),
    strategy: GoogleStrategy,
    scope: ['profile', 'email'],
    options: {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: `${config.oauth.baseCallbackUrl}/google/callback`,
    },
  },
  facebook: {
    name: 'Facebook',
    icon: 'F',
    color: '#1877F2',
    enabled: !!(config.oauth.facebook.clientId && config.oauth.facebook.clientSecret),
    strategy: FacebookStrategy,
    scope: ['email'],
    options: {
      clientID: config.oauth.facebook.clientId,
      clientSecret: config.oauth.facebook.clientSecret,
      callbackURL: `${config.oauth.baseCallbackUrl}/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'photos'],
    },
  },
  apple: {
    name: 'Apple',
    icon: 'A',
    color: '#000000',
    enabled: !!(config.oauth.apple.clientId && config.oauth.apple.teamId && config.oauth.apple.keyId && config.oauth.apple.privateKey),
    strategy: AppleStrategy,
    scope: ['name', 'email'],
    options: {
      clientID: config.oauth.apple.clientId,
      teamID: config.oauth.apple.teamId,
      keyID: config.oauth.apple.keyId,
      privateKeyLocation: config.oauth.apple.privateKey,
      callbackURL: `${config.oauth.baseCallbackUrl}/apple/callback`,
    },
  },
  microsoft: {
    name: 'Microsoft',
    icon: 'M',
    color: '#00A4EF',
    enabled: !!(config.oauth.microsoft.clientId && config.oauth.microsoft.clientSecret && config.oauth.microsoft.tenant),
    strategy: MicrosoftStrategy,
    scope: ['user.read', 'openid', 'email', 'profile'],
    options: {
      clientID: config.oauth.microsoft.clientId,
      clientSecret: config.oauth.microsoft.clientSecret,
      tenant: config.oauth.microsoft.tenant,
      callbackURL: `${config.oauth.baseCallbackUrl}/microsoft/callback`,
    },
  },
  twitter: {
    name: 'X',
    icon: 'X',
    color: '#000000',
    enabled: !!(config.oauth.twitter.consumerKey && config.oauth.twitter.consumerSecret),
    strategy: TwitterStrategy,
    scope: ['email'],
    options: {
      consumerKey: config.oauth.twitter.consumerKey,
      consumerSecret: config.oauth.twitter.consumerSecret,
      callbackURL: `${config.oauth.baseCallbackUrl}/twitter/callback`,
      includeEmail: true,
    },
  },
};

export function configurePassport() {
  for (const [key, provider] of Object.entries(OAUTH_PROVIDERS)) {
    if (!provider.enabled) continue;

    passport.use(
      key,
      new provider.strategy(
        provider.options,
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await oauthService.findOrCreateUser(key, profile);
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const { default: prisma } = await import('./database.js');
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  return passport;
}

export function getEnabledProviders() {
  return Object.entries(OAUTH_PROVIDERS)
    .filter(([_, p]) => p.enabled)
    .map(([key, p]) => ({ key, name: p.name, icon: p.icon, color: p.color }));
}
