'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from '../NavigationContext';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { 
  Home, 
  Inbox, 
  Truck, 
  Package, 
  HeartHandshake, 
  Bell, 
  Activity, 
  Building2, 
  Settings, 
  LogOut, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { activeSection, setActiveSection } = useNavigation();

  // On mobile, never actually collapse the sidebar width, just handle closing the drawer.
  // We'll reset collapse state if window resizes to mobile.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { icon: Home, label: 'Overview', id: 'Overview' },
        { icon: Inbox, label: 'Requests', id: 'Requests', badge: 12 },
        { icon: Truck, label: 'Pickups', id: 'Pickups' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { icon: Package, label: 'Inventory', id: 'Inventory' },
        { icon: HeartHandshake, label: 'Distribution', id: 'Distribution' },
      ]
    },
    {
      title: 'MONITORING',
      items: [
        { icon: Bell, label: 'Alerts', id: 'Alerts', badge: 3 },
        { icon: Activity, label: 'Activity Logs', id: 'Activity' },
      ]
    },
    {
      title: 'ORGANIZATION',
      items: [
        { icon: Building2, label: 'NGO Profile', id: 'Profile' },
        { icon: Settings, label: 'Settings', id: 'Profile' }, // Temporarily mapping settings to profile
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:shadow-none
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-4 md:p-6 mb-2">
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm shrink-0">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold tracking-tight text-gray-900 text-xl whitespace-nowrap">
              Neura<span className="text-emerald-600">Med</span>
            </span>
          </div>

          {/* Core Icon when collapsed */}
          {isCollapsed && !isMobileOpen && (
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm shrink-0 mx-auto">
              <Activity size={20} strokeWidth={2.5} />
            </div>
          )}

          {/* Mobile Close Button */}
          <button onClick={onCloseMobile} className="md:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg">
               <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 scrollbar-hide pb-4">
          {navGroups.map((group, idx) => (
            <SidebarSection 
              key={idx} 
              title={group.title} 
              isCollapsed={isCollapsed && !isMobileOpen}
            >
              {group.items.map((item, itemIdx) => (
                <SidebarItem 
                  key={itemIdx}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeSection === item.id}
                  isCollapsed={isCollapsed && !isMobileOpen}
                  badge={item.badge}
                  onClick={() => { 
                    setActiveSection(item.id as any);
                    if(window.innerWidth < 768) onCloseMobile();
                  }}
                />
              ))}
            </SidebarSection>
          ))}
        </div>

        {/* Footer Profile & Toggle */}
        <div className="p-4 border-t border-gray-100 mt-auto bg-slate-50/50">
           <div className={`flex items-center gap-3 mb-4 overflow-hidden transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'justify-center mb-0' : ''}`}>
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0 ring-2 ring-white shadow-sm">
               HF
             </div>
             {(!isCollapsed || isMobileOpen) && (
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-gray-900 truncate">Hope Foundation</p>
                 <p className="text-xs font-medium text-emerald-600 truncate">Verified NGO</p>
               </div>
             )}
           </div>
           
           {(!isCollapsed || isMobileOpen) && (
             <button className="flex items-center gap-2 w-full p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium mt-1">
               <LogOut className="w-4 h-4" />
               <span>Log out</span>
             </button>
           )}
        </div>

      </aside>
    </>
  );
};
