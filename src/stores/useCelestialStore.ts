import { create } from 'zustand';

export type CameraMode = 'focus' | 'overview';

interface CelestialState {
  /** ID of the currently focused celestial body (key into CELESTIAL_BODIES) */
  focusedBodyId: string;
  /** Set the focused body — triggers transition back to focus mode if in overview */
  setFocusedBody: (id: string) => void;

  /** Current camera operational mode */
  cameraMode: CameraMode;
  /** Set the camera mode */
  setCameraMode: (mode: CameraMode) => void;
}

export const useCelestialStore = create<CelestialState>((set) => ({
  focusedBodyId: 'earth',
  setFocusedBody: (id: string) => set({ focusedBodyId: id, cameraMode: 'focus' }),
  
  cameraMode: 'focus',
  setCameraMode: (mode: CameraMode) => set({ cameraMode: mode }),
}));
