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
    <div className="relative w-full mb-4">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Monospace Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search payloads, headers, or key paths (e.g. data.object.amount)..."
          className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-800 rounded-lg pl-10 pr-24 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all font-mono"
        />

        {/* Action area: badge, spinner, clear button */}
        <div className="absolute right-3.5 flex items-center gap-2">
          {loading && (
            <svg className="animate-spin h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}

          {resultCount !== null && !loading && (
            <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}

          {query && (
            <button
              onClick={handleClear}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded hover:bg-zinc-900 cursor-pointer"
              title="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
