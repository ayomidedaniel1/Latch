export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-zinc-900 bg-zinc-950" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-72 bg-zinc-900/60 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-6 bg-zinc-950/40 border border-zinc-900 rounded-xl p-4">
            <div className="space-y-1">
              <div className="h-3 w-20 bg-zinc-900 rounded animate-pulse" />
              <div className="h-6 w-8 bg-zinc-800 rounded animate-pulse mt-1" />
            </div>
            <div className="h-8 w-px bg-zinc-900" />
            <div className="space-y-1">
              <div className="h-3 w-12 bg-zinc-900 rounded animate-pulse" />
              <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse mt-1" />
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Create form skeleton */}
          <div className="lg:col-span-1 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4">
            <div className="h-6 w-40 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-900/60 rounded animate-pulse" />
            <div className="space-y-3 pt-2">
              <div className="h-9 w-full bg-zinc-900 rounded-lg animate-pulse" />
              <div className="h-9 w-full bg-zinc-900 rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-zinc-800 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Project cards skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-4 w-40 bg-zinc-900 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 min-h-[160px] space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-4 w-32 bg-zinc-900 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-zinc-900/60 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-900/60 rounded animate-pulse" />
                    <div className="h-4 w-full bg-zinc-900 rounded animate-pulse" />
                  </div>
                  <div className="pt-4 border-t border-zinc-900/60 flex justify-between">
                    <div className="h-3 w-24 bg-zinc-900/60 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
