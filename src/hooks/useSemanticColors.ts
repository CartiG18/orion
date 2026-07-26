import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Provides the semantic Three-Color Palette as THREE.Color instances
 * for use inside the React Three Fiber canvas.
 * Hex values match the CSS variables in globals.css.
 */
export function useSemanticColors() {
  return useMemo(() => {
    return {
      structure: new THREE.Color('#4ade80'),
      interactive: new THREE.Color('#fbbf24'),
      alert: new THREE.Color('#ef4444'),
    };
  }, []);
}
