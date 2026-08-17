import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <span className="text-2xl font-bold text-zinc-500 font-mono">404</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Page not found</h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
