'use client';

type Feature = {
  title: string;
  description: string;
  tag: string;
  icon: (props: { className?: string }) => React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: 'Side-by-Side Payload Diffing',
    description:
      'Compare payload schemas between any two captured events. Git-style additions and deletions highlight breaking schema changes before they hit production.',
    tag: 'Schema Drift Detection',
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Built-in Localhost Tunnel',
    description:
      'Replace ngrok with our built-in SSE relay. Run a single command in your terminal to securely stream live webhooks straight to localhost without public port opening.',
    tag: 'No ngrok Needed',
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Signature Verification Engine',
    description:
      'Verify Stripe HMAC-SHA256, GitHub X-Hub-Signature, and Shopify signatures. Raw request text and headers are stored byte-for-byte for validation fidelity.',
    tag: 'Cryptographic Security',
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Deterministic 1-Click Replay',
    description:
      'Resend any event with its original headers and raw payload intact. Debug local endpoints or recover from downstream service outages in seconds.',
    tag: 'Zero Data Loss',
    icon: ({ className = 'w-5 h-5' }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

export function FeaturesGrid() {
  return (
    <section className="w-full space-y-8">
      <div className="text-left space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Core Capabilities
        </h2>
        <p className="text-sm text-zinc-400">
          Everything you need to capture, debug, and recover webhooks reliably.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="border border-[#27272a] bg-[#131315] rounded-xl p-6 space-y-4 hover:border-[#3f3f46] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-lg bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[#10b981]">
                <feature.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-[#1c1b1d] px-2 py-0.5 rounded border border-[#27272a]">
                {feature.tag}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

