import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const toBase64Url = (value: string | Buffer): string =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export const fromBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
};

const sign = (payload: string, secret: string): string =>
  toBase64Url(createHmac('sha256', secret).update(payload).digest());

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
};

export const createSignedToken = (payload: string, secret: string): string => {
  const encodedPayload = toBase64Url(payload);
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

export const verifySignedToken = (token: string, secret: string): string | null => {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload, secret);

  if (!safeEqual(signature, expected)) {
    return null;
  }

  try {
    return fromBase64Url(encodedPayload);
  } catch {
    return null;
  }
};

export const createPkceVerifier = (): string => toBase64Url(randomBytes(64));

export const createPkceChallenge = (verifier: string): string =>
  toBase64Url(createHash('sha256').update(verifier).digest());

export const createOauthState = (): string => toBase64Url(randomBytes(32));