import { Suspense } from 'react';

import PostsPageShell from '@/features/posts/components/PostsPageShell';

export default function HomePage() {
  return (
    <Suspense>
      <PostsPageShell />
    </Suspense>
  );
}
