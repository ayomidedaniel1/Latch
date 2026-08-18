'use client';

import { useState, useTransition } from 'react';
import { regenerateCliToken } from '@/app/dashboard/actions';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface CLIInstructionsProps {
  projectId: string;
  cliToken: string;
  destinationUrl?: string | null;
}

export function CLIInstructions({
  projectId,
  cliToken,
  destinationUrl,
}: CLIInstructionsProps) {
  const [activeTab, setActiveTab] = useState<'tunnel' | 'listen'>('tunnel');
  const [showToken, setShowToken] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const forwardUrl = destinationUrl || 'http://localhost:3000/api/webhook';
  const tunnelCommand = `npx @ayomidedaniel/latch-cli tunnel ${projectId} --forward-to ${forwardUrl} --token ${cliToken || '<token>'}`;
  const listenCommand = `npx @ayomidedaniel/latch-cli listen ${projectId} --forward-to ${forwardUrl} --token ${cliToken || '<token>'}`;
  const currentCommand = activeTab === 'tunnel' ? tunnelCommand : listenCommand;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy command', err);
    }
  };

  const handleCopyToken = async () => {
    if (!cliToken) return;
    try {
      await navigator.clipboard.writeText(cliToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (err) {
      console.error('Failed to copy token', err);
    }
  };

  const handleRotateToken = () => {
    setIsModalOpen(true);
  };

  const confirmRotateToken = () => {
    startTransition(async () => {
      try {
        await regenerateCliToken(projectId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to rotate token');
      }
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant">
        <div>
          <h3 className="text-sm font-bold text-on-surface font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping-emerald"></span>
            Latch CLI (Built-in Tunnel &amp; Listener)
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
            Forward live webhooks arriving at Latch straight to localhost without third-party services like ngrok or Cloudflare.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToken(!showToken)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold font-mono text-on-surface-variant hover:text-on-surface bg-surface-container border border-outline-variant hover:border-primary/50 rounded-lg transition-all cursor-pointer select-none"
          >
            {showToken ? 'Hide Token' : 'Show Token'}
          </button>
          <button
            onClick={handleRotateToken}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all cursor-pointer disabled:opacity-50 select-none"
          >
            {isPending ? 'Rotating...' : 'Rotate Token'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tunnel')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
              activeTab === 'tunnel'
                ? 'bg-primary-container/15 border-primary-container/30 text-primary font-bold'
                : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Built-in Tunnel (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('listen')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
              activeTab === 'listen'
                ? 'bg-primary-container/15 border-primary-container/30 text-primary font-bold'
                : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Listen Mode
          </button>
        </div>

        {/* CLI Command Block */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
            {activeTab === 'tunnel' ? 'Built-in Local Tunnel Command' : 'Listen & Forward Command'}
          </label>
          <div className="relative group rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5 font-mono text-xs flex items-center justify-between gap-4 overflow-hidden">
            <div className="overflow-x-auto whitespace-nowrap text-on-surface pr-10">
              <span className="text-outline">npx</span>{' '}
              <span className="text-primary font-semibold">@ayomidedaniel/latch-cli</span> {activeTab}{' '}
              <span className="text-on-surface-variant">{projectId}</span>{' '}
              <span className="text-outline">--forward-to</span>{' '}
              <span className="text-secondary">{forwardUrl}</span>{' '}
              <span className="text-outline">--token</span>{' '}
              <span className="text-on-surface font-semibold select-all">
                {showToken ? cliToken || 'Loading...' : '••••••••••••••••••••••••••••••••'}
              </span>
            </div>
            <button
              onClick={handleCopyCommand}
              className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Copy Command"
            >
              {copiedCommand ? (
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* CLI Token Block */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
            CLI Access Token
          </label>
          <div className="relative group rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 font-mono text-xs flex items-center justify-between gap-4 overflow-hidden">
            <span className="text-on-surface-variant truncate">
              {showToken ? cliToken || 'No token configured' : '••••••••••••••••••••••••••••••••••••'}
            </span>
            {cliToken && (
              <button
                onClick={handleCopyToken}
                className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
                title="Copy Token"
              >
                {copiedToken ? (
                  <span className="text-[10px] text-primary font-bold px-1">Copied!</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* What is this? explainer */}
        <details className="group pt-1">
          <summary className="text-xs text-on-surface-variant hover:text-primary cursor-pointer transition-colors font-medium select-none">
            What is the Built-in Tunnel?
          </summary>
          <div className="mt-3 space-y-2.5 text-xs text-on-surface-variant leading-relaxed pl-1 border-l-2 border-outline-variant ml-0.5">
            <p className="pl-3">
              <span className="text-on-surface font-semibold">Built-in Tunnel</span>: Latch acts as its own secure tunnel relay. When third parties (Stripe, GitHub, Shopify) post webhooks to your Latch ingest URL, Latch streams them directly to your local development machine via Latch CLI without using ngrok or Cloudflare.
            </p>
            <p className="pl-3">
              <span className="text-on-surface font-semibold">Rate &amp; Connection Limits</span>: To protect infrastructure, Latch limits active tunnel connections to max 3 concurrent clients per project and 100 events/minute.
            </p>
            <p className="pl-3">
              <span className="text-on-surface font-semibold">To run it</span>: copy the command above and paste it in your terminal.
            </p>
            <div className="pl-3 pt-1">
              <a href="/docs#cli" className="text-xs text-primary hover:underline font-bold transition-colors">
                Full CLI docs &rarr;
              </a>
            </div>
          </div>
        </details>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmRotateToken}
        title="Rotate CLI Token"
        message="Are you sure you want to rotate your CLI token? All currently running CLI instances using the old token will immediately fail to authenticate on their next reconnection check."
        confirmText="Rotate Token"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}
