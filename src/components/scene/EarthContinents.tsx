'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { continentOutlines } from '@/data/continentOutlines';

/* ═══════════════════════════════════════════════════════════════════════════
   EarthContinents — Vector continent outlines
   ─────────────────────────────────────────────────────────────────────────
   Renders geographic boundaries of continents as vector lines, mapped to the
   spherical coordinates of the globe. Positioned slightly above the surface 
   to prevent Z-fighting with the graticule.
   ═══════════════════════════════════════════════════════════════════════════ */

interface EarthContinentsProps {
  radius: number;
  color: THREE.Color;
  opacity?: number;
}

export default function EarthContinents({
  radius,
  color,
  opacity = 0.65,
}: EarthContinentsProps) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const DEG2RAD = Math.PI / 180;
    
    // Elevate slightly above the graticule globe to prevent Z-fighting
    const R = radius * 1.002;

    for (const polyline of continentOutlines) {
      if (polyline.length < 2) continue;
      
      for (let i = 0; i < polyline.length - 1; i++) {
        const p1 = polyline[i];
        const p2 = polyline[i + 1];

        const lon1 = p1[0] * DEG2RAD;
        const lat1 = p1[1] * DEG2RAD;
        const lon2 = p2[0] * DEG2RAD;
        const lat2 = p2[1] * DEG2RAD;

        const cosLat1 = Math.cos(lat1);
        const cosLat2 = Math.cos(lat2);

        // Map to Cartesian to match ECEF coordinate frame in satelliteTracking.ts:
        // Scene X = Prime Meridian (lon 0) 
        // Scene Y = North Pole
        // Scene Z = 90° West (lon -90)
        // Therefore, Z uses sin(-lon) to correctly orient East to -Z.
        positions.push(
          R * cosLat1 * Math.cos(lon1),
          R * Math.sin(lat1),
          R * cosLat1 * Math.sin(-lon1)
        );

        positions.push(
          R * cosLat2 * Math.cos(lon2),
          R * Math.sin(lat2),
          R * cosLat2 * Math.sin(-lon2)
        );
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [radius]);

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          depthWrite={false} 
        />
      </lineSegments>
      {/* Faux thickness by layering slightly scaled copies */}
      <lineSegments geometry={geometry} scale={1.002}>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity * 0.8} 
          depthWrite={false} 
        />
      </lineSegments>
      <lineSegments geometry={geometry} scale={1.004}>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity * 0.5} 
          depthWrite={false} 
        />
      </lineSegments>
    </group>
  );
}
