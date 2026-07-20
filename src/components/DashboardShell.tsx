'use client';

import dynamic from 'next/dynamic';

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
          <SystemClock />
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

            {/* HUD overlay — target label */}
            <div className="absolute bottom-3 left-3 pointer-events-none select-none">
              <div className="text-xs crt-text-dim tracking-widest opacity-70">
                ◇ TARGET: EARTH
              </div>
            </div>
            <div className="absolute bottom-3 right-3 pointer-events-none select-none">
              <div className="text-xs crt-text-dim tracking-widest opacity-70">
                REAL-TIME
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

function SystemClock() {
  // Simple static clock — a real one would tick, but that's out of scope
  return <span suppressHydrationWarning>{new Date().toISOString().slice(11, 19)} UTC</span>;
}
