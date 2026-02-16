import { env } from '@/lib/env';
import { AppError, ERROR_CODES } from '@/lib/errors/app-error';

type TokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope?: string;
  refresh_token?: string;
};

type XUserMeResponse = {
  data: {
    id: string;
    name: string;
    username: string;
  };
};

const basicAuthHeader = (): string => {
  const credentials = `${env.xClientId}:${env.xClientSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

const mapTokenResponse = (token: TokenResponse) => {
  if (!token.access_token || !token.expires_in || !token.token_type) {
    throw new AppError(ERROR_CODES.UPSTREAM_FAILURE, 'Invalid token response from X', 502, token);
  }

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenType: token.token_type,
    scope: token.scope ?? env.xOauthScope,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
};

export const buildXAuthorizeUrl = (params: {
  state: string;
  codeChallenge: string;
}): string => {
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: env.xClientId,
    redirect_uri: env.xOauthCallbackUrl,
    scope: env.xOauthScope,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${env.xOauthAuthorizeUrl}?${query.toString()}`;
};

export const exchangeXCodeForToken = async (params: {
  code: string;
  codeVerifier: string;
}) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: env.xOauthCallbackUrl,
    client_id: env.xClientId,
    code_verifier: params.codeVerifier,
  });

  const response = await fetch(env.xOauthTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();
    throw new AppError(
      ERROR_CODES.UPSTREAM_FAILURE,
      `X token exchange failed with status ${response.status}`,
      response.status,
      details
    );
  }

  const token = (await response.json()) as TokenResponse;
  return mapTokenResponse(token);
};

export const refreshXAccessToken = async (refreshToken: string) => {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: env.xClientId,
  });

  const response = await fetch(env.xOauthTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();

    if (response.status === 400 || response.status === 401) {
      throw new AppError(
        ERROR_CODES.TOKEN_REVOKED,
        `X refresh token rejected with status ${response.status}`,
        401,
        details
      );
    }

    throw new AppError(
      ERROR_CODES.UPSTREAM_FAILURE,
      `X token refresh failed with status ${response.status}`,
      response.status,
      details
    );
  }

  const token = (await response.json()) as TokenResponse;
  return mapTokenResponse(token);
};

export const fetchAuthenticatedXUser = async (accessToken: string) => {
  const response = await fetch(`${env.xApiBaseUrl}/users/me?user.fields=profile_image_url,description`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();
    throw new AppError(
      ERROR_CODES.UPSTREAM_FAILURE,
      `X user lookup failed with status ${response.status}`,
      response.status,
      details
    );
  }

  const payload = (await response.json()) as XUserMeResponse;

  if (!payload.data?.id) {
    throw new AppError(ERROR_CODES.UPSTREAM_FAILURE, 'Missing user data from X /users/me', 502, payload);
  }

  return payload.data;
};
