'use client';

import { useState, useTransition } from 'react';
import { createProject } from '@/app/dashboard/actions';

export function CreateProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createProject(formData);
        form.reset();
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create project');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
          <h2 className="text-base font-semibold text-white tracking-tight">Create Webhook Project</h2>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-white p-1 rounded hover:bg-[#1c1b1d] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="rounded border border-[#ef4444]/30 bg-[#ef4444]/10 p-3 text-xs text-[#ffb4ab] font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="modal-project-name" className="label-caps text-[#71717a] block">
              Project Name
            </label>
            <input
              id="modal-project-name"
              name="name"
              type="text"
              placeholder="e.g. Stripe Production"
              required
              disabled={isPending}
              className="w-full rounded bg-[#0e0e10] border border-[#27272a] focus:border-[#10b981] px-3 py-2 text-xs font-mono text-white placeholder:text-[#52525b] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="modal-destination-url" className="label-caps text-[#71717a] block">
              Destination URL (Optional)
            </label>
            <input
              id="modal-destination-url"
              name="destinationUrl"
              type="url"
              placeholder="e.g. http://localhost:3000/api/webhook"
              disabled={isPending}
              className="w-full rounded bg-[#0e0e10] border border-[#27272a] focus:border-[#10b981] px-3 py-2 text-xs font-mono text-white placeholder:text-[#52525b] focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-[#71717a] mt-1">
              Where Latch will forward replays. You can leave this blank to use Latch Tunnel CLI.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded border border-[#27272a] hover:bg-[#1c1b1d] text-xs font-medium text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-[#059669] text-[#000000] text-xs font-semibold tracking-wide transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

