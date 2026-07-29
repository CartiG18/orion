'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSatellites, getSatellitePositionEcef, TrackedSatellite } from '@/lib/satelliteTracking';
import { useCelestialStore } from '@/stores/useCelestialStore';

// 15 minutes of trace, 15 points (one every 60s) to maintain performance with ~100 satellites
const TRACE_STEPS = 15;
const TRACE_INTERVAL_MS = 60000; 

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
  
  const lastUpdateRef = useRef(0);
  
  useFrame(() => {
    if (!lineRef.current) return;
    
    const now = Date.now();
    // Performance: Throttle trace propagation to once every 2 seconds
    if (now - lastUpdateRef.current < 2000) return;
    lastUpdateRef.current = now;
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
    
    // Hide trace if the latest position is exactly at Earth center (decayed/invalid TLE)
    if (_pos.lengthSq() < 0.001) {
      lineRef.current.visible = false;
    } else {
      lineRef.current.visible = true;
    }
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
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!groupRef.current) return;
    getSatellitePositionEcef(sat.satrec, new Date(), groupRef.current.position);
    
    // Hide node if the position is exactly at Earth center (decayed/invalid TLE)
    if (groupRef.current.position.lengthSq() < 0.001) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }
  });

  const displayName = useMemo(() => {
    const raw = (sat.data.name || 'SAT').toUpperCase();
    return raw.length > 12 ? raw.slice(0, 12).trim() : raw;
  }, [sat.data.name]);

  const colorHex = useMemo(() => '#' + color.getHexString(), [color]);

  return (
    <group>
      <Trace satrec={sat.satrec} color={color} />
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <Html
          position={[0.025, 0.01, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[100, 0]}
        >
          <div 
            className="font-mono text-[9px] tracking-wider whitespace-nowrap opacity-75 select-none crt-glow"
            style={{ color: colorHex }}
          >
            {displayName}
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function Satellites({ color }: { color: THREE.Color }) {
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const cameraMode = useCelestialStore((s) => s.cameraMode);
  const satellites = useSatellites();
  const visibleSatellites = useCelestialStore((s) => s.visibleSatellites);

  const displayedSatellites = useMemo(() => {
    return satellites.filter((sat) => visibleSatellites.includes(sat.data.noradId));
  }, [satellites, visibleSatellites]);

  // VISIBILITY RULE: satellites only render when Earth is focused at the tightest zoom level
  if (focusedBodyId !== 'earth' || cameraMode !== 'focus') return null;
  
  if (displayedSatellites.length === 0) return null;

  return (
    <group>
      {displayedSatellites.map((sat) => (
        <SatelliteNode key={sat.data.noradId} sat={sat} color={color} />
      ))}
    </group>
  );
}
