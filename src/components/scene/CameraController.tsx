'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCelestialStore } from '@/stores/useCelestialStore';
import { getPlanetPosition } from '@/lib/astronomy';
import { CELESTIAL_BODIES } from '@/data/celestialBodies';

const DEFAULT_OVERVIEW_RADIUS = 180;

function getCameraBounds(bodyId: string) {
  const config = CELESTIAL_BODIES[bodyId];
  if (!config) return null;

  const parentId = config.parentId || bodyId;
  const parentConfig = CELESTIAL_BODIES[parentId];

  const baseRadius = config.sceneRadius;
  const systemBaseRadius = parentConfig.sceneRadius;

  // Scale bounds relative to the body's radius
  // This ensures the auto-fit framing adapts dynamically to any planet size (e.g. Jupiter)
  return {
    MIN_FOCUS_RADIUS: Math.max(0.5, baseRadius * 1.33),
    MAX_FOCUS_RADIUS: Math.max(1.0, baseRadius * 5.33),
    MIN_SYSTEM_RADIUS: Math.max(1.0, baseRadius * 5.33),
    MAX_SYSTEM_RADIUS: systemBaseRadius * 16.66,
    MIN_OVERVIEW_RADIUS: systemBaseRadius * 16.66,
    MAX_OVERVIEW_RADIUS: 300,
  };
}

/**
 * Custom Camera Controller
 * Handles pointer/wheel input and smoothly lerps the camera and its look-at target.
 * We use a custom controller to allow seamless swooping transitions between tracking
 * a local planet and viewing the global solar system.
 */
