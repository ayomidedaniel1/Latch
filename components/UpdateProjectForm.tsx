'use client';

import { useState, useTransition } from 'react';
import { updateProject } from '@/app/dashboard/actions';

interface UpdateProjectFormProps {
  projectId: string;
  initialName: string;
  initialDestinationUrl?: string | null;
}

export function UpdateProjectForm({
  projectId,
  initialName,
  initialDestinationUrl,
}: UpdateProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateProject(projectId, formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update project settings.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
      {error && (
        <div className="rounded-xl border border-error/30 bg-error-container/20 p-3 text-xs text-error flex items-start gap-2 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-primary-container/30 bg-primary-container/10 p-3 text-xs text-primary flex items-center gap-2 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Project settings saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="update-project-name" className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
            Project Name
          </label>
          <input
            id="update-project-name"
            name="name"
            type="text"
            defaultValue={initialName}
            required
            disabled={isPending}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="update-destination-url" className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
            Destination URL (optional)
          </label>
          <input
            id="update-destination-url"
            name="destinationUrl"
            type="url"
            defaultValue={initialDestinationUrl || ''}
            placeholder="http://localhost:3001/webhook"
            disabled={isPending}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-xl bg-surface-container-high border border-outline-variant hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-on-surface-variant" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving Settings...</span>
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </form>
  );
}
