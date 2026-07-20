import {
  Body,
  HelioVector,
  RotationAxis,
  GeoVector,
  type FlexibleDateTime,
} from 'astronomy-engine';
import * as THREE from 'three';
import { getBodyConfig } from '@/data/celestialBodies';

/* ═══════════════════════════════════════════════════════════════════════════
   Orion Astronomy Module
   ─────────────────────────────────────────────────────────────────────────
   Wraps astronomy-engine to expose two clean functions for the rendering
   pipeline. All functions are pure (no side effects, no IO) and take a
   real JS Date so we can support "what did this look like at time X"
   in future phases.

   COORDINATE FRAME (documented here for Phase 2 camera work):
   ─────────────────────────────────────────────────────────────────────────
   astronomy-engine returns vectors in J2000 mean equatorial (EQJ):
     EQJ.x → toward vernal equinox
     EQJ.y → 90° east in equatorial plane
     EQJ.z → toward north celestial pole

   Our Three.js scene uses Y-up convention. We map:
     scene.x =  EQJ.x   (vernal equinox direction)
     scene.y =  EQJ.z   (celestial north → up)
     scene.z = -EQJ.y   (right-handed flip)

   This means:
   - Earth's north pole initially points along +Y (before axis tilt)
   - The ecliptic plane is tilted ~23.4° from the XZ plane
   - Sun direction vectors are in this same frame
   ═══════════════════════════════════════════════════════════════════════════ */


/**
 * Convert an EQJ vector (x, y, z) from astronomy-engine to our scene frame.
 * EQJ: x=vernal equinox, y=90°E in equatorial plane, z=north celestial pole
 * Scene: x=EQJ.x, y=EQJ.z (up), z=-EQJ.y (right-handed)
 */
function eqjToScene(eqjX: number, eqjY: number, eqjZ: number, out: THREE.Vector3): THREE.Vector3 {
  out.set(eqjX, eqjZ, -eqjY);
  return out;
}

/* ─── Rotation Angle ──────────────────────────────────────────────────── */

/**
 * Returns the current rotation angle of a celestial body's prime meridian
 * in degrees, as defined by the IAU 2015 Working Group formulae.
 *
 * This is the `W` angle (spin) from RotationAxis — the angular position
 * of the body's prime meridian measured from the node Q (where the body's
 * equator crosses the ICRF equator) along the body's equator.
 *
 * @param bodyId - Key into CELESTIAL_BODIES (e.g. "earth", "mars")
 * @param date   - The moment in time to query
 * @returns Rotation angle in degrees (0-360, wraps)
 */
export function getRotationAngle(bodyId: string, date: FlexibleDateTime): number {
  const config = getBodyConfig(bodyId);
  if (!config.astronomyEngineBody) {
    // Fallback for bodies not in astronomy-engine: simple linear interpolation
    // from sidereal period. Epoch = J2000 (2000-01-01T12:00:00Z)
    const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
    let dateMs: number;
    if (date instanceof Date) {
      dateMs = date.getTime();
    } else if (typeof date === 'number') {
      // astronomy-engine numbers are J2000 days — convert to ms
      dateMs = j2000Ms + date * 86_400_000;
    } else {
      // AstroTime object — use its date property
      dateMs = (date as { date: Date }).date.getTime();
    }
    const hoursElapsed = (dateMs - j2000Ms) / 3_600_000;
    const rotations = hoursElapsed / config.siderealRotationHours;
    return ((rotations * 360) % 360 + 360) % 360;
  }

  const axis = RotationAxis(config.astronomyEngineBody, date);
  return axis.spin;
}

/* ─── North Pole Direction ────────────────────────────────────────────── */

/**
 * Returns a unit vector pointing along the body's north pole direction
 * in scene coordinates.
 *
 * Uses astronomy-engine's RotationAxis which gives the pole direction
 * in J2000 equatorial (EQJ) coordinates, then converts to scene frame.
 *
 * @param bodyId - Key into CELESTIAL_BODIES
 * @param date   - The moment in time to query
 * @param out    - Optional output vector (avoids allocation)
 * @returns Normalized direction vector for the body's north pole
 */
export function getNorthPoleDirection(
  bodyId: string,
  date: FlexibleDateTime,
  out?: THREE.Vector3,
): THREE.Vector3 {
  const result = out ?? new THREE.Vector3();
  const config = getBodyConfig(bodyId);

  if (!config.astronomyEngineBody) {
    // Fallback: assume pole is along +Y (scene up) — crude but safe
    return result.set(0, 1, 0);
  }

  const axis = RotationAxis(config.astronomyEngineBody, date);
  const north = axis.north; // EQJ unit vector
  return eqjToScene(north.x, north.y, north.z, result).normalize();
}

/* ─── Sun Direction ───────────────────────────────────────────────────── */

/**
 * Returns a normalized 3D vector representing the direction TO the Sun
 * as seen from the given body, in our scene's coordinate frame.
 *
 * For planets: negates HelioVector (body's heliocentric position).
 * For Moon: computes Sun position relative to Moon via geocentric vectors.
 *
 * @param bodyId - Key into CELESTIAL_BODIES
 * @param date   - The moment in time to query
 * @param out    - Optional output vector (avoids allocation)
 * @returns Normalized direction vector pointing toward the Sun
 */
export function getSunDirection(
  bodyId: string,
  date: FlexibleDateTime,
  out?: THREE.Vector3,
): THREE.Vector3 {
  const result = out ?? new THREE.Vector3();
  const config = getBodyConfig(bodyId);

  if (!config.astronomyEngineBody) {
    // Fallback: sun roughly along +X
    return result.set(1, 0, 0).normalize();
  }

  if (config.astronomyEngineBody === Body.Earth) {
    // Earth: HelioVector gives Earth's position relative to Sun.
    // Negate to get direction TO Sun FROM Earth.
    const hv = HelioVector(Body.Earth, date);
    eqjToScene(-hv.x, -hv.y, -hv.z, result);
  } else if (config.astronomyEngineBody === Body.Moon) {
    // Moon: need Sun direction from Moon's perspective.
    // Moon's position relative to Earth + Earth's heliocentric position
    // gives Moon's heliocentric position. Negate for direction to Sun.
    const earthHV = HelioVector(Body.Earth, date);
    const moonGV = GeoVector(Body.Moon, date, true);
    eqjToScene(
      -(earthHV.x + moonGV.x),
      -(earthHV.y + moonGV.y),
      -(earthHV.z + moonGV.z),
      result,
    );
  } else {
    // Other planets: HelioVector gives their position relative to Sun
    const hv = HelioVector(config.astronomyEngineBody, date);
    eqjToScene(-hv.x, -hv.y, -hv.z, result);
  }

  return result.normalize();
}
