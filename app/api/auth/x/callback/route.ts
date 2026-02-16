import { NextResponse, type NextRequest } from 'next/server';
import { clearAuthSessionCookie, clearOauthTransientCookie, createAuthSessionCookie, readOauthTransient } from '@/server/auth/session';
import { exchangeXCodeForToken, fetchAuthenticatedXUser } from '@/server/x/oauth';

export const dynamic = 'force-dynamic';

const redirectToHome = (search: string) => {
  const target = new URL('/', process.env.APP_URL ?? 'http://localhost:3000');

  if (search) {
    const pairs = new URLSearchParams(search);
    for (const [key, value] of pairs.entries()) {
      target.searchParams.set(key, value);
    }
  }

  return target;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    return NextResponse.redirect(redirectToHome(`auth=failed&reason=${oauthError}`));
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const transient = readOauthTransient(request);

  if (!code || !state || !transient || transient.state !== state) {
    const response = NextResponse.redirect(redirectToHome('auth=failed&reason=invalid_state'));
    const clearTransient = clearOauthTransientCookie();
    response.cookies.set(clearTransient.name, clearTransient.value, clearTransient.options);
    return response;
  }

  try {
    const token = await exchangeXCodeForToken({ code, codeVerifier: transient.codeVerifier });
    const user = await fetchAuthenticatedXUser(token.accessToken);

    const response = NextResponse.redirect(redirectToHome('auth=connected'));
    const sessionCookie = createAuthSessionCookie({ userId: user.id, token });
    const clearTransient = clearOauthTransientCookie();

    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    response.cookies.set(clearTransient.name, clearTransient.value, clearTransient.options);

    return response;
  } catch {
    const response = NextResponse.redirect(redirectToHome('auth=failed&reason=token_exchange'));
    const clearSession = clearAuthSessionCookie();
    const clearTransient = clearOauthTransientCookie();

    response.cookies.set(clearSession.name, clearSession.value, clearSession.options);
    response.cookies.set(clearTransient.name, clearTransient.value, clearTransient.options);

    return response;
  }
}