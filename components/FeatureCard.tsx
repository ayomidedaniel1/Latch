type FeatureCardProps = {
  title: string;
  description: string;
  status: 'live' | 'coming-soon';
};

export function FeatureCard({ title, description, status }: FeatureCardProps) {
  return (
    <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        {status === 'live' ? (
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/30 font-mono">
            Coming Soon
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
