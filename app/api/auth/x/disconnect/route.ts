import { NextResponse } from 'next/server';
import { clearAuthSessionCookie, clearOauthTransientCookie } from '@/server/auth/session';

export const dynamic = 'force-dynamic';

const clearCookies = (response: NextResponse) => {
  const authCookie = clearAuthSessionCookie();
  const transientCookie = clearOauthTransientCookie();

  response.cookies.set(authCookie.name, authCookie.value, authCookie.options);
  response.cookies.set(transientCookie.name, transientCookie.value, transientCookie.options);

  return response;
};

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearCookies(response);
}

export async function GET() {
  const target = new URL('/', process.env.APP_URL ?? 'http://localhost:3000');
  target.searchParams.set('auth', 'disconnected');

  const response = NextResponse.redirect(target);
  return clearCookies(response);
}