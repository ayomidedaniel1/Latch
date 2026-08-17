'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            {error.message || 'An unexpected error occurred while loading the dashboard.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
        {error.digest && (
          <p className="text-[10px] font-mono text-zinc-600">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
