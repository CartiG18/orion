import { create } from 'zustand';

interface BootState {
  /** Whether the boot sequence has completed in this session */
  hasBooted: boolean;
  /** Mark the boot sequence as complete — prevents replay on in-app navigation */
  markBooted: () => void;
}

export const useBootStore = create<BootState>((set) => ({
  hasBooted: false,
  markBooted: () => set({ hasBooted: true }),
}));
