import { create } from 'zustand';

interface CelestialState {
  /** ID of the currently focused celestial body (key into CELESTIAL_BODIES) */
  focusedBodyId: string;
  /** Set the focused body — Phase 3's selector widget will call this */
  setFocusedBody: (id: string) => void;
}

export const useCelestialStore = create<CelestialState>((set) => ({
  focusedBodyId: 'earth',
  setFocusedBody: (id: string) => set({ focusedBodyId: id }),
}));
