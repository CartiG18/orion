import { NextResponse } from 'next/server';
import type { NearEarthObject } from '@/data/asteroids';

export const revalidate = 43200; // Cache for 12 hours

export async function GET() {
  try {
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    
    // Get today and today+6 days in YYYY-MM-DD format
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);
    
    const startStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startStr}&end_date=${endStr}&api_key=${apiKey}`
    );

    if (!response.ok) {
      console.warn(`Failed to fetch NeoWs data: ${response.status}`);
      return NextResponse.json([], { status: 200 });
    }

    const data = await response.json();
    const nearEarthObjects: NearEarthObject[] = [];

    // The NEO API returns a map of dates to arrays of objects
    if (data.near_earth_objects) {
      for (const date in data.near_earth_objects) {
        const dailyObjects = data.near_earth_objects[date];
        for (const neo of dailyObjects) {
          const closeApproach = neo.close_approach_data?.[0];
          
          if (!closeApproach) continue;

          nearEarthObjects.push({
            id: neo.id,
            name: neo.name,
            estimatedDiameterMinKm: neo.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
            estimatedDiameterMaxKm: neo.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
            isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid || false,
            closeApproachDate: closeApproach.close_approach_date,
            missDistanceKm: closeApproach.miss_distance?.kilometers || '0',
            relativeVelocityKmph: closeApproach.relative_velocity?.kilometers_per_hour || '0',
          });
        }
      }
    }

    // Sort by approach date ascending
    nearEarthObjects.sort((a, b) => new Date(a.closeApproachDate).getTime() - new Date(b.closeApproachDate).getTime());

    return NextResponse.json(nearEarthObjects);
  } catch (error) {
    console.error('[API/NEO] Error fetching NEO data:', error);
    // Return empty array on failure so frontend handles it gracefully
    return NextResponse.json([], { status: 200 }); 
  }
}
