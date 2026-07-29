'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { getPlanetPosition } from '@/lib/astronomy';
import CelestialBody from '@/components/scene/CelestialBody';
import PlanetLabel from '@/components/scene/PlanetLabel';
import SunMarker from '@/components/scene/SunMarker';
import TelemetryHUD from '@/components/scene/TelemetryHUD';
import LockOnReticle from '@/components/scene/LockOnReticle';

const ORBITAL_PERIODS: Record<string, number> = {
  mercury: 88,
  venus: 225,
  earth: 365.25,
  moon: 27.3,
  mars: 687,
  jupiter: 4333,
  saturn: 10759,
  uranus: 30688,
  neptune: 60182,
};

function OrbitRing({ bodyId, color, dimmed }: { bodyId: string; color: THREE.Color, dimmed?: boolean }) {
  const geometry = useMemo(() => {
    const period = ORBITAL_PERIODS[bodyId] || 365.25;
    const segments = 128;
    const positions: number[] = [];
    
    // Sample a full orbit starting from J2000 or current date
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // For the moon, we want the ring to be centered on Earth's *current* position, 
    // rather than dragging across space as Earth moves over the 27-day trace.
    const currentEarthPos = bodyId === 'moon' ? getPlanetPosition('earth', now) : null;

    for (let i = 0; i <= segments; i++) {
      const fraction = i / segments;
      const date = new Date(now.getTime() + fraction * period * msPerDay);
      const pos = getPlanetPosition(bodyId, date);
      
      if (bodyId === 'moon' && currentEarthPos) {
        const futureEarthPos = getPlanetPosition('earth', date);
        // Extract Moon's relative offset and anchor it to Earth's current position
        pos.sub(futureEarthPos).add(currentEarthPos);
      }
      
      positions.push(pos.x, pos.y, pos.z);
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [bodyId]);

  return (
    // @ts-expect-error TypeScript confuses R3F <line> with SVG <line>
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={dimmed ? 0.03 : 0.15} depthWrite={false} />
    </line>
  );
}

interface PlanetNodeProps {
  bodyId: string;
  structureColor: THREE.Color;
  interactiveColor: THREE.Color;
}

function PlanetNode({ bodyId, structureColor, interactiveColor }: PlanetNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const config = CELESTIAL_BODIES[bodyId];
  
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const setFocusedBody = useCelestialStore((s) => s.setFocusedBody);
  const cameraMode = useCelestialStore((s) => s.cameraMode);

  const isFocused = focusedBodyId === bodyId;

  // If not overview and not in the focused family, the planet is dimmed (backgrounded)
  const isOverview = cameraMode === 'overview';
  const focusedConfig = CELESTIAL_BODIES[focusedBodyId];
  const focusedParent = focusedConfig?.parentId || focusedBodyId;
  const thisParent = config?.parentId || bodyId;
  const isFamily = focusedParent === thisParent;
  const dimmed = !isOverview && !isFamily;

  const lastUpdateRef = useRef(0);

  // Update position every frame
  useFrame(() => {
    if (!groupRef.current) return;
    
    const now = Date.now();
    // Performance: Throttle position updates to once per second for distant/dimmed bodies
    if (dimmed && now - lastUpdateRef.current < 1000) return;
    lastUpdateRef.current = now;
    
    // We update position based on current time. 
    // In focus mode, the camera will track this dynamic position.
    getPlanetPosition(bodyId, new Date(now), groupRef.current.position);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isFocused) {
      setFocusedBody(bodyId);
    }
  };

  // In 'focus' or 'system' modes, we render the body if it belongs to the same family 
  // as the focused body (e.g. Earth + Moon render together regardless of which is focused)

  const scale = dimmed ? 0.3 : 1;

  return (
    <>
      {/* The orbit path centered at the Sun */}
      <OrbitRing bodyId={bodyId} color={structureColor} dimmed={dimmed} />

      <group ref={groupRef} onClick={handleClick} scale={scale}>
        <CelestialBody config={config} color={structureColor} dimmed={dimmed} />
        <PlanetLabel id={bodyId} name={config.displayName} onClick={() => setFocusedBody(bodyId)} dimmed={dimmed} interactiveColor={interactiveColor} />
        {isFocused && <TelemetryHUD bodyId={bodyId} />}
        <LockOnReticle bodyId={bodyId} />
      </group>
    </>
  );
}

interface SolarSystemProps {
  structureColor: THREE.Color;
  interactiveColor: THREE.Color;
}

export default function SolarSystem({ structureColor, interactiveColor }: SolarSystemProps) {
  const bodyIds = Object.keys(CELESTIAL_BODIES);

  return (
    <group>
      {/* The Central Sun */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color={structureColor} transparent opacity={0.9} wireframe />
      </mesh>
      
      <pointLight color={structureColor} intensity={1.5} distance={200} decay={1.5} />

      {/* Planets and Moon */}
      {bodyIds.map((id) => (
        <PlanetNode key={id} bodyId={id} structureColor={structureColor} interactiveColor={interactiveColor} />
      ))}
    </group>
  );
}
