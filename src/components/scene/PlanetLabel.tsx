'use client';

import { Html } from '@react-three/drei';
import { useCelestialStore } from '@/stores/useCelestialStore';

interface PlanetLabelProps {
  id: string;
  name: string;
  onClick: () => void;
}

export default function PlanetLabel({ id, name, onClick }: PlanetLabelProps) {
  const cameraMode = useCelestialStore((s) => s.cameraMode);
  
  // Hide labels in focus mode to avoid clutter
  if (cameraMode === 'focus') return null;

  return (
    <Html
      center
      // Place the label slightly below the planet 
      position={[0, -1.8, 0]}
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
        className="cursor-pointer select-none whitespace-nowrap transition-opacity hover:opacity-100 opacity-80"
        style={{
          pointerEvents: 'auto', // Re-enable pointer events for the clickable div
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: 'var(--phosphor-primary)',
          textShadow: '0 0 4px rgba(var(--glow-color), 0.5)',
          background: 'var(--crt-bg)', // Slight background to occlude lines behind text
          padding: '2px 6px',
          border: '1px solid var(--phosphor-dim)',
        }}
      >
        [ {name} ]
      </div>
    </Html>
  );
}
