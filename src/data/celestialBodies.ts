import { Body } from 'astronomy-engine';

/**
 * Configuration for a celestial body in the Orion system.
 *
 * This shape is generalized for all planets — only Earth is rendered in Phase 1,
 * but all data is populated now so future phases can add bodies without re-entry.
 *
 * Convention:
 * - Negative `siderealRotationHours` = retrograde rotation (Venus, Uranus)
 * - `axialTiltDegrees` uses IAU obliquity (0-180°)
 * - `astronomyEngineBody` maps to the astronomy-engine Body enum for API calls
 */
export interface CelestialBodyConfig {
  /** Unique identifier used as keys in stores and lookups */
  id: string;
  /** Human-readable name for HUD display */
  displayName: string;
  /** Mean radius in kilometers (for reference/display — scene uses normalized units) */
  meanRadiusKm: number;
  /**
   * Sidereal rotation period in hours.
   * Positive = prograde (rotates in same direction as orbital motion).
   * Negative = retrograde (Venus, Uranus).
   */
  siderealRotationHours: number;
  /** Axial tilt (obliquity) in degrees, IAU convention (0-180°) */
  axialTiltDegrees: number;
  /** Orbital period in Earth days (not used for rendering yet — future phases) */
  orbitalPeriodDays: number;
  /** Corresponding Body enum value from astronomy-engine, or null if not supported */
  astronomyEngineBody: Body | null;
  /** Visual radius in scene units (normalized so Earth ≈ 1.5 for good framing) */
  sceneRadius: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Celestial body data — real values from IAU / NASA fact sheets
   ═══════════════════════════════════════════════════════════════════════════ */

export const CELESTIAL_BODIES: Record<string, CelestialBodyConfig> = {
  mercury: {
    id: 'mercury',
    displayName: 'MERCURY',
    meanRadiusKm: 2_439.7,
    siderealRotationHours: 1_407.6,
    axialTiltDegrees: 0.034,
    orbitalPeriodDays: 87.969,
    astronomyEngineBody: Body.Mercury,
    sceneRadius: 0.58,
  },
  venus: {
    id: 'venus',
    displayName: 'VENUS',
    meanRadiusKm: 6_051.8,
    siderealRotationHours: -5_832.5, // retrograde
    axialTiltDegrees: 177.36,
    orbitalPeriodDays: 224.701,
    astronomyEngineBody: Body.Venus,
    sceneRadius: 1.44,
  },
  earth: {
    id: 'earth',
    displayName: 'EARTH',
    meanRadiusKm: 6_371.0,
    siderealRotationHours: 23.934,
    axialTiltDegrees: 23.44,
    orbitalPeriodDays: 365.256,
    astronomyEngineBody: Body.Earth,
    sceneRadius: 1.5,
  },
  moon: {
    id: 'moon',
    displayName: 'LUNA',
    meanRadiusKm: 1_737.4,
    siderealRotationHours: 655.72, // tidally locked — rotation = orbital period
    axialTiltDegrees: 6.68,
    orbitalPeriodDays: 27.322,
    astronomyEngineBody: Body.Moon,
    sceneRadius: 0.41,
  },
  mars: {
    id: 'mars',
    displayName: 'MARS',
    meanRadiusKm: 3_389.5,
    siderealRotationHours: 24.623,
    axialTiltDegrees: 25.19,
    orbitalPeriodDays: 686.971,
    astronomyEngineBody: Body.Mars,
    sceneRadius: 1.02,
  },
  jupiter: {
    id: 'jupiter',
    displayName: 'JUPITER',
    meanRadiusKm: 69_911,
    siderealRotationHours: 9.925,
    axialTiltDegrees: 3.13,
    orbitalPeriodDays: 4_332.59,
    astronomyEngineBody: Body.Jupiter,
    sceneRadius: 1.5, // capped for scene framing — real scale would dwarf everything
  },
  saturn: {
    id: 'saturn',
    displayName: 'SATURN',
    meanRadiusKm: 58_232,
    siderealRotationHours: 10.656,
    axialTiltDegrees: 26.73,
    orbitalPeriodDays: 10_759.22,
    astronomyEngineBody: Body.Saturn,
    sceneRadius: 1.5,
  },
  uranus: {
    id: 'uranus',
    displayName: 'URANUS',
    meanRadiusKm: 25_362,
    siderealRotationHours: -17.24, // retrograde
    axialTiltDegrees: 97.77,
    orbitalPeriodDays: 30_688.5,
    astronomyEngineBody: Body.Uranus,
    sceneRadius: 1.5,
  },
  neptune: {
    id: 'neptune',
    displayName: 'NEPTUNE',
    meanRadiusKm: 24_622,
    siderealRotationHours: 16.11,
    axialTiltDegrees: 28.32,
    orbitalPeriodDays: 60_182,
    astronomyEngineBody: Body.Neptune,
    sceneRadius: 1.5,
  },
};

/** Helper to look up a body config by id, throws if not found */
export function getBodyConfig(id: string): CelestialBodyConfig {
  const config = CELESTIAL_BODIES[id];
  if (!config) {
    throw new Error(`Unknown celestial body: "${id}"`);
  }
  return config;
}
