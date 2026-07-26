import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimeZone = 'UTC' | 'Local';

interface SettingsState {
  timeZone: TimeZone;
  setTimeZone: (tz: TimeZone) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      timeZone: 'UTC',
      setTimeZone: (timeZone) => set({ timeZone }),

      isSettingsOpen: false,
      setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
    }),
    {
      name: 'orion-settings',
      // Don't persist UI state like modal open/close
      partialize: (state) => ({ timeZone: state.timeZone }),
    }
  )
);
