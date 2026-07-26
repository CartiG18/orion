'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function LiveClock({ showDate = false }: { showDate?: boolean }) {
  const [time, setTime] = useState('');
  const timeZone = useSettingsStore((s) => s.timeZone);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (timeZone === 'UTC') {
        if (showDate) {
          const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.');
          const timeStr = now.toISOString().slice(11, 19);
          setTime(`${dateStr} ${timeStr} UTC`);
        } else {
          setTime(now.toISOString().slice(11, 19) + ' UTC');
        }
      } else {
        if (showDate) {
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const timeStr = now.toTimeString().slice(0, 8);
          setTime(`${year}.${month}.${day} ${timeStr} LCL`);
        } else {
          setTime(now.toTimeString().slice(0, 8) + ' LCL');
        }
      }
    };
    
    update(); // Initial set
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [showDate, timeZone]);

  if (!mounted) return <span suppressHydrationWarning>{showDate ? '0000.00.00 00:00:00 UTC' : '00:00:00 UTC'}</span>;
  return <span>{time}</span>;
}
