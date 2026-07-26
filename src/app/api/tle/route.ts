import { NextResponse } from 'next/server';
import { TLE_FALLBACK } from '@/data/tleFallback';

export const revalidate = 14400; // Cache for 4 hours (14400 seconds)

let cachedResults: any[] | null = null;
let lastFetchTime = 0;

export async function GET() {
  try {
    const now = Date.now();
    // Use cache if within 5 minutes
    if (cachedResults && (now - lastFetchTime) < 5 * 60 * 1000) {
      console.log(`[API/TLE] Serving from memory cache (${cachedResults.length} satellites).`);
      return NextResponse.json(cachedResults);
    }

    const url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle';
    console.log(`[API/TLE] Attempting to fetch from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[API/TLE] Failed to fetch visual TLEs: ${response.status} ${response.statusText}`);
      const errText = await response.text();
      console.error(`[API/TLE] Error body:`, errText.substring(0, 500));
      return NextResponse.json(cachedResults || TLE_FALLBACK, { status: 200 });
    }

    const text = await response.text();
    console.log(`[API/TLE] Fetch successful. Received ${text.length} bytes.`);
    const lines = text.trim().split(/\r?\n/);
    
    const results = [];
    
    for (let i = 0; i < lines.length; i += 3) {
      const name = lines[i]?.trim();
      const line1 = lines[i + 1]?.trim();
      const line2 = lines[i + 2]?.trim();
      
      if (name && line1?.startsWith('1 ') && line2?.startsWith('2 ')) {
        const noradId = line1.substring(2, 7).trim();
        results.push({ noradId, name, tleLine1: line1, tleLine2: line2 });
      }
    }
    
    console.log(`[API/TLE] Successfully parsed ${results.length} satellites.`);
    
    // Update cache on success
    cachedResults = results;
    lastFetchTime = Date.now();
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[API/TLE] Error fetching satellite data:');
    console.error('Error message:', error?.message);
    
    // Graceful fallback to cache if CelesTrak times out
    if (cachedResults) {
      console.log('[API/TLE] Falling back to cached data after error.');
      return NextResponse.json(cachedResults);
    }
    
    console.log('[API/TLE] Cache empty. Falling back to static TLE snapshot.');
    return NextResponse.json(TLE_FALLBACK, { status: 200 }); 
  }
}