export default function CameraController() {
  const { gl, camera } = useThree();
  const cameraMode = useCelestialStore((s) => s.cameraMode);
  const setCameraMode = useCelestialStore((s) => s.setCameraMode);
  const focusedBodyId = useCelestialStore((s) => s.focusedBodyId);

  const setFocusedBody = useCelestialStore((s) => s.setFocusedBody);

  // Maintain separate spherical states for each mode
  const focusSpherical = useRef(new THREE.Spherical(6, Math.PI / 3, Math.PI / 4));
  const systemSpherical = useRef(new THREE.Spherical(12, Math.PI / 3, Math.PI / 4));
  const overviewSpherical = useRef(new THREE.Spherical(DEFAULT_OVERVIEW_RADIUS, Math.PI / 3, Math.PI / 4));
  
  // Current actual values being smoothed
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  // Targets to lerp towards
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 0));

  // Input state
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    // Set touch-action none directly on the canvas style to prevent browser scroll interception
    el.style.touchAction = 'none';
    el.oncontextmenu = (e) => e.preventDefault();
    
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
      try { el.setPointerCapture(e.pointerId); } catch (e) {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      previousMouse.current = { x: e.clientX, y: e.clientY };

      const mode = useCelestialStore.getState().cameraMode;
      const rotateSpeed = 0.005;
      
      const spherical = 
        mode === 'overview' ? overviewSpherical.current : 
        mode === 'system' ? systemSpherical.current : 
        focusSpherical.current;
      
      spherical.theta -= deltaX * rotateSpeed;
      spherical.phi -= deltaY * rotateSpeed;
      
      const EPSILON = 0.001;
      spherical.phi = Math.max(EPSILON, Math.min(Math.PI - EPSILON, spherical.phi));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      try { el.releasePointerCapture(e.pointerId); } catch (e) {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); 
      const state = useCelestialStore.getState();
      const mode = state.cameraMode;
      const currentFocusedId = state.focusedBodyId;
      
      const bounds = getCameraBounds(currentFocusedId);
      if (!bounds) return;

      if (mode === 'focus') {
        const zoomSpeed = 0.02 * (bounds.MAX_FOCUS_RADIUS / 8); // Scale zoom speed for larger planets
        focusSpherical.current.radius += e.deltaY * zoomSpeed;
        
        if (focusSpherical.current.radius < bounds.MIN_FOCUS_RADIUS) {
          focusSpherical.current.radius = bounds.MIN_FOCUS_RADIUS;
        } else if (focusSpherical.current.radius > bounds.MAX_FOCUS_RADIUS) {
          focusSpherical.current.radius = bounds.MAX_FOCUS_RADIUS; 
          
          systemSpherical.current.theta = focusSpherical.current.theta;
          systemSpherical.current.phi = focusSpherical.current.phi;
          
          const config = CELESTIAL_BODIES[currentFocusedId];
          if (config.parentId) {
            setFocusedBody(config.parentId);
            const parentBounds = getCameraBounds(config.parentId);
            systemSpherical.current.radius = parentBounds ? parentBounds.MIN_SYSTEM_RADIUS : bounds.MIN_SYSTEM_RADIUS;
          } else {
            systemSpherical.current.radius = bounds.MIN_SYSTEM_RADIUS;
          }
          
          setCameraMode('system');
        }
      } else if (mode === 'system') {
        const zoomSpeed = 0.05 * (bounds.MAX_SYSTEM_RADIUS / 25);
        systemSpherical.current.radius += e.deltaY * zoomSpeed;
        
        if (systemSpherical.current.radius < bounds.MIN_SYSTEM_RADIUS) {
          systemSpherical.current.radius = bounds.MIN_SYSTEM_RADIUS;
          
          focusSpherical.current.theta = systemSpherical.current.theta;
          focusSpherical.current.phi = systemSpherical.current.phi;
          focusSpherical.current.radius = bounds.MAX_FOCUS_RADIUS;
          
          setCameraMode('focus');
        } else if (systemSpherical.current.radius > bounds.MAX_SYSTEM_RADIUS) {
          systemSpherical.current.radius = bounds.MAX_SYSTEM_RADIUS;
          
          overviewSpherical.current.theta = systemSpherical.current.theta;
          overviewSpherical.current.phi = systemSpherical.current.phi;
          overviewSpherical.current.radius = bounds.MIN_OVERVIEW_RADIUS;
          
          setCameraMode('overview');
        }
      } else {
        const zoomSpeed = 0.15;
        overviewSpherical.current.radius += e.deltaY * zoomSpeed;
        
        if (overviewSpherical.current.radius < bounds.MIN_OVERVIEW_RADIUS) {
          overviewSpherical.current.radius = bounds.MIN_OVERVIEW_RADIUS;
          
          systemSpherical.current.theta = overviewSpherical.current.theta;
          systemSpherical.current.phi = overviewSpherical.current.phi;
          systemSpherical.current.radius = bounds.MAX_SYSTEM_RADIUS;
          
          setCameraMode('system');
        } else if (overviewSpherical.current.radius > bounds.MAX_OVERVIEW_RADIUS) {
          overviewSpherical.current.radius = bounds.MAX_OVERVIEW_RADIUS;
        }
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    // Attach move and up to window so dragging doesn't break if pointer leaves canvas
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [gl, setCameraMode, setFocusedBody]);

  // Listen for mode changes that weren't triggered by wheel (e.g. clicking a planet)
  // to sync the focus/system spherical to the overview's angle for a smooth swoop-in.
  useEffect(() => {
    const bounds = getCameraBounds(focusedBodyId);
    if (!bounds) return;

    if (cameraMode === 'focus') {
      focusSpherical.current.theta = overviewSpherical.current.theta;
      focusSpherical.current.phi = overviewSpherical.current.phi;
      // Reset radius to a nice viewing distance dynamically scaled
      focusSpherical.current.radius = (bounds.MIN_FOCUS_RADIUS + bounds.MAX_FOCUS_RADIUS) / 2; 
    } else if (cameraMode === 'system') {
      systemSpherical.current.theta = overviewSpherical.current.theta;
      systemSpherical.current.phi = overviewSpherical.current.phi;
      systemSpherical.current.radius = (bounds.MIN_SYSTEM_RADIUS + bounds.MAX_SYSTEM_RADIUS) / 2;
    }
  }, [cameraMode, focusedBodyId]);

  useFrame((state, delta) => {
    // 1. Determine targets based on mode
    if (cameraMode === 'overview') {
      targetLookAt.current.set(0, 0, 0); // Sun
      targetCamPos.current.setFromSpherical(overviewSpherical.current);
    } else if (cameraMode === 'system') {
      // System mode: target the parent body (or self if it has no parent)
      const config = CELESTIAL_BODIES[focusedBodyId];
      if (config) {
        const targetId = config.parentId || focusedBodyId;
        getPlanetPosition(targetId, new Date(), targetLookAt.current);
      }
      const offset = new THREE.Vector3().setFromSpherical(systemSpherical.current);
      targetCamPos.current.copy(targetLookAt.current).add(offset);
    } else {
      // Focus mode
      getPlanetPosition(focusedBodyId, new Date(), targetLookAt.current);
      const offset = new THREE.Vector3().setFromSpherical(focusSpherical.current);
      targetCamPos.current.copy(targetLookAt.current).add(offset);
    }

    // Apply the SolarSystem's 23.44 degree ecliptic tilt to the targets 
    // so the camera tracks the planet's actual world position.
    const eclipticTilt = new THREE.Euler(23.44 * (Math.PI / 180), 0, 0);
    targetLookAt.current.applyEuler(eclipticTilt);
    targetCamPos.current.applyEuler(eclipticTilt);

    // 2. Smoothly lerp current values towards targets
    // Time-scaled lerp factor for frame-rate independence
    const t = 1.0 - Math.exp(-8 * delta);

    currentLookAt.current.lerp(targetLookAt.current, t);
    camera.position.lerp(targetCamPos.current, t);
    camera.lookAt(currentLookAt.current);
  });

  return null; // Logic-only component
}
