'use client';

import React, { useEffect, useState } from 'react';
import PanelWindow from './PanelWindow';
import type { NearEarthObject } from '@/data/asteroids';
import TypewriterText from '@/components/TypewriterText';

export default function AsteroidTracker() {
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeos() {
      try {
        const res = await fetch('/api/neo');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setNeos(data);
        }
      } catch (err) {
        console.error('[AsteroidTracker] Failed to load NEO data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNeos();
  }, []);

  const formatDistance = (kmStr: string) => {
    const km = parseFloat(kmStr);
    if (isNaN(km)) return kmStr;
    if (km > 1000000) {
      return (km / 1000000).toFixed(1) + 'M km';
    }
    return km.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' km';
  };

  // A mock of what the expanded data view will look like
  const expandedContent = (
    <div className="flex flex-col gap-4">
      <div className="crt-glow font-bold tracking-widest text-sm mb-2 border-b pb-2" style={{ borderColor: 'var(--crt-border)' }}>
        NEAR-EARTH OBJECTS (NEO)
      </div>
      
      {loading ? (
        <p className="text-xs crt-text-dim tracking-widest leading-relaxed text-center py-4">
          <TypewriterText text="[ ESTABLISHING DATA LINK... ]" playAudio={true} />
        </p>
      ) : neos.length === 0 ? (
        <p className="text-xs text-red-500 tracking-widest leading-relaxed text-center py-4 opacity-80">
          <TypewriterText text="[ NO DATA LINK ESTABLISHED ]" playAudio={true} speed={20} /><br/>
          API UNAVAILABLE
        </p>
      ) : (
        <div className="w-full text-xs tracking-widest mt-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-2 border-b pb-2 mb-2 crt-text-dim opacity-70 sticky top-0" style={{ borderColor: 'var(--crt-border)', backgroundColor: 'var(--panel-bg)' }}>
            <div>DESIGNATION</div>
            <div>APPROACH</div>
            <div>MISS DIST.</div>
            <div>HAZARD</div>
          </div>

          {/* Table rows */}
          {neos.map((neo) => (
            <div key={neo.id} className={`grid grid-cols-4 gap-2 py-2 border-b border-dashed ${neo.isPotentiallyHazardous ? 'opacity-100 crt-border-alert px-1' : 'opacity-80'}`} style={{ borderColor: 'var(--crt-border)' }}>
              <div className={neo.isPotentiallyHazardous ? 'crt-glow-alert font-bold' : ''}>({neo.name})</div>
              <div>{neo.closeApproachDate}</div>
              <div>{formatDistance(neo.missDistanceKm)}</div>
              <div className={neo.isPotentiallyHazardous ? 'crt-glow-alert font-bold' : ''}>
                {neo.isPotentiallyHazardous ? 'YES' : 'NO'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PanelWindow id="asteroid-tracker" title="ASTEROID TRACKER" expandedContent={expandedContent}>
      <div className="flex flex-col gap-3">
        <div className="text-[10px] crt-text-dim tracking-widest opacity-70 border-b pb-1" style={{ borderColor: 'var(--crt-border)' }}>
          NEAR-EARTH OBJECTS
        </div>
        
        {loading ? (
          <div className="text-[10px] text-center tracking-widest opacity-70 py-4">
            [ LINKING... ]
          </div>
        ) : neos.length === 0 ? (
          <div className="text-[10px] text-center tracking-widest opacity-70 py-4 crt-glow-alert">
            [ OFFLINE ]
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {neos.slice(0, 3).map((neo) => (
              <div key={neo.id} className={`flex justify-between items-center text-xs tracking-widest ${neo.isPotentiallyHazardous ? 'crt-border-alert p-1' : ''}`}>
                <span className={neo.isPotentiallyHazardous ? 'crt-glow-alert font-bold' : 'opacity-80'}>
                  {neo.name}
                </span>
                <span className={neo.isPotentiallyHazardous ? 'crt-glow-alert font-bold' : 'opacity-80'}>
                  {formatDistance(neo.missDistanceKm)}
                </span>
              </div>
            ))}
            {neos.length > 3 && (
              <div className="text-[10px] text-right opacity-50 mt-1">
                + {neos.length - 3} MORE...
              </div>
            )}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-dashed opacity-50 text-[10px] tracking-widest text-center" style={{ borderColor: 'var(--crt-border)' }}>
          [ NASA NeoWs FEED ]
        </div>
      </div>
    </PanelWindow>
  );
}
