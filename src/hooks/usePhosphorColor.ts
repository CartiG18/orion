'use client';

import { useState, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Reads the --phosphor-primary CSS custom property and returns it as a THREE.Color.
 * Watches for data-phosphor attribute changes on <html> via MutationObserver,
 * so the Three.js scene stays in sync when the user swaps palettes.
 *
 * Since palette swaps are rare (user-triggered), the single React re-render
 * per swap is perfectly acceptable.
 */
export function usePhosphorColor(): THREE.Color {
  const [color, setColor] = useState<THREE.Color>(() => readPhosphorColor());

  useEffect(() => {
    const html = document.documentElement;

    const updateColor = () => {
      setColor(readPhosphorColor());
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-phosphor') {
          updateColor();
          break;
        }
      }
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-phosphor'],
    });

    return () => observer.disconnect();
  }, []);

  return color;
}

/** Read --phosphor-primary from computed styles and return as THREE.Color */
function readPhosphorColor(): THREE.Color {
  if (typeof window === 'undefined') {
    // SSR fallback — phosphor green
    return new THREE.Color('#33ff66');
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--phosphor-primary')
    .trim();
  return new THREE.Color(raw || '#33ff66');
}
