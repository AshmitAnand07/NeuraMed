'use client';

import React, { createContext, useContext, useState } from 'react';

type ActiveSection = 
  | 'Overview' 
  | 'Requests' 
  | 'Pickups' 
  | 'Inventory' 
  | 'Distribution' 
  | 'Alerts' 
  | 'Activity' 
  | 'Profile';

interface NavigationContextType {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('Overview');

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
