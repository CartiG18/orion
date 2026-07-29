'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';

const ALL_TARGETS = Object.values(CELESTIAL_BODIES).map((body) => ({
  id: body.id,
  name: body.displayName.toUpperCase(),
}));

export default function TargetSelector() {
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);
  const setFocusedBody = useCelestialStore((s) => s.setFocusedBody);
  const showTelemetry = useCelestialStore((s) => s.showTelemetry);
  const toggleTelemetry = useCelestialStore((s) => s.toggleTelemetry);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTargets = ALL_TARGETS.filter((t) =>
    t.name.includes(inputValue.toUpperCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input on open, reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setSelectedIndex(0);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    setFocusedBody(id);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredTargets.length, 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev - 1 + filteredTargets.length) % Math.max(filteredTargets.length, 1));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (filteredTargets.length > 0) {
        handleSelect(filteredTargets[selectedIndex].id);
      }
      e.preventDefault();
    }
  };

  const currentTargetName = (CELESTIAL_BODIES[focusedBodyId]?.displayName || 'UNKNOWN').toUpperCase();

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 z-50 flex items-start gap-2 pointer-events-auto font-mono text-xs tracking-widest uppercase select-none"
    >
      <div className="flex flex-col">
        <div
          className="flex items-center h-[29px] crt-text-dim cursor-pointer hover:crt-glow-interactive transition-colors bg-black/60 px-3 crt-border"
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
        >
          <span className="mr-2">[{' '}TARGET:</span>
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent border-none outline-none crt-glow-interactive font-mono uppercase w-32 p-0 m-0"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.toUpperCase());
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={currentTargetName}
            />
          ) : (
            <span className="crt-glow-interactive w-32 text-left inline-block truncate">{currentTargetName}</span>
          )}
          <span className="ml-2">]</span>
        </div>

        {isOpen && (
          <div className="flex flex-col mt-1 bg-black/80 crt-border max-h-64 overflow-y-auto">
            {filteredTargets.length > 0 ? (
              filteredTargets.map((target, idx) => (
                <div
                  key={target.id}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    idx === selectedIndex
                      ? 'bg-white/20 crt-glow-interactive text-white'
                      : 'crt-text-dim hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => handleSelect(target.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {target.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 crt-text-dim opacity-50">NO MATCHES</div>
            )}
          </div>
        )}
      </div>

      {/* Hide / Show Telemetry Button */}
      <button
        type="button"
        onClick={toggleTelemetry}
        title={showTelemetry ? 'Hide Telemetry HUD' : 'Show Telemetry HUD'}
        className="h-[29px] w-[29px] aspect-square flex items-center justify-center crt-text-dim bg-black/60 crt-border hover:crt-glow-interactive transition-colors cursor-pointer shrink-0"
      >
        {showTelemetry ? (
          /* Eye Icon (Hide Telemetry) */
          <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          /* Eye Off Icon (Show Telemetry) */
          <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        )}
      </button>
    </div>
  );
}
