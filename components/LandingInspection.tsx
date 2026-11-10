'use client';

import { useState } from 'react';

const SAMPLE_PAYLOAD = `{
  "event": "payment.succeeded",
  "data": {
    "id": "pi_3Mtw8wLkdIwHu7ix28a3tqPa",
    "object": "payment_intent",
    "amount": 2000,
    "created": 168000000,
    "currency": "usd",
    "status": "succeeded"
  }
}`;

export function LandingInspection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_PAYLOAD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Payload JSON Terminal */}
        <div className="lg:col-span-7 glass-panel rounded-lg border border-[#27272a] bg-[#131315]/90 overflow-hidden flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#27272a] bg-[#0e0e10]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wide text-[#9ca3af]">
                PAYLOAD.JSON
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                200 OK
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#71717a]">
              <button
                onClick={handleCopy}
                title="Copy JSON"
                className="hover:text-white p-1 rounded hover:bg-[#1c1b1d] transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                {copied ? (
                  <span className="text-[10px] text-[#10b981] font-mono">Copied!</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-[#9ca3af]">
            <pre>
              <span className="text-[#e5e1e4]">&#123;</span>
              {'\n  '}<span className="text-[#60a5fa]">&quot;event&quot;</span>: <span className="text-[#34d399]">&quot;payment.succeeded&quot;</span>,
              {'\n  '}<span className="text-[#60a5fa]">&quot;data&quot;</span>: <span className="text-[#e5e1e4]">&#123;</span>
              {'\n    '}<span className="text-[#60a5fa]">&quot;id&quot;</span>: <span className="text-[#34d399]">&quot;pi_3Mtw8wLkdIwHu7ix28a3tqPa&quot;</span>,
              {'\n    '}<span className="text-[#60a5fa]">&quot;object&quot;</span>: <span className="text-[#34d399]">&quot;payment_intent&quot;</span>,
              {'\n    '}<span className="text-[#60a5fa]">&quot;amount&quot;</span>: <span className="text-[#f59e0b]">2000</span>,
              {'\n    '}<span className="text-[#60a5fa]">&quot;created&quot;</span>: <span className="text-[#f59e0b]">168000000</span>,
              {'\n    '}<span className="text-[#60a5fa]">&quot;currency&quot;</span>: <span className="text-[#34d399]">&quot;usd&quot;</span>,
              {'\n    '}<span className="text-[#60a5fa]">&quot;status&quot;</span>: <span className="text-[#34d399]">&quot;succeeded&quot;</span>
              {'\n  '}<span className="text-[#e5e1e4]">&#125;</span>
              {'\n'}<span className="text-[#e5e1e4]">&#125;</span>
            </pre>
          </div>
        </div>

        {/* Right: Diff Viewer Card */}
        <div className="lg:col-span-5 glass-panel rounded-lg border border-[#27272a] bg-[#131315]/90 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <svg className="w-4 h-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Diff Viewer</span>
            </div>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Compare incoming payloads against expected schemas or previous versions instantly. Spot breaking changes before they hit production.
            </p>
          </div>

          <div className="mt-6 rounded border border-[#27272a] bg-[#0e0e10] p-3 space-y-1 font-mono text-xs">
            <div className="bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] px-2.5 py-1 rounded">
              - &quot;amount&quot;: 2000
            </div>
            <div className="bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] px-2.5 py-1 rounded">
              + &quot;amount&quot;: 2500
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Global Search & Filter Banner */}
      <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/90 p-5 flex items-center gap-4 shadow-xl">
        <div className="h-10 w-10 rounded-lg bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[#10b981] shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Global Search &amp; Filter</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5 leading-relaxed">
            Find the exact webhook you need across thousands of events using JMESPath queries, headers, or raw body text matching.
          </p>
        </div>
      </div>
    </div>
  );
}

