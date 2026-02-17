import { NextResponse, type NextRequest } from 'next/server';
import { AppError, ERROR_CODES } from '@/lib/errors/app-error';
import { toAppError } from '@/lib/result';
import { applyRefreshedSessionCookie, requireAuthSession } from '@/server/auth/guards';
import { clearAuthSessionCookie } from '@/server/auth/session';
import { fetchXPostsByUser, fetchXProfile } from '@/server/x/posts-client';
import type { PostsApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

const json = (payload: PostsApiResponse, status = 200): NextResponse<PostsApiResponse> =>
  NextResponse.json(payload, { status });

const normalizeError = (error: unknown): AppError => {
  const appError = toAppError(error);

  if (appError.code === ERROR_CODES.TOKEN_EXPIRED) {
    return new AppError(
      ERROR_CODES.AUTH_REQUIRED,
      'Your session expired. Reconnect your X account.',
      401,
      appError.cause
    );
  }

  return appError;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthSession(request);

    const profile = await fetchXProfile(auth.session.token.accessToken);
    const posts = await fetchXPostsByUser({
      accessToken: auth.session.token.accessToken,
      userId: profile.id,
      username: profile.username,
    });

    const payload: PostsApiResponse = {
      status: posts.length === 0 ? 'empty' : 'ready',
      profile,
      posts,
      error: null,
    };

    const response = json(payload);
    return applyRefreshedSessionCookie(response, auth);
  } catch (error) {
    const appError = normalizeError(error);

    if (appError.code === ERROR_CODES.AUTH_REQUIRED || appError.code === ERROR_CODES.TOKEN_REVOKED) {
      const response = json(
        {
          status: 'not_connected',
          profile: null,
          posts: [],
          error: {
            code: appError.code,
            message: appError.message,
            status: 401,
          },
        },
        401
      );

      // Ensure stale/invalid sessions are removed so UI and backend recover consistently.
      const cleared = clearAuthSessionCookie();
      response.cookies.set(cleared.name, cleared.value, cleared.options);
      return response;
    }

    return json(
      {
        status: 'error',
        profile: null,
        posts: [],
        error: {
          code: appError.code,
          message: appError.message,
          status: appError.status,
          retryAt:
            appError.code === ERROR_CODES.RATE_LIMITED &&
            typeof appError.cause === 'object' &&
            appError.cause &&
            'resetAt' in appError.cause &&
            typeof (appError.cause as { resetAt?: unknown }).resetAt === 'number'
              ? ((appError.cause as { resetAt: number }).resetAt as number)
              : undefined,
        },
      },
      appError.status >= 400 ? appError.status : 500
    );
  }
}
