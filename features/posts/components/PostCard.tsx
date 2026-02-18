'use client';

import { memo, useMemo } from 'react';
import { ExternalLink, Heart, MessageCircle, Repeat2, Video } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { XPost } from '@/types/x';

type PostCardProps = {
  post: XPost;
  highlightQuery?: string;
  mode?: 'grid' | 'list';
  className?: string;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const HighlightedText = ({
  text,
  query,
}: {
  text: string;
  query: string;
}) => {
  const normalizedQuery = query.trim();
  const parts = useMemo(() => {
    if (!normalizedQuery) {
      return [text];
    }

    const expression = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig');
    return text.split(expression);
  }, [text, normalizedQuery]);

  if (!normalizedQuery || parts.length === 1) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          className={part.toLowerCase() === normalizedQuery.toLowerCase() ? 'bg-accent text-accent-foreground' : ''}>
          {part}
        </span>
      ))}
    </>
  );
};

const Stat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: ReactNode;
}) => (
  <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
    {icon}
    <span className="sr-only">{label}</span>
    <span>{typeof value === 'number' ? value.toLocaleString() : '-'}</span>
  </div>
);

function PostCard({ post, highlightQuery = '', mode = 'grid', className }: PostCardProps) {
  const previewMedia = post.media[0];
  const mediaUrl = previewMedia?.url ?? previewMedia?.previewImageUrl;
  const createdAtText = useMemo(() => new Date(post.createdAt).toLocaleString(), [post.createdAt]);

  return (
    <article
      className={cn(
        'group rounded-2xl border border-border/60 bg-card/85 p-4 shadow-sm transition-all duration-300',
        'will-change-transform hover:-translate-y-1 hover:shadow-xl',
        'animate-in fade-in-0 slide-in-from-bottom-2',
        mode === 'list' ? 'sm:flex sm:items-start sm:gap-4' : '',
        className
      )}>
      <header className={cn('mb-3 flex items-start justify-between gap-2', mode === 'list' ? 'sm:min-w-44' : '')}>
        <time
          dateTime={post.createdAt}
          className="text-xs text-muted-foreground">
          {createdAtText}
        </time>
        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">
          View on X
          <ExternalLink className="size-3.5" />
        </a>
      </header>

      <div className="flex-1">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-card-foreground">
          <HighlightedText text={post.text} query={highlightQuery} />
        </p>

        {(post.hashtags.length > 0 || post.mentions.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {post.hashtags.map((tag) => (
              <span
                key={`tag-${post.id}-${tag}`}
                className="rounded-md bg-muted/60 px-2 py-1 text-muted-foreground">
                #
                <HighlightedText text={tag} query={highlightQuery.replace(/^#/, '')} />
              </span>
            ))}
            {post.mentions.map((mention) => (
              <span
                key={`mention-${post.id}-${mention}`}
                className="rounded-md bg-muted/60 px-2 py-1 text-muted-foreground">
                @
                <HighlightedText text={mention} query={highlightQuery.replace(/^@/, '')} />
              </span>
            ))}
          </div>
        )}

        {mediaUrl ? (
          <div className="relative mt-3 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
            <Image
              src={mediaUrl}
              alt="Post media preview"
              width={640}
              height={360}
              className={cn('w-full object-cover', mode === 'list' ? 'h-40 sm:h-36' : 'h-44')}
              unoptimized
            />
            {previewMedia?.type !== 'photo' ? (
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-foreground">
                <Video className="size-3.5" />
                {previewMedia?.type === 'video' ? 'Video' : 'GIF'}
              </span>
            ) : null}
          </div>
        ) : null}

        <footer className="mt-4 flex flex-wrap gap-2">
          <Stat
            label="Likes"
            value={post.metrics.likeCount}
            icon={<Heart className="size-3.5" />}
          />
          <Stat
            label="Reposts"
            value={post.metrics.repostCount}
            icon={<Repeat2 className="size-3.5" />}
          />
          <Stat
            label="Replies"
            value={post.metrics.replyCount}
            icon={<MessageCircle className="size-3.5" />}
          />
        {typeof post.metrics.viewCount === 'number' ? (
            <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
              {post.metrics.viewCount.toLocaleString()} views
            </span>
          ) : null}
        </footer>
      </div>
    </article>
  );
}

export default memo(PostCard);
