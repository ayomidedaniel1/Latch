'use client';

import { useState } from 'react';

type Step = {
  number: number;
  title: string;
  description: string;
  snippet: string;
  label: string;
};

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Create a Project',
    description:
      'Sign in with GitHub, click "New Project", and get your dedicated ingest endpoint instantly.',
    snippet: 'https://latch.dev/api/ingest/{projectId}',
    label: 'Your Ingest URL',
  },
  {
    number: 2,
    title: 'Point Your Webhooks',
    description:
      'Paste your Latch URL into Stripe, GitHub, Shopify, or any provider. Payloads are captured in under 50ms with zero dropped events.',
    snippet: 'Stripe → Developers → Webhooks → Add endpoint',
    label: 'Provider Setup',
  },
  {
    number: 3,
    title: 'Inspect, Tunnel & Replay',
    description:
      'Watch webhooks stream in live. Forward to localhost with built-in SSE tunnel, diff schemas, or replay any event with one click.',
    snippet: 'npx @ayomidedaniel/latch-cli tunnel --port 3000',
    label: 'Localhost Tunnel',
  },
];

export function HowItWorks() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <section className="w-full space-y-8">
      <div className="text-left space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How It Works
        </h2>
        <p className="text-sm text-zinc-400">
          From zero to capturing and replaying webhooks in under two minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {STEPS.map((step, idx) => (
          <div
            key={step.number}
            className="border border-[#27272a] bg-[#131315] rounded-xl p-6 flex flex-col justify-between hover:border-[#3f3f46] transition-colors"
          >
            <div className="space-y-4 mb-6">
              {/* Step number badge */}
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] text-sm font-bold font-mono">
                  {step.number}
                </span>
                <h3 className="font-semibold text-white text-base">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Code snippet */}
            <div className="space-y-1.5 pt-4 border-t border-[#27272a]/60">
              <span className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                {step.label}
              </span>
              <div className="relative flex items-center rounded-lg border border-[#27272a] bg-[#0c0d10] px-3 py-2 font-mono text-xs text-zinc-300 overflow-hidden">
                <span className="truncate pr-7 text-[11px] text-[#10b981]">
                  {step.snippet}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(step.snippet, idx)}
                  className="absolute right-2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy snippet"
                >
                  {copiedIndex === idx ? (
                    <svg className="w-3.5 h-3.5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
