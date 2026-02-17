'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCcw, Search } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import PostCard from '@/features/posts/components/PostCard';
import { useDebouncedValue } from '@/features/posts/hooks/useDebouncedValue';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { LARGE_POSTS_VIRTUALIZATION_THRESHOLD, SEARCH_DEBOUNCE_MS } from '@/lib/constants/app';
import type { XPost } from '@/types/x';

const shellCardClass =
  'rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm transition-shadow hover:shadow-md';

const SearchBar = memo(({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
    <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-4 md:px-6">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search your posts..."
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search posts"
        />
      </div>
      <ThemeToggle />
    </div>
  </div>
));
SearchBar.displayName = 'SearchBar';

const LoadingSkeleton = memo(() => (
  <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-label="Loading posts">
    {Array.from({ length: 6 }).map((_, index) => (
      <article
        key={index}
        className={`${shellCardClass} animate-pulse`}>
        <div className="mb-3 h-4 w-24 rounded bg-muted" />
        <div className="mb-2 h-3 w-full rounded bg-muted" />
        <div className="mb-2 h-3 w-[85%] rounded bg-muted" />
        <div className="h-3 w-[60%] rounded bg-muted" />
      </article>
    ))}
  </section>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

const ConnectState = memo(({
  onConnect,
  description,
}: {
  onConnect: () => void;
  description?: string;
}) => (
  <section className={shellCardClass}>
    <h2 className="text-xl font-semibold">Connect Your X Account</h2>
    <p className="mt-2 text-sm text-muted-foreground" role="status" aria-live="polite">
      {description ?? 'Authorize HitX to load your latest posts and make them searchable in one place.'}
    </p>
    <button
      type="button"
      onClick={onConnect}
      className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
      Connect X
    </button>
  </section>
));
ConnectState.displayName = 'ConnectState';

const ErrorState = memo(({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <section className={shellCardClass}>
    <h2 className="text-xl font-semibold">Unable to Load Posts</h2>
    <p className="mt-2 text-sm text-muted-foreground" role="alert">
      {message}
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90">
      <RefreshCcw className="size-4" />
      Try Again
    </button>
  </section>
));
ErrorState.displayName = 'ErrorState';

const EmptyState = memo(() => (
  <section className={shellCardClass}>
    <h2 className="text-xl font-semibold">No Posts Yet</h2>
    <p className="mt-2 text-sm text-muted-foreground">
      Your account is connected, but no posts were found. Publish on X and refresh.
    </p>
  </section>
));
EmptyState.displayName = 'EmptyState';

const NoResultsState = memo(({ query }: { query: string }) => (
  <section className={shellCardClass}>
    <h2 className="text-xl font-semibold">No Matching Posts</h2>
    <p className="mt-2 text-sm text-muted-foreground">
      No posts matched <span className="font-medium text-foreground">&quot;{query}&quot;</span>. Try a different term,
      hashtag, or mention.
    </p>
  </section>
));
NoResultsState.displayName = 'NoResultsState';

const ReadyState = ({
  name,
  posts,
  highlightQuery,
  totalCount,
  showVirtualizationNotice,
  canLoadMore,
  onLoadMoreRef,
}: {
  name: string;
  posts: XPost[];
  highlightQuery: string;
  totalCount: number;
  showVirtualizationNotice: boolean;
  canLoadMore: boolean;
  onLoadMoreRef: (node: HTMLDivElement | null) => void;
}) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{name}&apos;s Posts</h2>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {showVirtualizationNotice ? `${posts.length} of ${totalCount} loaded` : `${posts.length} loaded`}
      </span>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} highlightQuery={highlightQuery} />
      ))}
    </div>
    {showVirtualizationNotice ? (
      <div className="mt-4 flex items-center justify-center">
        <div
          ref={onLoadMoreRef}
          className="rounded-md border border-border/60 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {canLoadMore ? 'Loading more posts...' : 'All posts rendered'}
        </div>
      </div>
    ) : null}
  </section>
);

