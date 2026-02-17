import type { AuthStatus } from '@/types/app';

export const APP_NAME = 'HitX';

export const AUTH_COOKIE_NAME = 'hitx_session';
export const OAUTH_TRANSIENT_COOKIE_NAME = 'hitx_oauth_transient';

export const AUTH_STATUSES: readonly AuthStatus[] = [
  'not_connected',
  'connecting',
  'loading',
  'ready',
  'empty',
  'error',
] as const;

export const SEARCH_DEBOUNCE_MS = 400;

export const LARGE_POSTS_VIRTUALIZATION_THRESHOLD = 120;