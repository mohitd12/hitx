'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ERROR_CODES } from '@/lib/errors/app-error';
import type { AuthStatus } from '@/types/app';
import type { PostsApiError, PostsApiResponse } from '@/types/api';
import type { XPost, XProfile } from '@/types/x';

type PostsState = {
  status: AuthStatus;
  profile: XProfile | null;
  posts: XPost[];
  error: PostsApiError | null;
  requestInFlight: boolean;
  setStatus: (status: AuthStatus) => void;
  setConnecting: () => void;
  loadPosts: () => Promise<void>;
  clear: () => void;
};

const DEFAULT_ERROR: PostsApiError = {
  code: ERROR_CODES.UNKNOWN,
  message: 'Unexpected error while loading posts.',
  status: 500,
};

const extractErrorFromFailedResponse = async (
  response: Response
): Promise<PostsApiError> => {
  try {
    const payload = (await response.json()) as Partial<PostsApiResponse>;

    if (payload.error) {
      return payload.error;
    }

    return {
      code: ERROR_CODES.UNKNOWN,
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };
  } catch {
    return {
      code: ERROR_CODES.UNKNOWN,
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };
  }
};

export const usePostsStore = create<PostsState>()(
  devtools((set) => ({
    status: 'loading',
    profile: null,
    posts: [],
    error: null,
    requestInFlight: false,

    setStatus: (status) => set({ status }),

    setConnecting: () => set({ status: 'connecting', error: null }),

    clear: () =>
      set({
        status: 'not_connected',
        profile: null,
        posts: [],
        error: null,
        requestInFlight: false,
      }),

    loadPosts: async () => {
      set({ requestInFlight: true, status: 'loading', error: null });

      try {
        const response = await fetch('/api/posts', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await extractErrorFromFailedResponse(response);

          set({
            status: error.code === ERROR_CODES.AUTH_REQUIRED ? 'not_connected' : 'error',
            profile: null,
            posts: [],
            error,
            requestInFlight: false,
          });

          return;
        }

        const payload = (await response.json()) as PostsApiResponse;

        set({
          status: payload.status,
          profile: payload.profile,
          posts: payload.posts,
          error: payload.error,
          requestInFlight: false,
        });
      } catch {
        set({
          status: 'error',
          profile: null,
          posts: [],
          error: DEFAULT_ERROR,
          requestInFlight: false,
        });
      }
    },
  }))
);