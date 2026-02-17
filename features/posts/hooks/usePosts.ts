'use client';

import { useCallback, useEffect } from 'react';
import { usePostsStore } from '@/features/posts/store/usePostsStore';

export const usePosts = () => {
  const status = usePostsStore((s) => s.status);
  const profile = usePostsStore((s) => s.profile);
  const posts = usePostsStore((s) => s.posts);
  const error = usePostsStore((s) => s.error);
  const requestInFlight = usePostsStore((s) => s.requestInFlight);

  const loadPosts = usePostsStore((s) => s.loadPosts);
  const setConnecting = usePostsStore((s) => s.setConnecting);
  const clear = usePostsStore((s) => s.clear);

  const refresh = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return {
    status,
    profile,
    posts,
    error,
    requestInFlight,
    refresh,
    setConnecting,
    clear,
  };
};
