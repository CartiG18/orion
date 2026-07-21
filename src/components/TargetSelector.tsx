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
      className="absolute top-4 left-4 z-50 flex flex-col pointer-events-auto font-mono text-xs tracking-widest uppercase select-none"
    >
      <div
        className="flex items-center crt-text-dim cursor-pointer hover:crt-glow transition-colors bg-black/60 px-3 py-1.5 crt-border"
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
            className="bg-transparent border-none outline-none crt-glow font-mono uppercase w-32 p-0 m-0"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase());
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={currentTargetName}
          />
        ) : (
          <span className="crt-glow w-32 text-left inline-block truncate">{currentTargetName}</span>
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
                    ? 'bg-white/20 crt-glow text-white'
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
  );
}
