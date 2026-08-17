'use client';

export function TunnelStatus({
  cliConnected,
}: {
  cliConnected: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-900 rounded-lg px-3 py-1.5 font-mono text-xs shadow-sm">
      <span className="relative flex h-2 w-2">
        {cliConnected && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            cliConnected ? 'bg-emerald-500' : 'bg-zinc-600'
          }`}
        />
      </span>
      <span className={`text-xs ${cliConnected ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
        {cliConnected ? 'Built-in Tunnel Active' : 'Tunnel Offline'}
      </span>
    </div>
  );
}
