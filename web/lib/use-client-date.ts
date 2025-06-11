'use client';

import { useState, useEffect } from 'react';

export function useClientDate() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  const getCurrentDate = () => {
    if (!isClient) return '';
    return new Date().toISOString().split('T')[0];
  };

  const getCurrentDatetime = () => {
    if (!isClient) return '';
    return new Date().toISOString();
  };

  const getToday = () => {
    if (!isClient) return new Date('2024-01-01'); // Fallback date
    return new Date();
  };

  return {
    isClient,
    currentDate,
    getCurrentDate,
    getCurrentDatetime,
    getToday
  };
}

export function useHydrationSafeDate(fallbackDate: string = '2024-01-01') {
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState(fallbackDate);

  useEffect(() => {
    setIsClient(true);
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  return { isClient, date };
} 