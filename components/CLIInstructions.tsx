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
  const [showToken, setShowToken] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const forwardUrl = destinationUrl || 'http://localhost:3000/api/webhook';
  const command = `npx latch-cli listen ${projectId} --forward-to ${forwardUrl} --token ${cliToken || '<token>'}`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
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
    <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-zinc-900/60">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Latch CLI (Local Proxy Tunnel)
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-xl">
            Forward live webhooks arriving at Latch straight to localhost. Outbound-only tunnel bypasses firewalls and NATs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToken(!showToken)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold font-mono text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-md transition-all cursor-pointer select-none"
          >
            {showToken ? 'Hide Token' : 'Show Token'}
          </button>
          <button
            onClick={handleRotateToken}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold font-mono text-amber-500/90 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 rounded-md transition-all cursor-pointer disabled:opacity-50 select-none"
          >
            {isPending ? 'Rotating...' : 'Rotate Token'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* CLI Command Block */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
            Listen & Forward Command
          </label>
          <div className="relative group rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs flex items-center justify-between gap-4 overflow-hidden">
            <div className="overflow-x-auto whitespace-nowrap text-zinc-300 pr-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
              <span className="text-zinc-500">npx</span>{' '}
              <span className="text-emerald-400">latch-cli</span> listen{' '}
              <span className="text-zinc-400">{projectId}</span>{' '}
              <span className="text-zinc-500">--forward-to</span>{' '}
              <span className="text-teal-400">{forwardUrl}</span>{' '}
              <span className="text-zinc-500">--token</span>{' '}
              <span className="text-zinc-400 font-semibold select-all">
                {showToken ? cliToken || 'Loading...' : '••••••••••••••••••••••••••••••••'}
              </span>
            </div>
            <button
              onClick={handleCopyCommand}
              className="absolute right-2 top-2 p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Command"
            >
              {copiedCommand ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* CLI Token Block */}
        <div className="space-y-1">
          <label className="text-[9px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
            CLI Access Token
          </label>
          <div className="relative group rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2.5 font-mono text-xs flex items-center justify-between gap-4 overflow-hidden">
            <span className="text-zinc-400 truncate">
              {showToken ? cliToken || 'No token configured' : '••••••••••••••••••••••••••••••••••••'}
            </span>
            {cliToken && (
              <button
                onClick={handleCopyToken}
                className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                title="Copy Token"
              >
                {copiedToken ? (
                  <span className="text-[10px] text-emerald-400 font-semibold px-1">Copied!</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
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
