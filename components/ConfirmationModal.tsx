'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const emptySubscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}: ConfirmationModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isClient) return null;

  const confirmColors =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10'
      : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/10';

  const iconColors =
    variant === 'danger'
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl transition-all duration-300 transform scale-100 z-10 flex flex-col gap-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${iconColors}`}>
            {variant === 'danger' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 border border-zinc-850 hover:border-zinc-750 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${confirmColors}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
