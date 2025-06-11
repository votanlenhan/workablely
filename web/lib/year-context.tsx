'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface YearContextType {
  currentYear: number;
  setCurrentYear: (year: number) => void;
  nextYear: () => void;
  previousYear: () => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState(2024); // Default fallback year
  const [isClient, setIsClient] = useState(false);

  // Hydration-safe initialization
  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const nextYear = () => setCurrentYear(prev => prev + 1);
  const previousYear = () => setCurrentYear(prev => prev - 1);

  return (
    <YearContext.Provider value={{
      currentYear,
      setCurrentYear,
      nextYear,
      previousYear
    }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
} 