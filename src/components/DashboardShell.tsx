'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import SettingsModal from '@/components/SettingsModal';
import LiveClock from '@/components/LiveClock';
import StatusIndicator from '@/components/panels/StatusIndicator';
import AsteroidTracker from '@/components/panels/AsteroidTracker';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';
import TargetSelector from '@/components/TargetSelector';
import { audioManager } from '@/lib/audioManager';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInit = () => {
      audioManager.init();
      window.removeEventListener('pointerdown', handleInit);
      window.removeEventListener('keydown', handleInit);
    };
    window.addEventListener('pointerdown', handleInit);
    window.addEventListener('keydown', handleInit);
    return () => {
      window.removeEventListener('pointerdown', handleInit);
      window.removeEventListener('keydown', handleInit);
    };
  }, []);

  // Glitch effect loop (every 1.5 to 3 minutes)
  useEffect(() => {
    const glitchLoop = () => {
      const nextDelay = 90000 + Math.random() * 90000; // 1.5 to 3 mins
      setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150); // 150ms glitch duration
        glitchLoop();
      }, nextDelay);
    };
    glitchLoop();
  }, []);

  return (
    <div className={`flex flex-col h-full w-full ${isGlitching ? 'glitch-anim' : ''}`}>
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
            onClick={() => {
              const muted = audioManager.toggleMute();
              setIsMuted(muted);
            }}
            className="hover:crt-glow-interactive transition-colors cursor-pointer ml-2"
          >
            [ {isMuted ? 'UNMUTE' : 'MUTE'} ]
          </button>
          <button 
            onClick={() => useSettingsStore.getState().setIsSettingsOpen(true)}
            className="hover:crt-glow-interactive transition-colors cursor-pointer ml-2"
          >
            [ CONFIG ]
          </button>
        </div>
      </header>

      {/* ── Main three-column grid ──────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] min-h-0">
        {/* Left panel — Status Indicator */}
        <aside className="hidden lg:flex flex-col gap-4">
          <StatusIndicator />
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

        {/* Right panel — Asteroid Tracker */}
        <aside className="hidden lg:flex flex-col gap-4">
          <AsteroidTracker />
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


