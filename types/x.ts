export type XAuthor = {
  id: string;
  name: string;
  username: string;
  profileImageUrl?: string;
};

export type XPostMetrics = {
  likeCount: number;
  repostCount: number;
  replyCount: number;
  viewCount?: number;
};

export type XPostMedia = {
  mediaKey: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  previewImageUrl?: string;
};

export type XPost = {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  permalink: string;
  hashtags: string[];
  mentions: string[];
  metrics: XPostMetrics;
  media: XPostMedia[];
};

export type XProfile = XAuthor & {
  description?: string;
};