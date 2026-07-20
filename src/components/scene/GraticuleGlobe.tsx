'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
   GraticuleGlobe — Latitude/Longitude line grid
   ─────────────────────────────────────────────────────────────────────────
   Generates a wireframe globe using latitude circles and longitude meridians
   rendered as LineSegments. This gives the clean "radar/HUD globe" look
   rather than the tessellated triangle mesh you'd get from Three.js's
   wireframe mode on a SphereGeometry.

   Configuration:
   - latStep: degrees between latitude circles (default 15° → 11 circles)
   - lonStep: degrees between longitude meridians (default 15° → 24 meridians)
   - segments: number of line segments per circle/meridian (default 72)
   ═══════════════════════════════════════════════════════════════════════════ */

interface GraticuleGlobeProps {
  /** Radius of the sphere in scene units */
  radius: number;
  /** Color for the line material */
  color: THREE.Color;
  /** Degrees between latitude circles (default 15) */
  latStep?: number;
  /** Degrees between longitude meridians (default 15) */
  lonStep?: number;
  /** Line segments per circle/meridian (default 72) */
  segments?: number;
  /** Base opacity for the lines (default 0.6) */
  opacity?: number;
}

export default function GraticuleGlobe({
  radius,
  color,
  latStep = 15,
  lonStep = 15,
  segments = 72,
  opacity = 0.6,
}: GraticuleGlobeProps) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const DEG2RAD = Math.PI / 180;

    // ── Latitude circles ──────────────────────────────────────────────
    // Skip poles (±90°) — they'd be degenerate points
    for (let lat = -90 + latStep; lat < 90; lat += latStep) {
      const phi = (90 - lat) * DEG2RAD; // colatitude
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;

        // Point 1
        positions.push(
          radius * sinPhi * Math.cos(theta1),
          radius * cosPhi,
          radius * sinPhi * Math.sin(theta1),
        );
        // Point 2
        positions.push(
          radius * sinPhi * Math.cos(theta2),
          radius * cosPhi,
          radius * sinPhi * Math.sin(theta2),
        );
      }
    }

    // ── Longitude meridians ───────────────────────────────────────────
    for (let lon = 0; lon < 360; lon += lonStep) {
      const theta = lon * DEG2RAD;

      for (let i = 0; i < segments; i++) {
        const phi1 = (i / segments) * Math.PI;
        const phi2 = ((i + 1) / segments) * Math.PI;

        // Point 1
        positions.push(
          radius * Math.sin(phi1) * Math.cos(theta),
          radius * Math.cos(phi1),
          radius * Math.sin(phi1) * Math.sin(theta),
        );
        // Point 2
        positions.push(
          radius * Math.sin(phi2) * Math.cos(theta),
          radius * Math.cos(phi2),
          radius * Math.sin(phi2) * Math.sin(theta),
        );
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [radius, latStep, lonStep, segments]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}
