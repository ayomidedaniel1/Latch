'use client';

import { useState, useTransition } from 'react';
import { createProject } from '@/app/dashboard/actions';

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createProject(formData);
        form.reset();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-start gap-2 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="project-name-input" className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
          Project Name
        </label>
        <input
          id="project-name-input"
          name="name"
          type="text"
          placeholder="e.g. Stripe Checkout"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-800 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="project-destination-input" className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
          Destination URL (optional)
        </label>
        <input
          id="project-destination-input"
          name="destinationUrl"
          type="url"
          placeholder="e.g. http://localhost:3001/webhook"
          disabled={isPending}
          className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-800 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-[10px] text-zinc-500 leading-normal mt-1">
          Where Latch sends the payload when you click Replay. Usually your local dev server.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed py-2.5 px-4 font-semibold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.99]"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating Project...</span>
          </>
        ) : (
          'Create Project'
        )}
      </button>
    </form>
  );
}
