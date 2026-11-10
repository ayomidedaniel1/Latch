'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteProject } from '@/app/dashboard/actions';
import { ConfirmationModal } from './ConfirmationModal';
import type { Project } from '@/lib/types';

export function ProjectCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const getIngestUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/ingest/${project.id}`;
    }
    return `https://in.latch.dev/v1/wh_${project.id.replace(/-/g, '')}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getIngestUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-lg border border-[#27272a] bg-[#161618] hover:border-[#3f3f46] transition-all flex flex-col justify-between p-5 space-y-4 shadow-xl relative group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#10b981] transition-colors">
            <Link href={`/dashboard/${project.id}`}>{project.name}</Link>
          </h3>
          <p className="text-[11px] font-mono text-[#71717a] mt-0.5">
            ID: prj_{project.id.slice(0, 8)}...
          </p>
        </div>

        {/* Three dots menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#201f22] transition-colors cursor-pointer"
            title="Project Options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-[#27272a] bg-[#131315] shadow-2xl py-1 z-30 animate-fade-in-up">
              <button
                onClick={() => {
                  handleCopy();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#e5e1e4] hover:bg-[#1c1b1d] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Ingest URL
              </button>
              <Link
                href={`/dashboard/${project.id}#settings`}
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 text-xs text-[#e5e1e4] hover:bg-[#1c1b1d] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Project Settings
              </Link>
              <div className="h-px bg-[#27272a] my-1" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ingest URL */}
      <div className="space-y-1">
        <span className="label-caps text-[#71717a] block">Ingest URL</span>
        <div className="flex items-center justify-between gap-2 rounded bg-[#0e0e10] border border-[#27272a] px-3 py-2">
          <span className="font-mono text-xs text-[#9ca3af] truncate">
            {typeof window !== 'undefined'
              ? `${window.location.origin}/api/ingest/${project.id.slice(0, 8)}...`
              : `https://in.latch.dev/v1/wh_${project.id.slice(0, 8)}...`}
          </span>
          <button
            onClick={handleCopy}
            className="text-[#71717a] hover:text-[#10b981] transition-colors p-1 cursor-pointer shrink-0"
            title="Copy full URL"
          >
            {copied ? (
              <span className="text-[10px] text-[#10b981] font-mono font-semibold">COPIED</span>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Destination URL */}
      <div className="space-y-1">
        <span className="label-caps text-[#71717a] block">Destination URL</span>
        <p className="font-mono text-xs text-[#9ca3af] truncate">
          {project.destination_url || 'http://localhost:3000 (Tunnel / CLI)'}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-[#27272a]/60 flex items-center justify-between">
        <Link
          href={`/dashboard/${project.id}`}
          className="text-xs font-semibold text-[#10b981] hover:text-[#4edea3] transition-colors flex items-center gap-1 group/link"
        >
          <span>Open Ledger</span>
          <span className="transition-transform group-hover/link:translate-x-0.5">&rarr;</span>
        </Link>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await deleteProject(project.id);
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All associated webhook records and tunnels will be permanently removed.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

