type FeatureCardProps = {
  title: string;
  description: string;
  status: 'live' | 'coming-soon';
  icon?: string;
};

export function FeatureCard({ title, description, status }: FeatureCardProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between glow-hover transition-all duration-300 relative overflow-hidden group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary group-hover:border-primary/50 group-hover:bg-primary-container/10 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-on-surface tracking-tight">{title}</h3>
          </div>
          {status === 'coming-soon' ? (
            <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full border border-outline-variant font-mono">
              Coming Soon
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-primary bg-primary-container/10 px-2.5 py-0.5 rounded-full border border-primary/20 font-mono">
              Live
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
