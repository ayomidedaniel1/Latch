'use client';

import { useState, useEffect } from 'react';

export function GitHubStarButton() {
  const [stars, setStars] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('https://api.github.com/repos/ayomidedaniel1/Latch')
      .then((res) => {
        if (!res.ok) throw new Error('API limit');
        return res.json();
      })
      .then((data) => {
        if (mounted && typeof data?.stargazers_count === 'number') {
          const count = data.stargazers_count;
          const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
          setStars(formatted);
        }
      })
      .catch(() => {
        // Fallback to clean format if offline or rate limited
        if (mounted) setStars('1.1k');
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <a
      href="https://github.com/ayomidedaniel1/Latch"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-full bg-latch-card border border-latch-border hover:border-latch-border-hover px-3 py-1 text-xs font-mono text-latch-secondary hover:text-latch-primary transition-all group shadow-sm"
    >
      <div className="flex items-center gap-1.5 pr-2 border-r border-latch-border">
        <svg className="h-3.5 w-3.5 fill-current text-latch-secondary group-hover:text-latch-primary transition-colors" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className="font-sans font-medium text-xs">Star</span>
      </div>
      <div className="flex items-center gap-1 pl-2 text-latch-mint font-semibold">
        <span>★</span>
        <span>{stars ?? '1.1k'}</span>
      </div>
    </a>
  );
}
