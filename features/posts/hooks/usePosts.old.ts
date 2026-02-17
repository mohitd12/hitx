'use client';

import { useCallback, useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import { usePostsStore } from '@/features/posts/store/usePostsStore';

export const usePosts = () => {
  const { status, profile, posts, error, requestInFlight, loadPosts, setConnecting, clear } = usePostsStore(
    (state) => ({
      status: state.status,
      profile: state.profile,
      posts: state.posts,
      error: state.error,
      requestInFlight: state.requestInFlight,
      loadPosts: state.loadPosts,
      setConnecting: state.setConnecting,
      clear: state.clear,
    }),
    shallow
  );

  const refresh = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    // Initial bootstrap keeps route transitions simple while the app is SPA-based.
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
