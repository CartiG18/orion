'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRotationAngle, getNorthPoleDirection } from '@/lib/astronomy';
import type { CelestialBodyConfig } from '@/data/celestialBodies';
import GraticuleGlobe from '@/components/scene/GraticuleGlobe';

/* ═══════════════════════════════════════════════════════════════════════════
   CelestialBody — Wireframe globe with real-time astronomical rotation
   ─────────────────────────────────────────────────────────────────────────
   Renders a graticule globe and applies:
   1. Axis orientation — body's north pole direction from RotationAxis
   2. Spin rotation — prime meridian angle from RotationAxis, updated per frame

   All per-frame updates happen in useFrame, mutating Three.js transforms
   directly via refs — no React state changes, no re-renders.
   ═══════════════════════════════════════════════════════════════════════════ */

interface CelestialBodyProps {
  config: CelestialBodyConfig;
  color: THREE.Color;
}

/** Reusable temporaries to avoid per-frame allocations */
const _northPole = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quaternion = new THREE.Quaternion();

export default function CelestialBody({ config, color }: CelestialBodyProps) {
  const axisGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);
  const lastAxisUpdateRef = useRef(0);

  // Equator ring — a brighter line at the equator for visual reference
  const equatorGeometry = useMemo(() => {
    const segments = 128;
    const positions: number[] = [];
    const r = config.sceneRadius;

    for (let i = 0; i < segments; i++) {
      const theta1 = (i / segments) * Math.PI * 2;
      const theta2 = ((i + 1) / segments) * Math.PI * 2;
      positions.push(r * Math.cos(theta1), 0, r * Math.sin(theta1));
      positions.push(r * Math.cos(theta2), 0, r * Math.sin(theta2));
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [config.sceneRadius]);

  useFrame(() => {
    if (!axisGroupRef.current || !spinGroupRef.current) return;

    const now = new Date();
    const nowMs = now.getTime();

    // ── Axis orientation (recalculate every 10 seconds — pole barely moves) ──
    if (nowMs - lastAxisUpdateRef.current > 10_000) {
      lastAxisUpdateRef.current = nowMs;

      getNorthPoleDirection(config.id, now, _northPole);

      // Build quaternion that rotates default up (+Y) to the north pole direction
      _quaternion.setFromUnitVectors(_up, _northPole);
      axisGroupRef.current.quaternion.copy(_quaternion);
    }

    // ── Spin rotation (every frame for smooth motion) ──
    const spinDegrees = getRotationAngle(config.id, now);
    // Convert to radians — spin is the angular position of the prime meridian
    // Apply as Y-rotation on the inner group (which is already tilted by the outer group)
    // Positive Y rotation in Three.js correctly matches increasing Right Ascension (Eastward rotation)
    spinGroupRef.current.rotation.y = (spinDegrees * Math.PI) / 180;
  });

  return (
    <group ref={axisGroupRef}>
      <group ref={spinGroupRef}>
        {/* Main graticule grid */}
        <GraticuleGlobe radius={config.sceneRadius} color={color} opacity={0.35} />

        {/* Brighter equator ring */}
        <lineSegments geometry={equatorGeometry}>
          <lineBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} />
        </lineSegments>
      </group>
    </group>
  );
}
