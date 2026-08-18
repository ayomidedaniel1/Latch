const STEPS = [
  {
    number: 1,
    title: 'Create a Project',
    description:
      'Sign in with GitHub, click "New Project", and get your unique ingest URL instantly.',
    snippet: 'https://your-domain.vercel.app/api/ingest/{projectId}',
    label: 'Your Ingest URL',
  },
  {
    number: 2,
    title: 'Point Your Webhook',
    description:
      'Copy your Latch ingest URL and paste it into your provider\'s webhook settings: Stripe, GitHub, Shopify, or any service that sends webhooks.',
    snippet: 'Stripe → Developers → Webhooks → Add endpoint → Paste URL',
    label: 'Provider Setup',
  },
  {
    number: 3,
    title: 'Inspect, Search & Replay',
    description:
      'Webhooks appear live on the dashboard. Explore payloads with the JSON tree, diff schemas side-by-side, or forward events to localhost with the CLI.',
    snippet: 'npx @ayomidedaniel/latch-cli listen <projectId> --forward-to http://localhost:3000/api/webhook',
    label: 'CLI (Optional)',
  },
];

export function HowItWorks() {
  return (
    <section className="w-full border-t border-outline-variant pt-16 space-y-8">
      <div className="text-left space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
          How It Works
        </h2>
        <p className="text-sm text-on-surface-variant">
          From zero to capturing webhooks in under two minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="glass-panel rounded-2xl p-6 flex flex-col justify-between overflow-hidden glow-hover transition-all duration-300 relative group"
          >
            <div className="space-y-4 mb-6">
              {/* Step number badge */}
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary-container/15 border border-primary-container/30 text-primary text-sm font-bold font-mono">
                  {step.number}
                </span>
                <h3 className="font-bold text-on-surface text-base tracking-tight">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Code snippet */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
                {step.label}
              </span>
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-mono text-xs text-on-surface-variant overflow-x-auto whitespace-nowrap">
                {step.snippet}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
