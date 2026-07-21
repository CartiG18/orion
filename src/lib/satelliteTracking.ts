import { useState, useEffect } from 'react';
import * as satellite from 'satellite.js';
import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371.0;
const EARTH_SCENE_RADIUS = 1.5;
const SCALE = EARTH_SCENE_RADIUS / EARTH_RADIUS_KM;

export interface SatelliteData {
  noradId: string;
  name: string;
  tleLine1: string;
  tleLine2: string;
}

export interface TrackedSatellite {
  data: SatelliteData;
  satrec: satellite.SatRec;
}

export function useSatellites() {
  const [satellites, setSatellites] = useState<TrackedSatellite[]>([]);

  useEffect(() => {
    async function fetchTle() {
      try {
        const res = await fetch('/api/tle');
        const data: SatelliteData[] = await res.json();
        
        if (Array.isArray(data)) {
          const loaded = data.map(d => ({
            data: d,
            satrec: satellite.twoline2satrec(d.tleLine1, d.tleLine2)
          }));
          setSatellites(loaded);
        }
      } catch (err) {
        console.error('[useSatellites] Failed to load satellite data:', err);
      }
    }
    fetchTle();
  }, []);

  return satellites;
}

export function getSatellitePositionEcef(
  satrec: satellite.SatRec,
  date: Date,
  out?: THREE.Vector3
): THREE.Vector3 {
  const result = out ?? new THREE.Vector3();
  
  // Propagate to get ECI (TEME) coordinates
  const positionAndVelocity = satellite.propagate(satrec, date);
  
  if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
    return result.set(0, 0, 0); 
  }
  
  const positionEci = positionAndVelocity.position;

  // Get Greenwich Mean Sidereal Time
  const gmst = satellite.gstime(date);
  
  // Convert ECI (TEME) to ECEF (Earth-Centered, Earth-Fixed)
  const positionEcf = satellite.eciToEcf(positionEci as satellite.EciVec3<number>, gmst);
  
  // Scale down to scene units
  const x = positionEcf.x * SCALE;
  const y = positionEcf.y * SCALE;
  const z = positionEcf.z * SCALE;
  
  // Map ECEF to Three.js local spinning frame:
  // ECEF X (Prime Meridian) -> Scene X
  // ECEF Z (North Pole)     -> Scene Y
  // ECEF Y (90° East)       -> Scene -Z
  return result.set(x, z, -y);
}
