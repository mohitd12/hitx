'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
      <section className="w-full rounded-xl border border-destructive/40 bg-card p-6 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          <h1 className="text-xl font-semibold">Something went wrong</h1>
        </div>
        <p className="text-sm text-muted-foreground" role="alert">
          {error.message || 'An unexpected error occurred. Please retry.'}
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Error reference: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <RotateCcw className="size-4" />
          Retry
        </button>
      </section>
    </main>
  );
}
