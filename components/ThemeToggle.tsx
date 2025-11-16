'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();

  const current = theme === 'system' ? systemTheme : resolvedTheme ?? theme;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return null;
    // Solution to avoid layout shifting
    // return (
    //   <div className="flex gap-2 items-center" aria-hidden>
    //     <span className="text-sm" style={{ color: 'var(--foreground)' }}>
    //       Theme:
    //     </span>
    //     <div
    //       className="inline-flex items-center gap-2 px-2 py-1 rounded-md"
    //       style={{ border: '1px solid transparent' }}>
    //       <span
    //         style={{
    //           display: 'inline-block',
    //           padding: '6px 8px',
    //           borderRadius: 8,
    //           background: 'var(--background)',
    //           color: 'var(--foreground)',
    //           fontSize: '0.875rem',
    //           minWidth: '40px',
    //           textAlign: 'center',
    //         }}>
    //         {(current ?? 'light') === 'dark'
    //           ? '\u00A0Dark\u00A0'
    //           : '\u00A0Light\u00A0'}
    //       </span>

    //       {/* two non-selected placeholders */}
    //       <span
    //         style={{
    //           display: 'inline-block',
    //           padding: '6px 10px',
    //           borderRadius: 8,
    //           color: 'var(--foreground)',
    //           fontSize: '0.875rem',
    //         }}>
    //         Dark
    //       </span>
    //       <span
    //         style={{
    //           display: 'inline-block',
    //           padding: '6px 10px',
    //           borderRadius: 8,
    //           color: 'var(--foreground)',
    //           fontSize: '0.875rem',
    //         }}>
    //         Forest
    //       </span>
    //     </div>
    //   </div>
    // );
  }

  return (
    <div className="flex gap-2 items-center">
      <span>Theme:</span>
      <ToggleGroup
        type="single"
        defaultValue={current}
        onValueChange={setTheme}>
        <ToggleGroupItem value="light" aria-label="Toggle light theme">
          Light
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Toggle dark theme">
          Dark
        </ToggleGroupItem>
        <ToggleGroupItem value="forest" aria-label="Toggle forest theme">
          Forest
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
