import type { AuthStatus } from '@/types/app';
import type { ErrorCode } from '@/lib/errors/app-error';
import type { XPost, XProfile } from '@/types/x';

export type PostsApiError = {
  code: ErrorCode;
  message: string;
  status: number;
  retryAt?: number;
};

export type PostsApiResponse = {
  status: Extract<AuthStatus, 'not_connected' | 'ready' | 'empty' | 'error'>;
  profile: XProfile | null;
  posts: XPost[];
  error: PostsApiError | null;
};