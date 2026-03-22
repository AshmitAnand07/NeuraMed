import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
  badge?: number | string;
  onClick: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed,
  badge,
  onClick
}: SidebarItemProps) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full group relative flex items-center justify-between p-3 mb-1 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive 
          ? 'bg-emerald-100 text-emerald-800 font-semibold' 
          : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 font-medium'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        {!isCollapsed && <span className="text-sm">{label}</span>}
      </div>

      {!isCollapsed && badge && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap hidden md:block">
          {label}
        </div>
      )}
    </button>
  );
};
