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
    <div className="rounded-lg border border-[#27272a] bg-[#131315]/80 overflow-hidden transition-all duration-200 hover:border-[#3f3f46]">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 cursor-pointer select-none transition-colors hover:bg-[#1c1b1d]/60"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-semibold text-[#10b981] tracking-tight">
          {question}
        </span>
        <div className="h-6 w-6 rounded-full bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[#71717a] shrink-0 text-xs font-mono">
          {open ? '−' : '+'}
        </div>
      </button>
      <div className="accordion-content" data-open={open}>
        <div className="accordion-inner">
          <div className="px-5 pb-4 pt-1 text-xs md:text-sm text-[#9ca3af] leading-relaxed border-t border-[#27272a]/40">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
