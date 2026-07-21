'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import SettingsModal from '@/components/SettingsModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';
import TargetSelector from '@/components/TargetSelector';

/**
 * DashboardShell — main layout scaffold.
 * Three-column grid: left telemetry panel, center 3D viewport, right comms panel.
 *
 * The CelestialViewport is loaded dynamically with SSR disabled because
 * Three.js / R3F requires browser APIs (WebGL, canvas) not available on the server.
 */
const CelestialViewport = dynamic(
  () => import('@/components/scene/CelestialViewport'),
  { ssr: false },
);

export default function DashboardShell() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Top status bar ──────────────────────────────────────────────── */}
      <header
        className="crt-border flex items-center justify-between px-4 py-2 text-xs tracking-widest select-none shrink-0"
        style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
      >
        <div className="flex items-center gap-3">
          <span className="crt-glow font-bold text-sm">◆ ORION</span>
          <span className="crt-text-dim">SYSTEMS TERMINAL v0.1</span>
        </div>
        <div className="flex items-center gap-4 crt-text-dim">
          <span>SECTOR 7-G</span>
          <span className="crt-flicker">● ONLINE</span>
          <LiveClock />
          <button 
            onClick={() => useSettingsStore.getState().setIsSettingsOpen(true)}
            className="hover:crt-glow transition-colors cursor-pointer ml-2"
          >
            [ CONFIG ]
          </button>
        </div>
      </header>

      {/* ── Main three-column grid ──────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] min-h-0">
        {/* Left panel — telemetry */}
        <aside className="hidden lg:flex flex-col crt-border" style={{ borderLeft: 'none' }}>
          <PanelHeader label="TELEMETRY FEED" />
          <div className="flex-1 flex items-center justify-center p-4">
            <span className="crt-text-dim text-xs text-center leading-relaxed tracking-wide">
              {'[ AWAITING\nDATA STREAM ]'}
            </span>
          </div>
          <PanelFooter label="CH-01 // IDLE" />
        </aside>

        {/* Center panel — 3D celestial viewport */}
        <main className="flex flex-col crt-border relative overflow-hidden">
          <PanelHeader label="MAIN VIEWPORT" />
          <div className="flex-1 relative min-h-0">
            <CelestialViewport />

            {/* HUD overlay — target selector widget */}
            <TargetSelector />
            <div className="absolute bottom-3 right-3 pointer-events-none select-none text-right">
              <div className="text-xs crt-text-dim tracking-widest opacity-70">
                REAL-TIME
              </div>
              <div className="text-[10px] crt-text-dim tracking-widest opacity-50 mt-1">
                <LiveClock showDate />
              </div>
            </div>
          </div>
          <PanelFooter label="MODE: TRACKING" />
        </main>

        {/* Right panel — comms log */}
        <aside className="hidden lg:flex flex-col crt-border" style={{ borderRight: 'none' }}>
          <PanelHeader label="COMMS LOG" />
          <div className="flex-1 flex items-center justify-center p-4">
            <span className="crt-text-dim text-xs text-center leading-relaxed tracking-wide">
              {'[ NO ACTIVE\nTRANSMISSIONS ]'}
            </span>
          </div>
          <PanelFooter label="CH-09 // MONITORING" />
        </aside>
      </div>

      {/* ── Bottom status bar ───────────────────────────────────────────── */}
      <footer
        className="crt-border flex items-center justify-between px-4 py-1.5 text-xs crt-text-dim tracking-wider select-none shrink-0"
        style={{ borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
      >
        <span>ORION MONITORING SYSTEM // PHASE 1</span>
        <span className="opacity-50">ALL SYSTEMS NOMINAL</span>
      </footer>

      <SettingsModal />
    </div>
  );
}

/* ── Subcomponents ────────────────────────────────────────────────────────── */

function PanelHeader({ label }: { label: string }) {
  return (
    <div
      className="px-3 py-1.5 text-xs tracking-widest crt-text-dim select-none shrink-0"
      style={{
        borderBottom: '1px solid var(--crt-border)',
        background: 'var(--crt-dim)',
      }}
    >
      ┌ {label}
    </div>
  );
}

function PanelFooter({ label }: { label: string }) {
  return (
    <div
      className="px-3 py-1 text-xs tracking-wider crt-text-dim select-none shrink-0 opacity-60"
      style={{ borderTop: '1px solid var(--crt-border)' }}
    >
      └ {label}
    </div>
  );
}


function LiveClock({ showDate = false }: { showDate?: boolean }) {
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

