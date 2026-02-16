export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  RATE_LIMITED: 'RATE_LIMITED',
  UPSTREAM_FAILURE: 'UPSTREAM_FAILURE',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status = 500,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}