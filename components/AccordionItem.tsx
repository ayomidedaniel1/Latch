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
    <div className="rounded-xl border border-latch-border bg-latch-card overflow-hidden transition-all duration-200 hover:border-latch-border-hover">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-5 py-4 text-base md:text-lg font-medium text-latch-primary cursor-pointer select-none flex items-center justify-between gap-3 text-left transition-colors hover:bg-latch-card-hover"
        aria-expanded={open}
      >
        {question}
        <svg
          className="accordion-chevron w-4 h-4 text-latch-secondary shrink-0"
          data-open={open}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="accordion-content" data-open={open}>
        <div className="accordion-inner">
          <div className="px-5 pb-5 pt-1 text-sm md:text-base text-latch-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
