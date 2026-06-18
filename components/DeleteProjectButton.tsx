'use client';

import { useState } from 'react';
import { deleteProject } from '@/app/dashboard/actions';
import { ConfirmationModal } from './ConfirmationModal';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = async () => {
    await deleteProject(projectId);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-center"
      >
        Delete Project
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Project"
        message="Are you absolutely sure you want to delete this project? All associated webhook logs, history, and replays will be permanently lost."
        confirmText="Delete Project"
        variant="danger"
      />
    </>
  );
}
