'use client';

import { useEffect, useState, useRef } from 'react';
import type { WebhookEvent } from '@/lib/types';

interface SearchBarProps {
  projectId: string;
  onResults: (events: WebhookEvent[]) => void;
  onClear: () => void;
}

export function SearchBar({ projectId, onResults, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const onResultsRef = useRef(onResults);
  const onClearRef = useRef(onClear);

  useEffect(() => {
    onResultsRef.current = onResults;
    onClearRef.current = onClear;
  }, [onResults, onClear]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/events/search?projectId=${projectId}&q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = (await res.json()) as WebhookEvent[];
          onResultsRef.current(data);
          setResultCount(data.length);
        } else {
          console.error('Search query failed');
          setResultCount(0);
        }
      } catch (err) {
        console.error('Search API request failed', err);
        setResultCount(0);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query, projectId]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      setResultCount(null);
      setLoading(false);
      onClearRef.current();
    } else {
      setLoading(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResultCount(null);
    setLoading(false);
    onClearRef.current();
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        {/* Monospace Code Prefix {} */}
        <div className="absolute left-3 flex items-center pointer-events-none font-mono text-xs font-bold text-[#10b981]">
          &#123;&#125;
        </div>

        {/* Monospace Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="JSONB Filter (e.g. data.status or event.type)..."
          className="w-full bg-[#0e0e10] border border-[#27272a] focus:border-[#10b981] rounded pl-8 pr-24 py-2 text-xs text-[#e5e1e4] placeholder-[#71717a] outline-none transition-all font-mono"
        />

        {/* Action area: badge, spinner, clear button */}
        <div className="absolute right-3 flex items-center gap-2">
          {loading && (
            <svg className="animate-spin h-3.5 w-3.5 text-[#10b981]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}

          {resultCount !== null && !loading && (
            <span className="text-[10px] font-mono font-bold bg-[#1c1b1d] border border-[#27272a] text-[#10b981] px-1.5 py-0.5 rounded">
              {resultCount} {resultCount === 1 ? 'match' : 'matches'}
            </span>
          )}

          {query && (
            <button
              onClick={handleClear}
              className="text-[#71717a] hover:text-white transition-colors p-0.5 rounded cursor-pointer"
              title="Clear filter"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
