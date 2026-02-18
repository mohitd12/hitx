'use client';

import { memo, useCallback } from 'react';
import { AlertTriangle, PlugZap, RefreshCcw } from 'lucide-react';
import PostCard from '@/features/posts/components/PostCard';
import SearchBar from '@/features/posts/components/SearchBar';
import { useHitxPrototype } from '@/features/posts/hooks/useHitxPrototype';

const shellCardClass =
  'rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm transition-shadow hover:shadow-md';

const LoadingSkeleton = memo(() => (
  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-label="Loading posts">
    {Array.from({ length: 9 }).map((_, index) => (
      <article key={index} className={`${shellCardClass} animate-pulse`}>
        <div className="mb-3 h-4 w-28 rounded bg-muted" />
        <div className="mb-2 h-3 w-full rounded bg-muted" />
        <div className="mb-2 h-3 w-[92%] rounded bg-muted" />
        <div className="h-3 w-[70%] rounded bg-muted" />
      </article>
    ))}
  </section>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

const ConnectState = memo(
  ({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) => (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-xl items-center justify-center">
      <div className={`${shellCardClass} w-full text-center`}>
        <div className="mx-auto mb-3 inline-flex rounded-full bg-accent p-3 text-accent-foreground">
          <PlugZap className="size-5" />
        </div>
        <h2 className="text-2xl font-semibold">Connect X Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {connecting
            ? 'Redirect simulation in progress. Preparing your timeline...'
            : 'Connect to load a realistic mock timeline and validate the HitX experience.'}
        </p>
        <button
          type="button"
          disabled={connecting}
          onClick={onConnect}
          className="mt-5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65">
          {connecting ? 'Connecting...' : 'Connect X Account'}
        </button>
      </div>
    </section>
  )
);
ConnectState.displayName = 'ConnectState';

const ErrorState = memo(({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <section className={shellCardClass}>
    <div className="mb-2 inline-flex items-center gap-2 text-destructive">
      <AlertTriangle className="size-4" />
      <h2 className="text-lg font-semibold">Error Simulation Triggered</h2>
    </div>
    <p className="text-sm text-muted-foreground" role="alert">
      {message}
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm text-secondary-foreground">
      <RefreshCcw className="size-4" />
      Retry
    </button>
  </section>
));
ErrorState.displayName = 'ErrorState';

const EmptyState = memo(({ noResults, query }: { noResults: boolean; query: string }) => (
  <section className={shellCardClass}>
    <h2 className="text-xl font-semibold">{noResults ? 'No results found' : 'No posts available'}</h2>
    <p className="mt-2 text-sm text-muted-foreground">
      {noResults
        ? `No post matched "${query}". Try a text phrase, #hashtag, or @mention.`
        : 'Your mock timeline is empty. You can toggle this in lib/mockPosts.ts.'}
    </p>
  </section>
));
EmptyState.displayName = 'EmptyState';

export default function PostsPageShell() {
  const {
    status,
    profile,
    posts,
    allPostsCount,
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
  } = useHitxPrototype();

  const onRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const onConnect = useCallback(() => {
    void connect();
  }, [connect]);

  if (status === 'not_connected' || status === 'connecting') {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <ConnectState onConnect={onConnect} connecting={status === 'connecting'} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground" aria-busy={inFlight || status === 'connected_loading'}>
      <SearchBar value={query} onChange={setQuery} viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        <section className="mb-4 grid gap-3 rounded-xl border border-border/70 bg-card/70 p-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Posts</p>
            <p className="text-lg font-semibold">{analytics.totalPosts.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Likes</p>
            <p className="text-lg font-semibold">{analytics.totalLikes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Views</p>
            <p className="text-lg font-semibold">{analytics.totalViews.toLocaleString()}</p>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">HitX Prototype</h1>
            <p className="text-sm text-muted-foreground">
              {profile ? `@${profile.username}` : 'Mock profile'} - {posts.length} visible / {allPostsCount} total
              {debouncedQuery.trim() ? ` - filtered by "${debouncedQuery.trim()}"` : ' - empty search shows all posts'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={inFlight}
              className="rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-60">
              Refresh
            </button>
            <button
              type="button"
              onClick={disconnect}
              className="rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent">
              Disconnect
            </button>
          </div>
        </div>

        {status === 'connected_loading' ? <LoadingSkeleton /> : null}

        {status === 'error' ? (
          <ErrorState
            message={error?.message ?? 'Unexpected mock error.'}
            onRetry={onRefresh}
          />
        ) : null}

        {(status === 'connected_no_results' || (status === 'connected_ready' && posts.length === 0)) ? (
          <EmptyState noResults={debouncedQuery.trim().length > 0} query={debouncedQuery.trim()} />
        ) : null}

        {status === 'connected_ready' && posts.length > 0 ? (
          <section
            className={
              viewMode === 'grid'
                ? 'columns-1 gap-4 sm:columns-2 xl:columns-3'
                : 'flex flex-col gap-4'
            }>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                highlightQuery={debouncedQuery}
                mode={viewMode}
                className={viewMode === 'grid' ? 'mb-4 break-inside-avoid' : ''}
              />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
