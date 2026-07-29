'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as satellite from 'satellite.js';
import PanelWindow from './PanelWindow';
import type { NearEarthObject } from '@/data/asteroids';
import { useSatellites } from '@/lib/satelliteTracking';
import { useCelestialStore } from '@/stores/useCelestialStore';
import TypewriterText from '@/components/TypewriterText';

export interface TrackedObject {
  id: string;
  name: string;
  type: 'asteroid' | 'satellite';
  orbitingBodyId: string;
  orbitingBodyName: string;
  distanceKm: number;
  sizeMeters?: number;
  massKg?: number;
  isPotentiallyHazardous?: boolean;
}

type SortKey = 'distance' | 'size' | 'mass';

const OBJECT_TYPES = [
  { id: 'satellite', name: 'SATELLITES' },
  { id: 'asteroid', name: 'ASTEROIDS' },
];

function getSatelliteMetadata(name: string) {
  const upper = name.toUpperCase();
  if (upper.includes('ISS') || upper.includes('ZARYA')) return { sizeMeters: 109, massKg: 450000 };
  if (upper.includes('HUBBLE') || upper.includes('HST')) return { sizeMeters: 13.2, massKg: 11110 };
  if (upper.includes('TIANGONG') || upper.includes('CSS')) return { sizeMeters: 55, massKg: 100000 };
  if (upper.includes('JWST') || upper.includes('WEBB')) return { sizeMeters: 20.1, massKg: 6200 };
  if (upper.includes('STARLINK')) return { sizeMeters: 7.0, massKg: 260 };
  if (upper.includes('GOES') || upper.includes('NOAA')) return { sizeMeters: 6.0, massKg: 2800 };
  if (upper.includes('GPS') || upper.includes('NAVSTAR')) return { sizeMeters: 5.3, massKg: 1630 };
  if (upper.includes('ONEWEB')) return { sizeMeters: 3.0, massKg: 150 };
  return { sizeMeters: undefined, massKg: undefined };
}

function formatDistance(km: number): string {
  if (km >= 1_000_000) {
    return (km / 1_000_000).toFixed(1) + 'M km';
  }
  return Math.round(km).toLocaleString() + ' km';
}

function formatSize(meters?: number): string {
  if (meters === undefined) return 'N/A';
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + ' km';
  }
  return Math.round(meters) + ' m';
}

function formatMass(kg?: number): string {
  if (kg === undefined) return 'N/A';
  if (kg >= 1_000_000) {
    return (kg / 1_000_000).toFixed(1) + 'M kg';
  }
  if (kg >= 1000) {
    return Math.round(kg / 1000) + 'k kg';
  }
  return Math.round(kg) + ' kg';
}

