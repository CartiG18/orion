'use client';

import { Canvas } from '@react-three/fiber';
import { usePhosphorColor } from '@/hooks/usePhosphorColor';
import SolarSystem from '@/components/scene/SolarSystem';
import CameraController from '@/components/scene/CameraController';

/* ═══════════════════════════════════════════════════════════════════════════
   CelestialViewport — R3F Canvas + scene setup
   ─────────────────────────────────────────────────────────────────────────
   Fills its parent container. Renders the SolarSystem and the CameraController.
   ═══════════════════════════════════════════════════════════════════════════ */

function Scene() {
  const phosphorColor = usePhosphorColor();

  return (
    <>
      <CameraController />
      
      {/* We tilt the entire scene group so the Ecliptic plane is horizontal */}
      <group rotation={[23.44 * (Math.PI / 180), 0, 0]}>
        <SolarSystem color={phosphorColor} />
      </group>
    </>
  );
}

export default function CelestialViewport() {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 500, // Make sure far plane is big enough for overview mode
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
    </div>
  );
}
