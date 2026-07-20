'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSunDirection } from '@/lib/astronomy';

/* ═══════════════════════════════════════════════════════════════════════════
   SunMarker — Small glowing wireframe sphere positioned in the
   direction of the Sun from the focused body.

   The Sun's real distance would put it absurdly far off-screen, so we
   place it at a fixed visual distance along the correct direction vector.
   The direction is recalculated once per second (sun moves ~1°/day for
   Earth, so per-frame updates would be wasteful).
   ═══════════════════════════════════════════════════════════════════════════ */

interface SunMarkerProps {
  /** Body ID to compute sun direction from (e.g. "earth") */
  bodyId: string;
  /** Distance from origin to place the sun marker (scene units) */
  distance?: number;
  /** Radius of the sun marker sphere (scene units) */
  markerRadius?: number;
  /** Color for the sun marker */
  color: THREE.Color;
}

export default function SunMarker({
  bodyId,
  distance = 6,
  markerRadius = 0.2,
  color,
}: SunMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lastUpdateRef = useRef(0);
  const directionRef = useRef(new THREE.Vector3(1, 0, 0));

  useFrame(() => {
    if (!groupRef.current) return;

    const now = Date.now();

    // Throttle sun direction recalculation to once per second
    if (now - lastUpdateRef.current > 1000) {
      lastUpdateRef.current = now;
      getSunDirection(bodyId, new Date(), directionRef.current);
    }

    // Position the marker along the direction vector
    groupRef.current.position
      .copy(directionRef.current)
      .multiplyScalar(distance);
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe sun sphere */}
      <mesh>
        <icosahedronGeometry args={[markerRadius, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner glow — slightly larger, very faint */}
      <mesh>
        <icosahedronGeometry args={[markerRadius * 1.6, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Point light for subtle depth cue on the main globe */}
      <pointLight
        color={color}
        intensity={0.4}
        distance={distance * 2}
        decay={2}
      />
    </group>
  );
}
