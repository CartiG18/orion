'use client';

import { useSettingsStore, TimeZone } from '@/stores/useSettingsStore';
import { useEffect, useState } from 'react';

const TIMEZONES: { id: TimeZone; label: string }[] = [
  { id: 'UTC', label: 'UNIVERSAL COORDINATED (UTC)' },
  { id: 'Local', label: 'LOCAL SYSTEM TIME' },
];

export default function SettingsModal() {
  const isOpen = useSettingsStore((s) => s.isSettingsOpen);
  const { timeZone, setTimeZone, setIsSettingsOpen } = useSettingsStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSettingsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsSettingsOpen]);

  // Wait until mounted so persisted state matches SSR
  if (!mounted || !isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="crt-border flex flex-col max-w-xl w-full" style={{ background: 'var(--crt-bg)' }}>
        {/* Header */}
        <div className="px-4 py-2 text-xs tracking-widest crt-text-dim border-b" style={{ borderColor: 'var(--crt-border)', background: 'var(--crt-dim)' }}>
          ┌ SYSTEM CONFIGURATION
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-8">
          
          {/* Timezone Selection */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold tracking-widest crt-glow">◇ TIME SYNCHRONIZATION</h2>
            <div className="flex flex-col gap-2 pl-4">
              {TIMEZONES.map((tz) => (
                <button
                  key={tz.id}
                  onClick={() => setTimeZone(tz.id)}
                  className={`text-left text-xs tracking-widest py-1 px-2 hover:bg-white/5 transition-colors cursor-pointer ${
                    timeZone === tz.id ? 'crt-glow font-bold before:content-[\'>_\'] before:-ml-4 before:absolute relative' : 'crt-text-dim'
                  }`}
                >
                  [{tz.id.toUpperCase()}] {tz.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer / Close */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--crt-border)' }}>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="text-xs tracking-widest crt-glow-interactive hover:bg-white/5 px-4 py-2 crt-border cursor-pointer"
          >
            [ CLOSE ]
          </button>
        </div>
      </div>
    </div>
  );
}
