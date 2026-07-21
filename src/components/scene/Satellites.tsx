'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSatellites, getSatellitePositionEcef, TrackedSatellite } from '@/lib/satelliteTracking';
import { useCelestialStore } from '@/stores/useCelestialStore';

// 15 minutes of trace, 30 points (one every 30s)
const TRACE_STEPS = 30;
const TRACE_INTERVAL_MS = 30000; 

function Trace({ satrec, color }: { satrec: any; color: THREE.Color }) {
  const lineRef = useRef<any>(null);
  const points = useMemo(() => new Float32Array(TRACE_STEPS * 3), []); 
  const colors = useMemo(() => {
    const arr = new Float32Array(TRACE_STEPS * 3);
    for (let i = 0; i < TRACE_STEPS; i++) {
      // Fade intensity from 1.0 to 0.0 linearly
      const intensity = 1.0 - (i / (TRACE_STEPS - 1));
      arr[i * 3] = color.r * intensity;
      arr[i * 3 + 1] = color.g * intensity;
      arr[i * 3 + 2] = color.b * intensity;
    }
    return arr;
  }, [color]);
  
  useFrame(() => {
    if (!lineRef.current) return;
    
    const now = Date.now();
    const geom = lineRef.current.geometry;
    const positions = geom.attributes.position.array as Float32Array;
    
    const _pos = new THREE.Vector3();
    for (let i = 0; i < TRACE_STEPS; i++) {
      const t = new Date(now - i * TRACE_INTERVAL_MS); 
      getSatellitePositionEcef(satrec, t, _pos);
      positions[i * 3] = _pos.x;
      positions[i * 3 + 1] = _pos.y;
      positions[i * 3 + 2] = _pos.z;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={TRACE_STEPS}
          args={[points, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={TRACE_STEPS}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </line>
  );
}

function SatelliteNode({ sat, color }: { sat: TrackedSatellite; color: THREE.Color }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!meshRef.current) return;
    getSatellitePositionEcef(sat.satrec, new Date(), meshRef.current.position);
  });

  return (
    <group>
      <Trace satrec={sat.satrec} color={color} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function Satellites({ color }: { color: THREE.Color }) {
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const satellites = useSatellites();

  if (focusedBodyId !== 'earth') return null;

  return (
    <group>
      {satellites.map((sat) => (
        <SatelliteNode key={sat.data.noradId} sat={sat} color={color} />
      ))}
    </group>
  );
}
