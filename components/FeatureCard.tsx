type FeatureCardProps = {
  title: string;
  description: string;
  status: 'live' | 'coming-soon';
};

export function FeatureCard({ title, description, status }: FeatureCardProps) {
  return (
    <div className="border border-latch-border bg-latch-card hover:border-latch-border-hover transition-all duration-200 p-6 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-latch-primary">{title}</h3>
        {status === 'live' ? (
          <span className="text-xs font-semibold text-latch-mint bg-latch-mint-bg px-2.5 py-0.5 rounded border border-latch-mint-border font-mono flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-latch-mint animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-xs font-semibold text-latch-muted bg-latch-card-hover px-2.5 py-0.5 rounded border border-latch-border font-mono">
            Coming Soon
          </span>
        )}
      </div>
      <p className="text-sm text-latch-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