export default function AsteroidTracker() {
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [loadingNeos, setLoadingNeos] = useState(true);
  const satellites = useSatellites();
  
  const visibleSatellites = useCelestialStore((s) => s.visibleSatellites);
  const toggleSatellite = useCelestialStore((s) => s.toggleSatellite);

  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['satellite', 'asteroid']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

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
        setLoadingNeos(false);
      }
    }
    fetchNeos();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    if (isFilterOpen || isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen, isSortOpen]);

  // Combine satellites and asteroids into a single dataset
  const allObjects = useMemo<TrackedObject[]>(() => {
    const satObjects: TrackedObject[] = satellites.map((sat) => {
      const meta = getSatelliteMetadata(sat.data.name);
      let altitudeKm = 420;
      try {
        const posAndVel = satellite.propagate(sat.satrec, new Date());
        if (posAndVel && posAndVel.position && typeof posAndVel.position !== 'boolean') {
          const p = posAndVel.position;
          const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
          altitudeKm = r > 6371 ? r - 6371 : r;
        }
      } catch (e) {}

      return {
        id: `sat-${sat.data.noradId}`,
        name: sat.data.name.toUpperCase(),
        type: 'satellite',
        orbitingBodyId: 'earth',
        orbitingBodyName: 'EARTH',
        distanceKm: altitudeKm,
        sizeMeters: meta.sizeMeters,
        massKg: meta.massKg,
        isPotentiallyHazardous: false,
      };
    });

    const neoObjects: TrackedObject[] = neos.map((neo) => {
      const dist = parseFloat(neo.missDistanceKm) || 0;
      const sizeMeters = neo.estimatedDiameterMaxKm ? neo.estimatedDiameterMaxKm * 1000 : undefined;

      return {
        id: `neo-${neo.id}`,
        name: neo.name.toUpperCase(),
        type: 'asteroid',
        orbitingBodyId: 'sun',
        orbitingBodyName: 'SUN',
        distanceKm: dist,
        sizeMeters,
        massKg: undefined,
        isPotentiallyHazardous: neo.isPotentiallyHazardous,
      };
    });

    return [...satObjects, ...neoObjects];
  }, [satellites, neos]);

  // Filter objects by selected object types (satellites / asteroids)
  const filteredObjects = useMemo(() => {
    return allObjects.filter((obj) => selectedTypes.includes(obj.type));
  }, [allObjects, selectedTypes]);

  // Sort objects by distance, size, or mass
  const sortedObjects = useMemo(() => {
    return [...filteredObjects].sort((a, b) => {
      if (sortKey === 'distance') {
        return a.distanceKm - b.distanceKm;
      }
      if (sortKey === 'size') {
        if (a.sizeMeters === undefined && b.sizeMeters === undefined) return 0;
        if (a.sizeMeters === undefined) return 1;
        if (b.sizeMeters === undefined) return -1;
        return b.sizeMeters - a.sizeMeters;
      }
      if (sortKey === 'mass') {
        if (a.massKg === undefined && b.massKg === undefined) return 0;
        if (a.massKg === undefined) return 1;
        if (b.massKg === undefined) return -1;
        return b.massKg - a.massKg;
      }
      return 0;
    });
  }, [filteredObjects, sortKey]);

  // Expanded Content Modal
  const expandedContent = (
    <div className="flex flex-col gap-4">
      <div className="crt-glow font-bold tracking-widest text-sm mb-2 border-b pb-2 flex justify-between items-center" style={{ borderColor: 'var(--crt-border)' }}>
        <span>TRACKED ORBITAL OBJECTS ({sortedObjects.length})</span>
        <span className="text-xs crt-text-dim opacity-70">SORT: {sortKey.toUpperCase()}</span>
      </div>
      
      {loadingNeos && satellites.length === 0 ? (
        <p className="text-xs crt-text-dim tracking-widest leading-relaxed text-center py-4">
          <TypewriterText text="[ ESTABLISHING TELEMETRY FEED... ]" playAudio={true} />
        </p>
      ) : sortedObjects.length === 0 ? (
        <p className="text-xs text-amber-400 tracking-widest leading-relaxed text-center py-4 opacity-80">
          [ NO OBJECTS MATCHING FILTER ]
        </p>
      ) : (
        <div className="w-full text-xs tracking-widest mt-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-2 border-b pb-2 mb-2 crt-text-dim opacity-70 sticky top-0" style={{ borderColor: 'var(--crt-border)', backgroundColor: 'var(--panel-bg)' }}>
            <div>DESIGNATION</div>
            <div>TYPE</div>
            <div>BODY</div>
            <div>DISTANCE</div>
            <div>SIZE</div>
            <div>MASS</div>
          </div>

          {/* Table rows */}
          {sortedObjects.map((obj) => (
            <div 
              key={obj.id} 
              className={`grid grid-cols-6 gap-2 py-2 border-b border-dashed items-center ${
                obj.isPotentiallyHazardous ? 'opacity-100 crt-border-alert px-1' : 'opacity-80'
              }`} 
              style={{ borderColor: 'var(--crt-border)' }}
            >
              <div className="flex items-center gap-2">
                {obj.type === 'satellite' && (
                  <button 
                    onClick={() => toggleSatellite(obj.id.replace('sat-', ''))}
                    className="text-[10px] opacity-70 hover:opacity-100 hover:crt-glow-interactive cursor-pointer shrink-0"
                  >
                    {visibleSatellites.includes(obj.id.replace('sat-', '')) ? '[O]' : '[X]'}
                  </button>
                )}
                <span className={obj.isPotentiallyHazardous ? 'crt-glow-alert font-bold' : ''}>
                  {obj.name}
                </span>
              </div>
              <div className="text-[10px] opacity-70">{obj.type.toUpperCase()}</div>
              <div>{obj.orbitingBodyName}</div>
              <div>{formatDistance(obj.distanceKm)}</div>
              <div>{formatSize(obj.sizeMeters)}</div>
              <div>{formatMass(obj.massKg)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PanelWindow id="asteroid-tracker" title="ORBITAL TRACKER" expandedContent={expandedContent}>
      <div className="flex flex-col h-full min-h-0 gap-2.5">
        {/* Header Count */}
        <div className="flex items-center justify-between text-[10px] crt-text-dim tracking-widest opacity-70 border-b pb-1 shrink-0" style={{ borderColor: 'var(--crt-border)' }}>
          <span>TRACKED OBJECTS</span>
          {sortedObjects.length > 0 && <span className="crt-glow font-bold">[{sortedObjects.length}]</span>}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-dashed shrink-0 text-[10px]" style={{ borderColor: 'var(--crt-border)' }}>
          {/* Filter Button & Checkbox Menu */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterOpen((prev) => !prev);
                setIsSortOpen(false);
              }}
              className={`px-2 py-1 crt-border bg-black/60 hover:crt-glow-interactive transition-colors cursor-pointer flex items-center gap-1.5 select-none ${
                selectedTypes.length < OBJECT_TYPES.length ? 'crt-glow-interactive text-white' : 'crt-text-dim'
              }`}
            >
              <span>┌ FILTER</span>
              <span className="opacity-60">({selectedTypes.length})</span>
              <span className="text-[8px] opacity-60 ml-0.5">{isFilterOpen ? '▲' : '▼'}</span>
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-black/95 crt-border p-2 min-w-[140px] flex flex-col gap-1.5 shadow-2xl">
                <div className="text-[9px] opacity-60 crt-text-dim border-b pb-1 mb-0.5 select-none" style={{ borderColor: 'var(--crt-border)' }}>
                  OBJECT TYPE
                </div>
                {OBJECT_TYPES.map((type) => {
                  const isChecked = selectedTypes.includes(type.id);
                  return (
                    <label 
                      key={type.id} 
                      className="flex items-center gap-2 cursor-pointer hover:crt-glow-interactive text-xs crt-text-dim select-none py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            if (selectedTypes.length > 1) {
                              setSelectedTypes(selectedTypes.filter((t) => t !== type.id));
                            }
                          } else {
                            setSelectedTypes([...selectedTypes, type.id]);
                          }
                        }}
                        className="accent-[var(--color-interactive)] cursor-pointer"
                      />
                      <span>{type.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Button & Custom Dropdown Menu */}
          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSortOpen((prev) => !prev);
                setIsFilterOpen(false);
              }}
              className="px-2 py-1 crt-border bg-black/60 hover:crt-glow-interactive transition-colors cursor-pointer flex items-center gap-1 crt-text-dim uppercase select-none"
            >
              <span>SORT:</span>
              <span className="crt-glow-interactive text-white font-bold">{sortKey}</span>
              <span className="text-[8px] opacity-60 ml-0.5">{isSortOpen ? '▲' : '▼'}</span>
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-black/95 crt-border p-1.5 min-w-[120px] flex flex-col gap-1 shadow-2xl">
                <div className="text-[9px] opacity-60 crt-text-dim border-b pb-1 mb-0.5 select-none" style={{ borderColor: 'var(--crt-border)' }}>
                  SORT BY
                </div>
                {[
                  { id: 'distance', label: 'DISTANCE' },
                  { id: 'size', label: 'SIZE' },
                  { id: 'mass', label: 'MASS' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortKey(opt.id as SortKey);
                      setIsSortOpen(false);
                    }}
                    className={`text-left px-2 py-1 text-xs tracking-wider transition-colors cursor-pointer select-none ${
                      sortKey === opt.id
                        ? 'bg-white/20 crt-glow-interactive text-white font-bold'
                        : 'crt-text-dim hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Objects List */}
        {loadingNeos && satellites.length === 0 ? (
          <div className="text-[10px] text-center tracking-widest opacity-70 py-4">
            [ LINKING TELEMETRY... ]
          </div>
        ) : sortedObjects.length === 0 ? (
          <div className="text-[10px] text-center tracking-widest opacity-70 py-4 crt-glow-alert">
            [ NO MATCHES ]
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
            {sortedObjects.map((obj) => {
              const displayVal = 
                sortKey === 'size' ? formatSize(obj.sizeMeters) :
                sortKey === 'mass' ? formatMass(obj.massKg) :
                formatDistance(obj.distanceKm);

              return (
                <div 
                  key={obj.id} 
                  className={`flex justify-between items-center text-xs tracking-widest py-1 px-1 border-b border-dashed ${
                    obj.isPotentiallyHazardous ? 'crt-border-alert' : 'opacity-80'
                  }`}
                  style={{ borderColor: 'var(--crt-border)' }}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    {obj.type === 'satellite' && (
                      <button 
                        onClick={() => toggleSatellite(obj.id.replace('sat-', ''))}
                        className="text-[9px] opacity-70 hover:opacity-100 hover:crt-glow-interactive cursor-pointer shrink-0"
                      >
                        {visibleSatellites.includes(obj.id.replace('sat-', '')) ? '[O]' : '[X]'}
                      </button>
                    )}
                    <span className="text-[9px] opacity-50 px-1 border rounded shrink-0" style={{ borderColor: 'var(--crt-border)' }}>
                      {obj.type === 'satellite' ? 'SAT' : 'NEO'}
                    </span>
                    <span className={obj.isPotentiallyHazardous ? 'crt-glow-alert font-bold truncate' : 'truncate'}>
                      {obj.name}
                    </span>
                  </div>
                  <span className={`shrink-0 ${obj.isPotentiallyHazardous ? 'crt-glow-alert font-bold' : ''}`}>
                    {displayVal}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Feed Footer */}
        <div className="pt-1.5 border-t border-dashed opacity-50 text-[10px] tracking-widest text-center shrink-0 select-none" style={{ borderColor: 'var(--crt-border)' }}>
          [ CELESTRAK & NASA NeoWs ]
        </div>
      </div>
    </PanelWindow>
  );
}
