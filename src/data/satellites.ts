export interface SatelliteConfig {
  id: string; // NORAD ID
  name: string;
}

// Curated list: ISS, Hubble, and 2 active Starlinks
export const SATELLITES: SatelliteConfig[] = [
  { id: '25544', name: 'ISS (ZARYA)' },
  { id: '20580', name: 'HST (HUBBLE)' },
  { id: '53315', name: 'STARLINK-4382' },
  { id: '53544', name: 'STARLINK-4475' }
];
