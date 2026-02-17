import { env } from '@/lib/env';
import { AppError, ERROR_CODES } from '@/lib/errors/app-error';
import { mapXTweetToPost, mapXUserToProfile } from '@/server/x/mappers/posts';
import type { XPost, XProfile } from '@/types/x';

type XApiError = {
  title?: string;
  detail?: string;
};

type XApiUserResponse = {
  data?: {
    id: string;
    name: string;
    username: string;
    description?: string;
    profile_image_url?: string;
  };
  errors?: XApiError[];
};

type XApiPostsResponse = {
  data?: Array<{
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
  }>;
  includes?: {
    media?: Array<{
      media_key: string;
      type: 'photo' | 'video' | 'animated_gif';
      url?: string;
      preview_image_url?: string;
    }>;
  };
  meta?: {
    result_count?: number;
    next_token?: string;
  };
  errors?: XApiError[];
};

const RATE_LIMIT_RESET_HEADER = 'x-rate-limit-reset';

const parseRateLimitReset = (response: Response): number | undefined => {
  const raw = response.headers.get(RATE_LIMIT_RESET_HEADER);

  if (!raw) {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed * 1000;
};

const throwFromXResponse = async (response: Response): Promise<never> => {
  const text = await response.text();

  if (response.status === 429) {
    throw new AppError(
      ERROR_CODES.RATE_LIMITED,
      'X API rate limit reached. Please retry shortly.',
      429,
      {
        details: text,
        resetAt: parseRateLimitReset(response),
      }
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new AppError(
      ERROR_CODES.TOKEN_REVOKED,
      'X authorization is invalid or revoked. Reconnect your account.',
      401,
      text
    );
  }

  throw new AppError(
    ERROR_CODES.UPSTREAM_FAILURE,
    `X API request failed with status ${response.status}`,
    response.status,
    text
  );
};

const throwIfXPayloadHasErrors = (errors: XApiError[] | undefined) => {
  if (!errors || errors.length === 0) {
    return;
  }

  const message = errors
    .map((entry) => entry.detail ?? entry.title)
    .filter((value): value is string => Boolean(value))
    .join('; ');

  throw new AppError(
    ERROR_CODES.UPSTREAM_FAILURE,
    message || 'X API returned an error payload.',
    502,
    errors
  );
};

export const fetchXProfile = async (accessToken: string): Promise<XProfile> => {
  const response = await fetch(
    `${env.xApiBaseUrl}/users/me?user.fields=id,name,username,description,profile_image_url`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    await throwFromXResponse(response);
  }

  const payload = (await response.json()) as XApiUserResponse;
  throwIfXPayloadHasErrors(payload.errors);

  if (!payload.data?.id || !payload.data.username) {
    throw new AppError(ERROR_CODES.UPSTREAM_FAILURE, 'X profile payload is missing required fields.', 502);
  }

  return mapXUserToProfile(payload.data);
};

export const fetchXPostsByUser = async (params: {
  accessToken: string;
  userId: string;
  username: string;
  maxResults?: number;
}): Promise<XPost[]> => {
  const maxResults = Math.min(Math.max(params.maxResults ?? env.xPostsMaxResults, 5), 100);

  const query = new URLSearchParams({
    max_results: String(maxResults),
    expansions: 'attachments.media_keys',
    'tweet.fields': 'id,text,author_id,created_at,entities,public_metrics,attachments',
    'media.fields': 'media_key,type,url,preview_image_url',
    exclude: 'retweets,replies',
  });

  const response = await fetch(`${env.xApiBaseUrl}/users/${params.userId}/tweets?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    await throwFromXResponse(response);
  }

  const payload = (await response.json()) as XApiPostsResponse;
  throwIfXPayloadHasErrors(payload.errors);

  const tweets = payload.data ?? [];

  if (tweets.length === 0) {
    return [];
  }

  const mediaByKey = new Map((payload.includes?.media ?? []).map((item) => [item.media_key, item] as const));

  return tweets.map((tweet) =>
    mapXTweetToPost({
      tweet,
      mediaByKey,
      username: params.username,
    })
  );
};