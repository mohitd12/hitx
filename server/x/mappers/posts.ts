import type { XPost, XPostMedia, XProfile } from '@/types/x';

type XApiUser = {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
};

type XApiTweet = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
  };
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
    impression_count?: number;
  };
  attachments?: {
    media_keys?: string[];
  };
};

type XApiMedia = {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  preview_image_url?: string;
};

const coerceCount = (value: number | undefined): number => (typeof value === 'number' ? value : 0);

const mapMedia = (item: XApiMedia): XPostMedia => ({
  mediaKey: item.media_key,
  type: item.type,
  url: item.url,
  previewImageUrl: item.preview_image_url,
});

export const mapXUserToProfile = (user: XApiUser): XProfile => ({
  id: user.id,
  name: user.name,
  username: user.username,
  description: user.description,
  profileImageUrl: user.profile_image_url,
});

export const mapXTweetToPost = (params: {
  tweet: XApiTweet;
  mediaByKey: Map<string, XApiMedia>;
  username: string;
}): XPost => {
  const { tweet, mediaByKey, username } = params;

  const hashtags = tweet.entities?.hashtags?.map((entry) => entry.tag) ?? [];
  const mentions = tweet.entities?.mentions?.map((entry) => entry.username) ?? [];
  const media = (tweet.attachments?.media_keys ?? [])
    .map((key) => mediaByKey.get(key))
    .filter((value): value is XApiMedia => Boolean(value))
    .map(mapMedia);

  return {
    id: tweet.id,
    text: tweet.text,
    authorId: tweet.author_id,
    createdAt: tweet.created_at,
    permalink: `https://x.com/${username}/status/${tweet.id}`,
    hashtags,
    mentions,
    media,
    metrics: {
      likeCount: coerceCount(tweet.public_metrics?.like_count),
      repostCount: coerceCount(tweet.public_metrics?.retweet_count),
      replyCount: coerceCount(tweet.public_metrics?.reply_count),
      viewCount: tweet.public_metrics?.impression_count,
    },
  };
};