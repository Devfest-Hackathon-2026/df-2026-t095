'use client';
import { useEffect, useState } from 'react';

const visibleMs = 4200;

export function useToast() {
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), visibleMs);
    return () => clearTimeout(timer);
  }, [toast]);
  return [toast, setToast] as const;
}
