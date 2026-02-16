# HitX

Production-oriented Next.js 16 starter for building HitX: a single-page experience that connects to X, fetches a user's posts, and supports fast in-page search.

## Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Zustand

## Getting Started
```bash
npm install
npm run dev
```

## Environment Variables
Create `.env.local` from `.env.example` and configure:

- `APP_URL`: Base URL of the app (example: `http://localhost:3000`).
- `SESSION_SECRET`: Long random secret for signing/encrypting session payloads.
- `X_CLIENT_ID`: OAuth 2.0 Client ID from X Developer Portal.
- `X_CLIENT_SECRET`: OAuth 2.0 Client Secret from X Developer Portal.
- `X_OAUTH_CALLBACK_URL`: OAuth callback URL in this app (must be under `APP_URL`).

Optional:

- `X_OAUTH_AUTHORIZE_URL` (default: `https://twitter.com/i/oauth2/authorize`)
- `X_OAUTH_TOKEN_URL` (default: `https://api.x.com/2/oauth2/token`)
- `X_API_BASE_URL` (default: `https://api.x.com/2`)
- `X_OAUTH_SCOPE` (default includes read scopes + `offline.access`)
- `X_POSTS_MAX_RESULTS` (default: `50`)

## Validation and Assumptions
- Server env is validated in `lib/env.ts` and fails fast if required values are missing/invalid.
- Local development assumes the callback route will be `APP_URL/api/auth/x/callback`.
- X Developer Portal must include the exact callback URL and matching app permissions/scopes.