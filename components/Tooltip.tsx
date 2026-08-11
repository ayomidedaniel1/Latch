'use client';

import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom';
  children: ReactNode;
}

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses =
    position === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <span
        className={`absolute ${positionClasses} z-50 w-64 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[11px] leading-relaxed text-zinc-300 shadow-xl pointer-events-none transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}
