export type XOauthToken = {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  scope: string;
  expiresAt: number;
};

export type XAuthSession = {
  userId: string;
  token: XOauthToken;
};