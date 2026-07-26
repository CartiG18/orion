'use client';

import React from 'react';
import PanelWindow from './PanelWindow';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';
import LiveClock from '@/components/LiveClock';
import TypewriterText from '@/components/TypewriterText';

export default function StatusIndicator() {
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const cameraMode = useCelestialStore((s) => s.cameraMode);
  
  const targetName = (CELESTIAL_BODIES[focusedBodyId]?.displayName || 'UNKNOWN').toUpperCase();

  return (
    <PanelWindow id="status-indicator" title="SYSTEM STATUS">
      <div className="flex flex-col gap-4">
        {/* Current Target */}
        <div>
          <div className="text-[10px] crt-text-dim tracking-widest mb-1 opacity-70">CURRENT TARGET</div>
          <div className="text-sm tracking-widest crt-glow font-bold">
            ◇ <TypewriterText text={targetName} playAudio={true} speed={50} />
          </div>
        </div>

        {/* Camera Mode */}
        <div>
          <div className="text-[10px] crt-text-dim tracking-widest mb-1 opacity-70">CAMERA MODE</div>
          <div className="text-sm tracking-widest">
            [<TypewriterText text={cameraMode.toUpperCase()} speed={30} />]
          </div>
        </div>

        {/* Live Clock */}
        <div>
          <div className="text-[10px] crt-text-dim tracking-widest mb-1 opacity-70">SYSTEM TIME</div>
          <div className="text-sm tracking-widest">
            <LiveClock showDate />
          </div>
        </div>

        {/* Decorative elements to fill space and look cool */}
        <div className="mt-4 border-t pt-4 border-dashed opacity-30" style={{ borderColor: 'var(--crt-border)' }}>
          <div className="text-[10px] tracking-widest flex justify-between">
            <span>DATA LINK</span>
            <span>SECURE</span>
          </div>
          <div className="text-[10px] tracking-widest flex justify-between mt-1">
            <span>UPLINK</span>
            <span>99.9%</span>
          </div>
        </div>
      </div>
    </PanelWindow>
  );
}
