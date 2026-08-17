'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function HelpDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-latch-secondary hover:text-latch-primary transition-colors cursor-pointer"
      >
        <span>Help</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180 text-latch-mint' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 md:left-0 mt-2 w-48 rounded-xl border border-latch-border bg-latch-card p-1.5 shadow-xl z-50 animate-fade-in text-xs font-sans">
          <Link
            href="/docs"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-latch-secondary hover:text-latch-primary hover:bg-latch-card-hover transition-all"
          >
            <span>📖 Documentation</span>
          </Link>
          <Link
            href="/docs#troubleshooting"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-latch-secondary hover:text-latch-primary hover:bg-latch-card-hover transition-all"
          >
            <span>🔧 Troubleshooting</span>
          </Link>
          <a
            href="https://github.com/ayomidedaniel1/Latch/issues"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-latch-secondary hover:text-latch-primary hover:bg-latch-card-hover transition-all"
          >
            <span>💬 Report an Issue</span>
          </a>
        </div>
      )}
    </div>
  );
}
