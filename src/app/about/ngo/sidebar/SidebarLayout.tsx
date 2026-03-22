'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeaderWrapper } from './MobileHeaderWrapper';
import { NavigationProvider } from '../NavigationContext';
import { DataProvider } from '../DataContext';
import { ToastContainer } from '../ToastContainer';

export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <NavigationProvider>
      <DataProvider>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar 
            isMobileOpen={isMobileOpen} 
            onCloseMobile={() => setIsMobileOpen(false)} 
          />
        
          <div className="flex-1 flex flex-col min-w-0">
            <MobileHeaderWrapper onMenuClick={() => setIsMobileOpen(true)} />
            <main className="flex-1 relative">
              {children}
            </main>
          </div>
          <ToastContainer />
        </div>
      </DataProvider>
    </NavigationProvider>
  );
};
