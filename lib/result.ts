import { AppError, ERROR_CODES, type ErrorCode } from '@/lib/errors/app-error';

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });

export const fail = (
  code: ErrorCode,
  message: string,
  status?: number,
  cause?: unknown
): Result<never> => ({
  ok: false,
  error: new AppError(code, message, status ?? 500, cause),
});

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(ERROR_CODES.UNKNOWN, 'Unexpected application error', 500, error);
};