import { create } from 'zustand';

export type CameraMode = 'focus' | 'system' | 'overview';

interface CelestialState {
  /** ID of the currently focused celestial body (key into CELESTIAL_BODIES) */
  focusedBodyId: string;
  /** Set the focused body — triggers transition back to focus mode if in overview */
  setFocusedBody: (id: string) => void;

  /** Current camera operational mode */
  cameraMode: CameraMode;
  /** Set the camera mode */
  setCameraMode: (mode: CameraMode) => void;

  /** Visibility toggle for the floating planet telemetry HUD */
  showTelemetry: boolean;
  setShowTelemetry: (show: boolean) => void;
  toggleTelemetry: () => void;

  /** Set of visible satellite NORAD IDs */
  visibleSatellites: string[];
  toggleSatellite: (id: string) => void;
  setVisibleSatellites: (ids: string[]) => void;
}

export const useCelestialStore = create<CelestialState>((set) => ({
  focusedBodyId: 'earth',
  setFocusedBody: (id: string) => set({ focusedBodyId: id, cameraMode: 'focus' }),
  
  cameraMode: 'focus',
  setCameraMode: (mode: CameraMode) => set({ cameraMode: mode }),

  showTelemetry: true,
  setShowTelemetry: (show: boolean) => set({ showTelemetry: show }),
  toggleTelemetry: () => set((s) => ({ showTelemetry: !s.showTelemetry })),

  visibleSatellites: [],
  setVisibleSatellites: (ids: string[]) => set({ visibleSatellites: ids }),
  toggleSatellite: (id: string) => set((s) => {
    const isVisible = s.visibleSatellites.includes(id);
    if (isVisible) {
      return { visibleSatellites: s.visibleSatellites.filter((sid) => sid !== id) };
    } else {
      return { visibleSatellites: [...s.visibleSatellites, id] };
    }
  }),
}));
