'use client';

import { LayoutGrid, List, Search } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (view: 'grid' | 'list') => void;
};

export default function SearchBar({
  value,
  onChange,
  viewMode,
  onViewModeChange,
}: SearchBarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 md:px-6">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search by text, #hashtag, or @mention"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search posts"
          />
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-border/70 bg-card p-1 sm:flex">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-md px-2 py-1.5 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => onViewModeChange('list')}
            className={`rounded-md px-2 py-1.5 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
            <List className="size-4" />
          </button>
        </div>

        <ThemeToggle />
      </div>
    </div>
  );
}
