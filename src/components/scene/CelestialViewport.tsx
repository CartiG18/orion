'use client';

import { Canvas } from '@react-three/fiber';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { getBodyConfig } from '@/data/celestialBodies';
import { usePhosphorColor } from '@/hooks/usePhosphorColor';
import CelestialBody from '@/components/scene/CelestialBody';
import SunMarker from '@/components/scene/SunMarker';

/* ═══════════════════════════════════════════════════════════════════════════
   CelestialViewport — R3F Canvas + scene setup
   ─────────────────────────────────────────────────────────────────────────
   Fills its parent container. Reads focusedBodyId from Zustand and renders
   the corresponding CelestialBody + SunMarker.

   Camera: fixed 3/4 view, no controls (OrbitControls is Phase 2).
   Lighting: minimal ambient — wireframe materials don't need much.
   ═══════════════════════════════════════════════════════════════════════════ */

function Scene() {
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const phosphorColor = usePhosphorColor();

  const config = getBodyConfig(focusedBodyId);

  // Rotate the scene so the Ecliptic plane is horizontal (XZ plane).
  // In our mapped EQJ scene, the vernal equinox is +X. We rotate around X
  // by the obliquity of the ecliptic (~23.44°) to tilt the Earth's axis.
  const eclipticTilt = (23.4392911 * Math.PI) / 180;

  return (
    <group rotation={[eclipticTilt, 0, 0]}>
      {/* Minimal ambient light — just enough for subtle depth on wireframes */}
      <ambientLight intensity={0.08} />

      {/* The focused celestial body */}
      <CelestialBody config={config} color={phosphorColor} />

      {/* Sun direction marker */}
      <SunMarker bodyId={focusedBodyId} color={phosphorColor} />
    </group>
  );
}

export default function CelestialViewport() {
  return (
    <Canvas
      camera={{
        position: [2.5, 1.8, 3.5],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'default',
      }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}
