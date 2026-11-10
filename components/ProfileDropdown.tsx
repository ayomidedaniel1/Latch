'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ConfirmationModal } from './ConfirmationModal';

type UserSession = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function ProfileDropdown({
  user,
  signOutAction,
}: {
  user?: UserSession;
  signOutAction: () => Promise<void>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full ring-1 ring-[#27272a] hover:ring-[#10b981]/50 transition-all p-0.5 cursor-pointer focus:outline-none"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User avatar'}
            width={26}
            height={26}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[10px] font-bold text-[#10b981]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-[#27272a] bg-[#131315]/95 backdrop-blur-md p-2 shadow-2xl z-50 animate-fade-in-up">
          <div className="px-2 py-1.5 border-b border-[#27272a]/80 mb-1">
            <p className="text-xs font-semibold text-[#e5e1e4] truncate">{user?.name || 'Developer'}</p>
            <p className="text-[10px] font-mono text-[#71717a] truncate">{user?.email || 'Authenticated'}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsModalOpen(true);
            }}
            className="w-full text-left rounded px-2 py-1.5 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async () => {
          setIsModalOpen(false);
          await signOutAction();
        }}
        title="Sign Out"
        message="Are you sure you want to end your session? You will need to authenticate again with GitHub to access your dashboard."
        confirmText="Sign Out"
        variant="warning"
      />
    </div>
  );
}
