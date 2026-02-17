import type { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';
import { AppError, ERROR_CODES } from '@/lib/errors/app-error';
import {
  createAuthSessionCookie,
  hasRefreshToken,
  isAccessTokenExpired,
  readAuthSession,
  type SessionCookie,
  withRefreshedToken,
} from '@/server/auth/session';
import { refreshXAccessToken } from '@/server/x/oauth';
import type { XAuthSession } from '@/types/auth';

export type AuthResolution = {
  session: XAuthSession;
  refreshedSessionCookie?: SessionCookie;
};

export const requireAuthSession = async (
  request: NextRequest
): Promise<AuthResolution> => {
  const session = readAuthSession(request);

  if (!session) {
    throw new AppError(ERROR_CODES.AUTH_REQUIRED, 'Authentication required', 401);
  }

  if (!isAccessTokenExpired(session)) {
    return { session };
  }

  if (!hasRefreshToken(session)) {
    throw new AppError(ERROR_CODES.TOKEN_EXPIRED, 'Session expired. Reconnect your X account.', 401);
  }

  const refreshedToken = await refreshXAccessToken(session.token.refreshToken!);
  const refreshedSession = withRefreshedToken(session, refreshedToken);

  return {
    session: refreshedSession,
    refreshedSessionCookie: createAuthSessionCookie(refreshedSession),
  };
};

export const applyRefreshedSessionCookie = (
  response: NextResponse,
  resolution: AuthResolution
): NextResponse => {
  if (resolution.refreshedSessionCookie) {
    const cookie = resolution.refreshedSessionCookie;
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
};
