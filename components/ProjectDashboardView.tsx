'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EventFeed } from './EventFeed';
import { CLIInstructions } from './CLIInstructions';
import { UpdateProjectForm } from './UpdateProjectForm';
import { DeleteProjectButton } from './DeleteProjectButton';
import { CreateProjectModal } from './CreateProjectModal';
import type { Project } from '@/lib/types';

export function ProjectDashboardView({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<'events' | 'tunnel' | 'settings'>('events');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const getFullIngestUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/ingest/${project.id}`;
    }
    return `https://in.latch.dev/v1/wh_${project.id.replace(/-/g, '')}`;
  };

  const handleCopyIngest = async () => {
    await navigator.clipboard.writeText(getFullIngestUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-56px)] border-t border-[#27272a]">
      {/* Left Sidebar matching screend.png & screenwdw.png */}
      <aside className="w-full md:w-60 border-r border-[#27272a] bg-[#09090b] flex flex-col justify-between shrink-0 p-4 space-y-6">
        <div className="space-y-5">
          {/* Workspace Title */}
          <div className="space-y-0.5 px-1">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Latch Logo"
                width={18}
                height={18}
                className="rounded"
              />
              <span className="font-bold text-sm tracking-tight text-white">Project Latch</span>
            </div>
            <p className="text-[10px] font-mono text-[#10b981] flex items-center gap-1.5 pt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Production Environment
            </p>
          </div>

          {/* + New Endpoint Button */}
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="w-full rounded bg-[#10b981] hover:bg-[#059669] text-[#000000] font-semibold py-2 px-3 text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer glow-emerald"
          >
            <span className="text-base leading-none">+</span>
            <span>New Endpoint</span>
          </button>

          {/* Sidebar Nav Items */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`w-full text-left rounded px-3 py-2 text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Live Ledger / Events</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tunnel')}
              className={`w-full text-left rounded px-3 py-2 text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'tunnel'
                  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Tunnel &amp; CLI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left rounded px-3 py-2 text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Project Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#27272a] space-y-2 text-xs">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors px-2 py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Docs</span>
          </Link>
          <Link
            href="/changelog"
            className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors px-2 py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Changelog</span>
          </Link>
          <a
            href="https://github.com/ayomidedaniel1/Latch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors px-2 py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 bg-[#000000] p-4 sm:p-6 overflow-x-hidden flex flex-col space-y-5">
        {/* Subheader: Project Title & Ingest URL Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-[#71717a] hover:text-[#10b981] transition-colors"
              title="Return to projects"
            >
              &larr; Projects
            </Link>
            <span className="text-[#3f3f46]">/</span>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Project {project.name}
              </h1>
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            </div>
          </div>

          {/* Ingest URL Bar matching screend.png */}
          <div className="flex items-center gap-2">
            <span className="label-caps text-[#71717a] shrink-0">Ingest URL</span>
            <div className="flex items-center gap-2 rounded bg-[#0e0e10] border border-[#27272a] px-3 py-1.5 max-w-md w-full sm:w-auto">
              <span className="font-mono text-xs text-[#10b981] truncate">
                {getFullIngestUrl()}
              </span>
              <button
                onClick={handleCopyIngest}
                className="text-[#71717a] hover:text-[#10b981] transition-colors p-0.5 cursor-pointer shrink-0"
                title="Copy Ingest URL"
              >
                {copiedUrl ? (
                  <span className="text-[10px] text-[#10b981] font-mono font-bold">COPIED</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tab View */}
        <div className="flex-1">
          {activeTab === 'events' && (
            <EventFeed projectId={project.id} destinationUrl={project.destination_url ?? ''} />
          )}

          {activeTab === 'tunnel' && (
            <div className="max-w-4xl space-y-6">
              <CLIInstructions
                projectId={project.id}
                cliToken={project.cli_token}
                destinationUrl={project.destination_url}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6">
              <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Project Settings</h3>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    Update the project name and default destination URL for one-click replays.
                  </p>
                </div>

                <UpdateProjectForm
                  projectId={project.id}
                  initialName={project.name}
                  initialDestinationUrl={project.destination_url}
                />
              </div>

              {/* Danger Zone */}
              <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 p-6 space-y-3">
                <h4 className="text-xs font-bold text-[#ef4444] font-mono uppercase tracking-wider">
                  Danger Zone
                </h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Permanently delete this project. All associated webhook logs, payload records, and tunnels will be removed immediately.
                </p>
                <div className="pt-2">
                  <DeleteProjectButton projectId={project.id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

