'use client';
import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function ThemeSyncer() {
  const theme = useSettingsStore((s) => s.theme);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-phosphor', theme);
  }, [theme]);

  return null;
}
