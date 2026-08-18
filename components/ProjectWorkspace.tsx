'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { IngestUrl } from './IngestUrl';
import { EventFeed } from './EventFeed';
import { CLIInstructions } from './CLIInstructions';
import { UpdateProjectForm } from './UpdateProjectForm';
import { DeleteProjectButton } from './DeleteProjectButton';
import type { Project } from '@/lib/types';

export function ProjectWorkspace({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<'events' | 'cli' | 'settings'>('events');

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background flex font-sans selection:bg-primary-container/30 selection:text-primary">
      {/* Left Sidebar */}
      <Sidebar
        projectId={project.id}
        projectName={project.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Header */}
        <header className="px-8 py-4 border-b border-outline-variant bg-surface/80 backdrop-blur-xl sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <span>{project.name}</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping-emerald absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">Ingest URL</span>
              <IngestUrl projectId={project.id} />
            </div>

            {project.destination_url && (
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-outline-variant">
                <span className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">Forwards to</span>
                <span className="text-xs font-mono text-on-surface-variant truncate max-w-xs">{project.destination_url}</span>
              </div>
            )}
          </div>
        </header>

        {/* Tab Content Canvas */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full">
          {activeTab === 'events' && (
            <div className="space-y-6 animate-fade-in">
              <EventFeed projectId={project.id} destinationUrl={project.destination_url ?? ''} />
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="max-w-4xl space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-on-surface tracking-tight">Tunnel &amp; CLI Management</h2>
                <p className="text-xs text-on-surface-variant mt-1">Configure your local tunnel relay and CLI access tokens.</p>
              </div>
              <CLIInstructions
                projectId={project.id}
                cliToken={project.cli_token}
                destinationUrl={project.destination_url}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-on-surface tracking-tight">Project Settings</h2>
                <p className="text-xs text-on-surface-variant mt-1">Manage project details and forwarding destinations.</p>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-on-surface font-mono">General Configuration</h3>
                <UpdateProjectForm
                  projectId={project.id}
                  initialName={project.name}
                  initialDestinationUrl={project.destination_url}
                />
              </div>

              <div className="rounded-2xl border border-error/30 bg-error-container/10 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-error font-mono">Danger Zone</h3>
                  <p className="text-xs text-on-surface-variant leading-normal mt-1">
                    Deleting this project is permanent and will purge all webhook records, history, and active tunnels.
                  </p>
                </div>
                <div className="pt-2 max-w-xs">
                  <DeleteProjectButton projectId={project.id} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
