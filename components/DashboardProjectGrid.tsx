'use client';

import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import type { Project } from '@/lib/types';

export function DashboardProjectGrid({ projects }: { projects: Project[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {/* Create New Project Card */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[200px] rounded-lg border border-dashed border-[#27272a] hover:border-[#10b981]/50 bg-[#131315]/40 hover:bg-[#161618] transition-all flex flex-col items-center justify-center p-6 text-center group cursor-pointer"
        >
          <div className="h-10 w-10 rounded-full bg-[#1c1b1d] border border-[#27272a] group-hover:border-[#10b981]/40 flex items-center justify-center text-[#9ca3af] group-hover:text-[#10b981] transition-all mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white group-hover:text-[#10b981] transition-colors">
            Create New Project
          </span>
          <p className="text-xs text-[#71717a] mt-1 max-w-[200px]">
            Generate an endpoint to start capturing webhooks.
          </p>
        </button>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

