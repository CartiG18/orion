import { create } from 'zustand';

interface PanelState {
  // Keyed by panel ID, true if collapsed to just the title bar
  collapsed: Record<string, boolean>;
  toggleCollapse: (id: string) => void;
  
  // The ID of the currently expanded panel, or null if none
  expandedPanelId: string | null;
  expandPanel: (id: string) => void;
  closeExpanded: () => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  collapsed: {},
  toggleCollapse: (id: string) => set((state) => ({
    collapsed: {
      ...state.collapsed,
      [id]: !state.collapsed[id]
    }
  })),

  expandedPanelId: null,
  expandPanel: (id: string) => set({ expandedPanelId: id }),
  closeExpanded: () => set({ expandedPanelId: null }),
}));
