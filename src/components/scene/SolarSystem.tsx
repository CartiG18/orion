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

function OrbitRing({ bodyId, color }: { bodyId: string; color: THREE.Color }) {
  const geometry = useMemo(() => {
    const period = ORBITAL_PERIODS[bodyId] || 365.25;
    const segments = 128;
    const positions: number[] = [];
    
    // Sample a full orbit starting from J2000 or current date
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    for (let i = 0; i <= segments; i++) {
      const fraction = i / segments;
      const date = new Date(now + fraction * period * msPerDay);
      // getPlanetPosition handles distance compression and coordinate mapping
      const pos = getPlanetPosition(bodyId, date);
      positions.push(pos.x, pos.y, pos.z);
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [bodyId]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
    </line>
  );
}

interface PlanetNodeProps {
  bodyId: string;
  color: THREE.Color;
}

function PlanetNode({ bodyId, color }: PlanetNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const config = CELESTIAL_BODIES[bodyId];
  
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const setFocusedBody = useCelestialStore((s) => s.setFocusedBody);
  const cameraMode = useCelestialStore((s) => s.cameraMode);

  const isFocused = focusedBodyId === bodyId;

  // Update position every frame
  useFrame(() => {
    if (!groupRef.current) return;
    // We update position based on current time. 
    // In focus mode, the camera will track this dynamic position.
    getPlanetPosition(bodyId, new Date(), groupRef.current.position);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isFocused) {
      setFocusedBody(bodyId);
    }
  };

  // Performance: hide distant bodies if not focused to save draw calls in Focus Mode.
  const isVisible = cameraMode === 'overview' || isFocused;

  if (!isVisible) return null;

  return (
    <>
      {/* The orbit path centered at the Sun */}
      <OrbitRing bodyId={bodyId} color={color} />

      <group ref={groupRef} onClick={handleClick}>
        <CelestialBody config={config} color={color} />
        <PlanetLabel id={bodyId} name={config.displayName} onClick={() => setFocusedBody(bodyId)} />
      </group>
    </>
  );
}

interface SolarSystemProps {
  color: THREE.Color;
}

export default function SolarSystem({ color }: SolarSystemProps) {
  const bodyIds = Object.keys(CELESTIAL_BODIES);

  return (
    <group>
      {/* The Central Sun */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} wireframe />
      </mesh>
      
      <pointLight color={color} intensity={1.5} distance={200} decay={1.5} />

      {/* Planets and Moon */}
      {bodyIds.map((id) => (
        <PlanetNode key={id} bodyId={id} color={color} />
      ))}
    </group>
  );
}
