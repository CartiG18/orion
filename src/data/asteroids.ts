export interface NearEarthObject {
  id: string;
  name: string;
  estimatedDiameterMinKm: number;
  estimatedDiameterMaxKm: number;
  isPotentiallyHazardous: boolean;
  closeApproachDate: string; // e.g. YYYY-MM-DD
  missDistanceKm: string;
  relativeVelocityKmph: string;
}
