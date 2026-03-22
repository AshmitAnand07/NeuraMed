'use client';

import React from 'react';
import { Menu, Activity } from 'lucide-react';

interface MobileHeaderWrapperProps {
  onMenuClick: () => void;
}

export const MobileHeaderWrapper = ({ onMenuClick }: MobileHeaderWrapperProps) => {
  return (
    <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
          <Activity size={18} strokeWidth={2.5} />
        </div>
        <span className="font-extrabold tracking-tight text-gray-900 text-lg">
          Neura<span className="text-emerald-600">Med</span>
        </span>
      </div>
      <button 
        onClick={onMenuClick}
        className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
};
