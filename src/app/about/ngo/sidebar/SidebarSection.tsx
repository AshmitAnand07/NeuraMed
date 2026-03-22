'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarSectionProps {
  title: string;
  isCollapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarSection = ({ title, isCollapsed, children, defaultOpen = true }: SidebarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <div className="mb-4">{children}</div>;
  }

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} 
        />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
};