export default function PostsPageShell() {
  const [searchValue, setSearchValue] = useState('');
  const [visibleCount, setVisibleCount] = useState(36);
  const searchParams = useSearchParams();
  const { status, profile, posts, error, requestInFlight, setConnecting, refresh } = usePosts();
  const debouncedSearch = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const normalizedQuery = useMemo(() => debouncedSearch.trim().toLowerCase(), [debouncedSearch]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const authBannerMessage = useMemo(() => {
    const auth = searchParams.get('auth');
    const reason = searchParams.get('reason');

    if (auth === 'connected') {
      return { tone: 'success' as const, message: 'X account connected successfully.' };
    }

    if (auth === 'disconnected') {
      return { tone: 'info' as const, message: 'X account disconnected.' };
    }

    if (auth === 'failed') {
      if (reason === 'revoked') {
        return { tone: 'error' as const, message: 'X access was revoked. Reconnect to continue.' };
      }

      if (reason === 'rate_limited') {
        return { tone: 'error' as const, message: 'X API rate-limited the login flow. Try again shortly.' };
      }

      if (reason === 'invalid_state') {
        return { tone: 'error' as const, message: 'Login validation failed. Start the connection flow again.' };
      }

      return { tone: 'error' as const, message: 'X login failed. Please try connecting again.' };
    }

    return null;
  }, [searchParams]);

  const connectDescription = useMemo(() => {
    if (status === 'connecting') {
      return 'Redirecting to X for authorization...';
    }

    if (error?.code === 'TOKEN_REVOKED' || error?.code === 'AUTH_REQUIRED') {
      return 'Your previous connection is no longer valid. Reconnect your X account to continue.';
    }

    return undefined;
  }, [status, error?.code]);

  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) => {
      const hashtags = post.hashtags.map((tag) => `#${tag}`).join(' ');
      const mentions = post.mentions.map((mention) => `@${mention}`).join(' ');
      const searchable = `${post.text} ${hashtags} ${mentions}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [posts, normalizedQuery]);

  const showVirtualizationNotice = filteredPosts.length > LARGE_POSTS_VIRTUALIZATION_THRESHOLD;

  const renderedPosts = useMemo(() => {
    if (!showVirtualizationNotice) {
      return filteredPosts;
    }

    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, showVirtualizationNotice, visibleCount]);

  const canLoadMore = renderedPosts.length < filteredPosts.length;

  useEffect(() => {
    const auth = searchParams.get('auth');

    if (!auth || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    url.searchParams.delete('reason');
    window.history.replaceState({}, '', url);
  }, [searchParams]);

  useEffect(() => {
    if (!showVirtualizationNotice || !canLoadMore || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 24, filteredPosts.length));
        }
      },
      { rootMargin: '320px 0px' }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [showVirtualizationNotice, canLoadMore, filteredPosts.length]);

  const onConnect = useCallback(() => {
    setConnecting();
    window.location.href = '/api/auth/x/login';
  }, [setConnecting]);

  const onDisconnect = useCallback(() => {
    window.location.href = '/api/auth/x/disconnect';
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setVisibleCount(36);
    setSearchValue(value);
  }, []);

  const onRetry = useCallback(() => {
    void refresh();
  }, [refresh]);

  const onRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const setLoadMoreNode = useCallback((node: HTMLDivElement | null) => {
    loadMoreRef.current = node;
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground" aria-busy={requestInFlight || status === 'loading'}>
      <SearchBar value={searchValue} onChange={onSearchChange} />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 md:px-6">
        {authBannerMessage ? (
          <div
            role={authBannerMessage.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-lg border px-3 py-2 text-sm ${
              authBannerMessage.tone === 'error'
                ? 'border-destructive/40 bg-destructive/10 text-foreground'
                : authBannerMessage.tone === 'success'
                  ? 'border-primary/30 bg-primary/10 text-foreground'
                  : 'border-border/70 bg-muted/50 text-foreground'
            }`}>
            {authBannerMessage.message}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">HitX</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={requestInFlight}
              className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60">
              Refresh
            </button>
            {status !== 'not_connected' && (
              <button
                type="button"
                onClick={onDisconnect}
                className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                Disconnect
              </button>
            )}
          </div>
        </div>

        {status === 'not_connected' || status === 'connecting' ? (
          <ConnectState onConnect={onConnect} description={connectDescription} />
        ) : null}

        {status === 'loading' ? <LoadingSkeleton /> : null}

        {status === 'error' ? (
          <ErrorState
            message={error?.message ?? 'Something went wrong while loading your posts.'}
            onRetry={onRetry}
          />
        ) : null}

        {status === 'empty' ? <EmptyState /> : null}

        {status === 'ready' && profile && filteredPosts.length === 0 && normalizedQuery ? (
          <NoResultsState query={debouncedSearch.trim()} />
        ) : null}

        {status === 'ready' && profile && filteredPosts.length > 0 ? (
          <ReadyState
            name={profile.name}
            posts={renderedPosts}
            highlightQuery={debouncedSearch.trim()}
            totalCount={filteredPosts.length}
            showVirtualizationNotice={showVirtualizationNotice}
            canLoadMore={canLoadMore}
            onLoadMoreRef={setLoadMoreNode}
          />
        ) : null}
      </div>
    </main>
  );
}