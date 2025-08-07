import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from "react";
import type { DisplayUnit } from '../lib/unitConverter';

interface UnitDisplayContextType {
  displayUnit: DisplayUnit;
  setDisplayUnit: (unit: DisplayUnit) => void;
}

const UnitDisplayContext = createContext<UnitDisplayContextType | undefined>(undefined);

export const UnitDisplayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>(() => {
    // Initialize from localStorage or default to 'cBTC'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jenga_display_unit') as DisplayUnit) || 'cBTC';
    }
    return 'cBTC';
  });

  useEffect(() => {
    // Persist to localStorage whenever displayUnit changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('jenga_display_unit', displayUnit);
    }
  }, [displayUnit]);

  return (
    <UnitDisplayContext.Provider value={{ displayUnit, setDisplayUnit }}>
      {children}
    </UnitDisplayContext.Provider>
  );
};

export const useUnitDisplay = () => {
  const context = useContext(UnitDisplayContext);
  if (context === undefined) {
    throw new Error('useUnitDisplay must be used within a UnitDisplayProvider');
  }
  return context;
};
