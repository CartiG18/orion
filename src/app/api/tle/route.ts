import { NextResponse } from 'next/server';
import { SATELLITES } from '@/data/satellites';

export const revalidate = 14400; // Cache for 4 hours (14400 seconds)

export async function GET() {
  try {
    const tlePromises = SATELLITES.map(async (sat) => {
      try {
        const response = await fetch(
          `https://celestrak.org/NORAD/elements/gp.php?CATNR=${sat.id}&FORMAT=tle`
        );
        
        if (!response.ok) {
          console.warn(`Failed to fetch TLE for ${sat.id}: ${response.status}`);
          return null;
        }

        const text = await response.text();
        const lines = text.trim().split(/\r?\n/);
        
        if (lines.length < 3) {
           console.warn(`Invalid TLE data returned for ${sat.id}`);
           return null;
        }

        return {
          noradId: sat.id,
          name: sat.name,
          tleLine1: lines[1].trim(),
          tleLine2: lines[2].trim(),
        };
      } catch (err) {
        console.warn(`Error fetching TLE for ${sat.id}`, err);
        return null;
      }
    });

    const results = (await Promise.all(tlePromises)).filter(Boolean);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[API/TLE] Error fetching satellite data:', error);
    // Return empty array on failure so frontend handles it gracefully
    return NextResponse.json([], { status: 200 }); 
  }
}
