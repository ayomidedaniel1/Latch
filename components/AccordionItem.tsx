'use client';

import React, { useState, createContext, useContext, type ReactNode } from 'react';

interface AccordionContextType {
  openIndex: number | null;
  toggleIndex: (index: number) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionGroupProps {
  children: ReactNode;
  className?: string;
}

export function AccordionGroup({ children, className = '' }: AccordionGroupProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleIndex(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <AccordionContext.Provider value={{ openIndex, toggleIndex }}>
      <div className={className}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<AccordionItemProps>(child)) {
            return React.cloneElement(child, { index });
          }
          return child;
        })}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  question: string;
  children: ReactNode;
  index?: number;
  defaultOpen?: boolean;
}

export function AccordionItem({ question, children, index, defaultOpen = false }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const isControlled = context !== null && index !== undefined;
  const open = isControlled ? context.openIndex === index : localOpen;

  function handleToggle() {
    if (isControlled) {
      context.toggleIndex(index);
    } else {
      setLocalOpen((prev) => !prev);
    }
  }

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      open
        ? 'border-[#10b981]/40 bg-[#101115]/95 shadow-md shadow-[#10b981]/5'
        : 'border-white/[0.08] bg-[#0c0d10]/80 hover:border-white/[0.16] hover:bg-[#121317]/80'
    }`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none transition-colors group"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-semibold text-white group-hover:text-[#10b981] transition-colors tracking-tight">
          {question}
        </span>
        <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
          open
            ? 'bg-[#10b981]/15 border-[#10b981]/30 text-[#10b981]'
            : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 group-hover:text-white'
        }`}>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className="accordion-content" data-open={open}>
        <div className="accordion-inner">
          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
