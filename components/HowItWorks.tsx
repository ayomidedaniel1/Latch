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
      'Copy your Latch ingest URL and paste it into your provider\'s webhook settings — Stripe, GitHub, Shopify, or any service that sends webhooks.',
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
    <section className="w-full border-t border-zinc-900 pt-16 space-y-8">
      <div className="text-left space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          How It Works
        </h2>
        <p className="text-sm text-zinc-400">
          From zero to capturing webhooks in under two minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="relative border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-between overflow-hidden group hover:border-zinc-800 transition-all"
          >
            {/* Top gradient accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />

            <div className="space-y-4 mb-6">
              {/* Step number badge */}
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold font-mono">
                  {step.number}
                </span>
                <h3 className="font-semibold text-white text-sm">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Code snippet */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                {step.label}
              </span>
              <div className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2.5 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                {step.snippet}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
