import 'server-only';

const requiredEnvVars = [
  'APP_URL',
  'SESSION_SECRET',
  'X_CLIENT_ID',
  'X_CLIENT_SECRET',
  'X_OAUTH_CALLBACK_URL',
] as const;

type RequiredEnvKey = (typeof requiredEnvVars)[number];

type ServerEnv = {
  appUrl: string;
  sessionSecret: string;
  xClientId: string;
  xClientSecret: string;
  xOauthCallbackUrl: string;
  xOauthAuthorizeUrl: string;
  xOauthTokenUrl: string;
  xApiBaseUrl: string;
  xOauthScope: string;
  xPostsMaxResults: number;
};

const requireEnv = (key: RequiredEnvKey): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }

  return value;
};

const requireValidUrl = (key: string, value: string): string => {
  try {
    const parsed = new URL(value);
    return parsed.toString().replace(/\/$/, '');
  } catch {
    throw new Error(`[env] ${key} must be a valid absolute URL. Received: "${value}"`);
  }
};

const parsePositiveInt = (key: string, value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`[env] ${key} must be a positive integer. Received: "${value}"`);
  }

  return parsed;
};

for (const envKey of requiredEnvVars) {
  requireEnv(envKey);
}

const appUrl = requireValidUrl('APP_URL', requireEnv('APP_URL'));
const xOauthCallbackUrl = requireValidUrl(
  'X_OAUTH_CALLBACK_URL',
  requireEnv('X_OAUTH_CALLBACK_URL')
);

if (!xOauthCallbackUrl.startsWith(appUrl)) {
  throw new Error(
    `[env] X_OAUTH_CALLBACK_URL must be under APP_URL. APP_URL="${appUrl}", X_OAUTH_CALLBACK_URL="${xOauthCallbackUrl}"`
  );
}

export const env: ServerEnv = Object.freeze({
  appUrl,
  sessionSecret: requireEnv('SESSION_SECRET'),
  xClientId: requireEnv('X_CLIENT_ID'),
  xClientSecret: requireEnv('X_CLIENT_SECRET'),
  xOauthCallbackUrl,
  xOauthAuthorizeUrl: requireValidUrl(
    'X_OAUTH_AUTHORIZE_URL',
    process.env.X_OAUTH_AUTHORIZE_URL ?? 'https://twitter.com/i/oauth2/authorize'
  ),
  xOauthTokenUrl: requireValidUrl(
    'X_OAUTH_TOKEN_URL',
    process.env.X_OAUTH_TOKEN_URL ?? 'https://api.x.com/2/oauth2/token'
  ),
  xApiBaseUrl: requireValidUrl('X_API_BASE_URL', process.env.X_API_BASE_URL ?? 'https://api.x.com/2'),
  xOauthScope:
    process.env.X_OAUTH_SCOPE ?? 'tweet.read users.read like.read list.read follows.read offline.access',
  xPostsMaxResults: parsePositiveInt('X_POSTS_MAX_RESULTS', process.env.X_POSTS_MAX_RESULTS, 50),
});