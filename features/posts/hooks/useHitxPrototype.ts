'use client';

import { useCallback, useMemo, useState } from 'react';
import { MOCK_FLAGS, MOCK_POSTS, MOCK_PROFILE, mapMockPostToXPost } from '@/lib/mockPosts';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants/app';
import { useDebouncedValue } from '@/features/posts/hooks/useDebouncedValue';
import { ERROR_CODES } from '@/lib/errors/app-error';
import type { PostsApiError } from '@/types/api';
import type { XPost, XProfile } from '@/types/x';

type PrototypeStatus =
  | 'not_connected'
  | 'connecting'
  | 'connected_loading'
  | 'connected_ready'
  | 'connected_no_results'
  | 'error';

type ViewMode = 'grid' | 'list';

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const randomBetween = (range: readonly [number, number]) => {
  const [min, max] = range;
  return min + Math.floor(Math.random() * (max - min + 1));
};

const buildSearchIndex = (post: XPost): string => {
  const hashtags = post.hashtags.map((tag) => `#${tag}`).join(' ');
  const mentions = post.mentions.map((mention) => `@${mention}`).join(' ');
  return `${post.text} ${hashtags} ${mentions}`.toLowerCase();
};

export const useHitxPrototype = () => {
  const [status, setStatus] = useState<PrototypeStatus>('not_connected');
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [posts, setPosts] = useState<XPost[]>([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [error, setError] = useState<PostsApiError | null>(null);
  const [inFlight, setInFlight] = useState(false);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const normalizedQuery = debouncedQuery.trim().toLowerCase();

  const loadMockPosts = useCallback(async () => {
    setInFlight(true);
    setError(null);
    setStatus('connected_loading');

    await delay(randomBetween(MOCK_FLAGS.fetchDelayRangeMs));

    if (MOCK_FLAGS.simulateError) {
      setStatus('error');
      setInFlight(false);
      setPosts([]);
      setProfile(MOCK_PROFILE);
      setError({
        code: ERROR_CODES.UPSTREAM_FAILURE,
        message: 'Mock error enabled. Disable MOCK_FLAGS.simulateError in lib/mockPosts.ts.',
        status: 500,
      });
      return;
    }

    // Replace this mock mapping with the real X API adapter once OAuth/data routes are enabled.
    const mapped = MOCK_FLAGS.simulateEmpty ? [] : MOCK_POSTS.map(mapMockPostToXPost);
    setPosts(mapped);
    setProfile(MOCK_PROFILE);
    setInFlight(false);
    setStatus(mapped.length === 0 ? 'connected_no_results' : 'connected_ready');
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setInFlight(true);
    await delay(randomBetween(MOCK_FLAGS.authDelayRangeMs));
    await loadMockPosts();
  }, [loadMockPosts]);

  const disconnect = useCallback(() => {
    setStatus('not_connected');
    setInFlight(false);
    setProfile(null);
    setPosts([]);
    setQuery('');
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!profile) {
      return;
    }
    await loadMockPosts();
  }, [profile, loadMockPosts]);

  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) => buildSearchIndex(post).includes(normalizedQuery));
  }, [posts, normalizedQuery]);

  const visibleStatus: PrototypeStatus = useMemo(() => {
    if (status === 'connected_ready' && normalizedQuery && filteredPosts.length === 0) {
      return 'connected_no_results';
    }
    return status;
  }, [status, normalizedQuery, filteredPosts.length]);

  const analytics = useMemo(() => {
    return filteredPosts.reduce(
      (acc, post) => {
        acc.totalPosts += 1;
        acc.totalLikes += post.metrics.likeCount;
        acc.totalViews += post.metrics.viewCount ?? 0;
        return acc;
      },
      { totalPosts: 0, totalLikes: 0, totalViews: 0 }
    );
  }, [filteredPosts]);

  return {
    status: visibleStatus,
    profile,
    posts: filteredPosts,
    allPostsCount: posts.length,
    query,
    debouncedQuery,
    viewMode,
    inFlight,
    error,
    analytics,
    setQuery,
    setViewMode,
    connect,
    disconnect,
    refresh,
  };
};
