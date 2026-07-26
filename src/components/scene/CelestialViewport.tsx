'use client';

import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useSemanticColors } from '@/hooks/useSemanticColors';
import SolarSystem from '@/components/scene/SolarSystem';
import CameraController from '@/components/scene/CameraController';

/* ═══════════════════════════════════════════════════════════════════════════
   CelestialViewport — R3F Canvas + scene setup
   ─────────────────────────────────────────────────────────────────────────
   Fills its parent container. Renders the SolarSystem and the CameraController.
   ═══════════════════════════════════════════════════════════════════════════ */

function Scene() {
  const colors = useSemanticColors();

  return (
    <>
      <CameraController />
      
      {/* Background stars */}
      <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0.2} />

      {/* We tilt the entire scene group so the Ecliptic plane is horizontal */}
      <group rotation={[23.44 * (Math.PI / 180), 0, 0]}>
        <SolarSystem 
          structureColor={colors.structure}
          interactiveColor={colors.interactive}
        />
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
