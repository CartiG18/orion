'use client';

import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { audioManager } from '@/lib/audioManager';

interface LockOnReticleProps {
  bodyId: string;
}

export default function LockOnReticle({ bodyId }: LockOnReticleProps) {
  const config = CELESTIAL_BODIES[bodyId];
  const [animating, setAnimating] = useState(false);
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);

  // Trigger animation whenever the focused body changes to us
  useEffect(() => {
    if (focusedBodyId === bodyId) {
      setAnimating(true);
      audioManager.playLockOn();
      const timer = setTimeout(() => setAnimating(false), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [focusedBodyId, bodyId]);

  if (!config || focusedBodyId !== bodyId || !animating) return null;

  return (
    <Html
      center
      position={[0, 0, 0]}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[10, 0]}
    >
      <div 
        className="lock-on-reticle flex items-center justify-center relative"
        style={{
          width: `${(config.sceneRadius + 1.0) * 50}px`,
          height: `${(config.sceneRadius + 1.0) * 50}px`,
        }}
      >
        <div className="absolute top-0 left-0 border-t-2 border-l-2 border-[var(--color-interactive)] w-4 h-4 animate-reticle-tl" />
        <div className="absolute top-0 right-0 border-t-2 border-r-2 border-[var(--color-interactive)] w-4 h-4 animate-reticle-tr" />
        <div className="absolute bottom-0 left-0 border-b-2 border-l-2 border-[var(--color-interactive)] w-4 h-4 animate-reticle-bl" />
        <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-[var(--color-interactive)] w-4 h-4 animate-reticle-br" />
      </div>
    </Html>
  );
}
