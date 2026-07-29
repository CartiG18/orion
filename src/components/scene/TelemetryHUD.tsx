'use client';

import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { getBodyConfig } from '@/data/celestialBodies';
import { HelioVector } from 'astronomy-engine';

interface TelemetryHUDProps {
  bodyId: string;
}

export default function TelemetryHUD({ bodyId }: TelemetryHUDProps) {
  const cameraMode = useCelestialStore((s) => s.cameraMode);
  const showTelemetry = useCelestialStore((s) => s.showTelemetry);
  const { camera, size } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const config = getBodyConfig(bodyId);

  // Dynamically calculate the planet's exact screen pixel radius each frame
  // by measuring true world distance between camera and planet center.
  useFrame(() => {
    if (!config || !hudRef.current || !groupRef.current || !showTelemetry) return;

    const perspCam = camera as THREE.PerspectiveCamera;
    const planetWorldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(planetWorldPos);

    // Real world distance from camera to planet center
    const dist = camera.position.distanceTo(planetWorldPos);
    if (dist <= 0) return;

    const fovRad = (perspCam.fov * Math.PI) / 180;
    const visibleHeight = 2 * dist * Math.tan(fovRad / 2);

    // Dynamic screen pixel radius of the body
    const planetPixelRadius = (config.sceneRadius / visibleHeight) * size.height;
    
    // 24px gap outside the planet's outer circumference
    const gap = 24;
    const offset = planetPixelRadius + gap;

    hudRef.current.style.transform = `translate(calc(-100% - ${offset}px), -50%)`;
  });

  if (cameraMode !== 'focus' || !showTelemetry || !config) return null;

  const now = new Date();
  let distAU = 0;
  if (config.astronomyEngineBody) {
    const hv = HelioVector(config.astronomyEngineBody, now);
    distAU = Math.sqrt(hv.x * hv.x + hv.y * hv.y + hv.z * hv.z);
  }

  const distText = distAU.toFixed(4) + ' AU';
  
  // Telemetry details based on the body
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
    <group ref={groupRef}>
      <Html
        position={[0, 0, 0]}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[50, 0]}
      >
        <div 
          ref={hudRef}
          className="relative flex flex-col font-mono text-[10px] tracking-widest text-right whitespace-nowrap crt-glow opacity-80 pr-4 border-r border-dashed select-none" 
          style={{ 
            borderColor: 'var(--color-structure)',
            transform: 'translate(-100%, -50%)',
          }}
        >
          {/* Horizontal leader line extending to the planet circumference */}
          <div 
            className="absolute right-[-24px] top-1/2 w-6 border-t border-dashed pointer-events-none" 
            style={{ borderColor: 'var(--color-structure)' }}
          />

          <div 
            className="mb-1 font-bold border-b border-dashed pb-1" 
            style={{ borderColor: 'var(--color-structure)' }}
          >
            {config.displayName.toUpperCase()} TELEMETRY
          </div>
          <div className="grid grid-cols-[auto_auto] gap-x-3 justify-end text-right">
            <span className="opacity-70">DIST:</span>
            <span>{distText}</span>
            
            <span className="opacity-70">ROTATION:</span>
            <span>{telemetry.rot}</span>
            
            <span className="opacity-70">ORBIT:</span>
            <span>{telemetry.orb}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
