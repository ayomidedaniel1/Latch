export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-zinc-900 bg-zinc-950" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        {/* Project header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="space-y-2">
            <div className="h-7 w-56 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-80 bg-zinc-900/60 rounded animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-zinc-900 rounded-lg animate-pulse" />
        </div>

        {/* Event feed skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: event list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-zinc-900 rounded animate-pulse" />
              <div className="h-6 w-20 bg-zinc-900 rounded animate-pulse" />
            </div>
            <div className="h-9 w-full bg-zinc-900 rounded-lg animate-pulse mb-3" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 px-3 py-2 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-zinc-900/60 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-zinc-900/60 rounded animate-pulse" />
                </div>
                <div className="h-3 w-40 bg-zinc-900 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Right: event detail */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
            <div className="h-5 w-32 bg-zinc-900 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-900/60 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-zinc-900/60 rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-zinc-900/60 rounded animate-pulse" />
            </div>
            <div className="h-40 w-full bg-zinc-900/40 rounded-lg animate-pulse mt-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
