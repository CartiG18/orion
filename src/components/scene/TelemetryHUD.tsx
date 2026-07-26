'use client';

import { Html } from '@react-three/drei';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';
import { getPlanetPosition } from '@/lib/astronomy';

interface TelemetryHUDProps {
  bodyId: string;
}

export default function TelemetryHUD({ bodyId }: TelemetryHUDProps) {
  const cameraMode = useCelestialStore((s) => s.cameraMode);
  
  if (cameraMode !== 'focus') return null;
  
  const config = CELESTIAL_BODIES[bodyId];
  if (!config) return null;

  const now = new Date();
  const pos = getPlanetPosition(bodyId, now);
  // Approximation of distance from parent (Sun or Earth) in AU based on current positional magnitude
  // This is a rough estimation for flavor. 
  // In a real app we'd compute the distance between the two bodies' Heliocentric vectors.
  let distAU = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);
  
  // For moon, it orbits earth so its helio dist is ~1 AU. 
  // Let's just hardcode some flavor text or approximate it.
  if (bodyId === 'moon') distAU = 0.00256; 

  const distText = distAU.toFixed(4) + ' AU';
  
  // Fake or hardcoded telemetry for flavor, based on the body
  const telemetry = {
    mercury: { rot: '1407.6 hr', orb: '88.0 d' },
    venus: { rot: '-5832.5 hr', orb: '224.7 d' },
    earth: { rot: '23.9 hr', orb: '365.2 d' },
    moon: { rot: '655.7 hr', orb: '27.3 d' },
    mars: { rot: '24.6 hr', orb: '687.0 d' },
    jupiter: { rot: '9.9 hr', orb: '4331 d' },
    saturn: { rot: '10.7 hr', orb: '10747 d' },
    uranus: { rot: '-17.2 hr', orb: '30589 d' },
    neptune: { rot: '16.1 hr', orb: '59800 d' }
  }[bodyId] || { rot: 'UNKNOWN', orb: 'UNKNOWN' };

  return (
    <Html
      position={[config.sceneRadius * 1.5, config.sceneRadius * 1.5, 0]}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[50, 0]}
    >
      <div className="flex flex-col font-mono text-[10px] tracking-widest text-left whitespace-nowrap crt-glow opacity-80 pl-8 border-l border-dashed" style={{ borderColor: 'var(--color-structure)' }}>
        <div className="mb-1 font-bold border-b border-dashed pb-1" style={{ borderColor: 'var(--color-structure)' }}>
          {config.displayName.toUpperCase()} TELEMETRY
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-x-2">
          <span className="opacity-70">DIST:</span>
          <span>{distText}</span>
          
          <span className="opacity-70">ROTATION:</span>
          <span>{telemetry.rot}</span>
          
          <span className="opacity-70">ORBIT:</span>
          <span>{telemetry.orb}</span>
        </div>
      </div>
    </Html>
  );
}
