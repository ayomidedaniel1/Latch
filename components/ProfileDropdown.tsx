'use client';

import { useRef, useState } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="relative group/profile flex items-center">
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name || 'User avatar'}
          width={28}
          height={28}
          className="rounded-full border border-zinc-850 hover:border-emerald-500/50 transition-colors cursor-pointer"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-850 hover:border-emerald-500/50 flex items-center justify-center text-xs font-bold text-zinc-400 transition-colors cursor-pointer">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      )}

      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-900 bg-zinc-950 p-3 shadow-2xl opacity-0 translate-y-1 invisible group-hover/profile:opacity-100 group-hover/profile:translate-y-0 group-hover/profile:visible transition-all duration-200 z-50">
        <div className="pb-2 mb-2 border-b border-zinc-900">
          <p className="text-xs font-semibold text-white truncate">{user?.name || 'Developer'}</p>
          <p className="text-[10px] text-zinc-500 truncate">{user?.email || ''}</p>
        </div>
        <form ref={formRef} action={signOutAction}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full text-left rounded-md px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          formRef.current?.requestSubmit();
        }}
        title="Sign Out"
        message="Are you sure you want to end your session? You will need to authenticate again with GitHub to access your dashboard."
        confirmText="Sign Out"
        variant="warning"
      />
    </div>
  );
}
