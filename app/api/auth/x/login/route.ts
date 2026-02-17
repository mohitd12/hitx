import { NextResponse } from 'next/server';
import { createOauthState, createPkceChallenge, createPkceVerifier } from '@/server/auth/crypto';
import { createOauthTransientCookie } from '@/server/auth/session';
import { buildXAuthorizeUrl } from '@/server/x/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = createOauthState();
  const codeVerifier = createPkceVerifier();
  const codeChallenge = createPkceChallenge(codeVerifier);

  const redirectUrl = buildXAuthorizeUrl({ state, codeChallenge });
  const response = NextResponse.redirect(redirectUrl);

  // Keep OAuth anti-CSRF state and PKCE verifier server-signed and short-lived.
  const oauthCookie = createOauthTransientCookie({ state, codeVerifier });
  response.cookies.set(oauthCookie.name, oauthCookie.value, oauthCookie.options);

  return response;
}