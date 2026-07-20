import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'green' | 'amber' | 'cyan' | 'monochrome';
export type TimeZone = 'UTC' | 'Local';

interface SettingsState {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;

  timeZone: TimeZone;
  setTimeZone: (tz: TimeZone) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'green',
      setTheme: (theme) => set({ theme }),

      timeZone: 'UTC',
      setTimeZone: (timeZone) => set({ timeZone }),

      isSettingsOpen: false,
      setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
    }),
    {
      name: 'orion-settings',
      // Don't persist UI state like modal open/close
      partialize: (state) => ({ theme: state.theme, timeZone: state.timeZone }),
    }
  )
);
