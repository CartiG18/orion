'use client';

import { Html } from '@react-three/drei';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';

interface PlanetLabelProps {
  id: string;
  name: string;
  onClick: () => void;
  dimmed?: boolean;
  interactiveColor?: any; // To accept the prop passed from SolarSystem
}

export default function PlanetLabel({ id, name, onClick, dimmed }: PlanetLabelProps) {
  const config = CELESTIAL_BODIES[id];
  const offset = config ? -(config.sceneRadius + 0.4) : -1.8;

  return (
    <Html
      center
      // Place the label slightly below the planet 
      position={[0, offset, 0]}
      style={{
        pointerEvents: 'none', // We'll handle clicks on a wrapper if needed, or enable it here
      }}
      zIndexRange={[100, 0]}
    >
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`cursor-pointer select-none whitespace-nowrap transition-opacity hover:opacity-100 ${dimmed ? 'opacity-30' : 'opacity-80'}`}
        style={{
          pointerEvents: 'auto', // Re-enable pointer events for the clickable div
          fontFamily: 'var(--font-mono)',
          fontSize: dimmed ? '8px' : '10px',
          letterSpacing: '0.2em',
          color: 'var(--color-interactive)',
          textShadow: dimmed ? 'none' : '0 0 4px rgba(var(--rgb-interactive), 0.5)',
          background: dimmed ? 'transparent' : 'var(--crt-bg)',
          padding: '2px 6px',
          border: dimmed ? 'none' : '1px solid var(--color-interactive)',
          transform: dimmed ? 'scale(0.8)' : 'scale(1)',
          transformOrigin: 'top center',
        }}
      >
        [ {name} ]
      </div>
    </Html>
  );
}
