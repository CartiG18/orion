'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface LocationMarkerProps {
  lat: number;
  lon: number;
  radius: number;
  color?: string | THREE.Color;
  label?: string;
  size?: number;
}

export default function LocationMarker({
  lat,
  lon,
  radius,
  color = '#ff0000',
  label,
  size = 0.015,
}: LocationMarkerProps) {
  const position = useMemo(() => {
    const DEG2RAD = Math.PI / 180;
    const latRad = lat * DEG2RAD;
    const lonRad = lon * DEG2RAD;

    const cosLat = Math.cos(latRad);
    
    // Elevate slightly above the graticule globe
    const R = radius * 1.005;

    // Map to Cartesian to match Earth's orientation
    // Scene X = Prime Meridian (lon 0) 
    // Scene Y = North Pole
    // Scene Z = 90° West (lon -90)
    return new THREE.Vector3(
      R * cosLat * Math.cos(lonRad),
      R * Math.sin(latRad),
      R * cosLat * Math.sin(-lonRad)
    );
  }, [lat, lon, radius]);

  const colorHex = useMemo(() => {
    if (color instanceof THREE.Color) return '#' + color.getHexString();
    return color;
  }, [color]);

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {label && (
        <Html
          position={[size * 2, size * 2, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[100, 0]}
        >
          <div 
            className="font-mono text-[10px] tracking-wider whitespace-nowrap opacity-90 select-none crt-glow"
            style={{ color: colorHex }}
          >
            {label.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
}
