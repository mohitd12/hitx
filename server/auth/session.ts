import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, OAUTH_TRANSIENT_COOKIE_NAME } from '@/lib/constants/app';
import { env } from '@/lib/env';
import { createSignedToken, verifySignedToken } from '@/server/auth/crypto';
import type { XAuthSession } from '@/types/auth';

type AuthSessionPayload = {
  v: 1;
  userId: string;
  token: XAuthSession['token'];
};

type OauthTransientPayload = {
  v: 1;
  state: string;
  codeVerifier: string;
  createdAt: number;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const TRANSIENT_MAX_AGE_SECONDS = 60 * 10;
const TOKEN_EXPIRY_SKEW_MS = 60 * 1000;

const baseCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const createAuthSessionCookie = (session: XAuthSession) => {
  const payload: AuthSessionPayload = {
    v: 1,
    userId: session.userId,
    token: session.token,
  };

  const value = createSignedToken(JSON.stringify(payload), env.sessionSecret);

  return {
    name: AUTH_COOKIE_NAME,
    value,
    options: {
      ...baseCookie,
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  };
};

export type SessionCookie = ReturnType<typeof createAuthSessionCookie>;

export const readAuthSession = (request: NextRequest): XAuthSession | null => {
  const raw = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const verified = verifySignedToken(raw, env.sessionSecret);

  if (!verified) {
    return null;
  }

  try {
    const parsed = JSON.parse(verified) as AuthSessionPayload;

    if (parsed.v !== 1 || !parsed.userId || !parsed.token?.accessToken) {
      return null;
    }

    return {
      userId: parsed.userId,
      token: parsed.token,
    };
  } catch {
    return null;
  }
};

export const hasRefreshToken = (session: XAuthSession): boolean =>
  Boolean(session.token.refreshToken);

export const isAccessTokenExpired = (
  session: XAuthSession,
  skewMs = TOKEN_EXPIRY_SKEW_MS
): boolean => Date.now() >= session.token.expiresAt - skewMs;

export const withRefreshedToken = (
  session: XAuthSession,
  token: XAuthSession['token']
): XAuthSession => ({
  ...session,
  token: {
    ...token,
    // Preserve existing refresh token when provider omits it on refresh.
    refreshToken: token.refreshToken ?? session.token.refreshToken,
  },
});

export const clearAuthSessionCookie = () => ({
  name: AUTH_COOKIE_NAME,
  value: '',
  options: {
    ...baseCookie,
    maxAge: 0,
  },
});

export const createOauthTransientCookie = (payload: {
  state: string;
  codeVerifier: string;
}) => {
  const value = createSignedToken(
    JSON.stringify({
      v: 1,
      state: payload.state,
      codeVerifier: payload.codeVerifier,
      createdAt: Date.now(),
    } satisfies OauthTransientPayload),
    env.sessionSecret
  );

  return {
    name: OAUTH_TRANSIENT_COOKIE_NAME,
    value,
    options: {
      ...baseCookie,
      maxAge: TRANSIENT_MAX_AGE_SECONDS,
    },
  };
};

export const readOauthTransient = (
  request: NextRequest
): OauthTransientPayload | null => {
  const raw = request.cookies.get(OAUTH_TRANSIENT_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const verified = verifySignedToken(raw, env.sessionSecret);

  if (!verified) {
    return null;
  }

  try {
    const parsed = JSON.parse(verified) as OauthTransientPayload;

    if (parsed.v !== 1 || !parsed.state || !parsed.codeVerifier) {
      return null;
    }

    if (Date.now() - parsed.createdAt > TRANSIENT_MAX_AGE_SECONDS * 1000) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearOauthTransientCookie = () => ({
  name: OAUTH_TRANSIENT_COOKIE_NAME,
  value: '',
  options: {
    ...baseCookie,
    maxAge: 0,
  },
});
