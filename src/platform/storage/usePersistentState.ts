import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PersistentState {
  [key: string]: unknown;
}

interface PersistentStateStore extends PersistentState {
  setState: (key: string, value: unknown) => void;
  getState: (key: string) => unknown;
  removeState: (key: string) => void;
  clearAll: () => void;
  hydrate: (data: Record<string, unknown>) => void;
}

export const usePersistentStore = create<PersistentStateStore>()(
  persist(
    (set, get) => ({
      setState: (key: string, value: unknown) => set((state) => ({ ...state, [key]: value })),
      getState: (key: string) => get()[key],
      removeState: (key: string) => set((state) => { const { [key]: _, ...rest } = state; return rest; }),
      clearAll: () => set({}),
      hydrate: (data: Record<string, unknown>) => set(data),
    }),
    {
      name: "lifeos1-persistent-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { setState, getState, removeState, clearAll, hydrate, ...rest } = state;
        return rest;
      },
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("[PersistentStore] Rehydrated", Object.keys(state).length, "keys");
        }
      },
    }
  )
);

// Hook for individual keys with type safety
export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const store = usePersistentStore();
  const value = (store[key] as T) ?? defaultValue;
  const setValue = (newValue: T | ((prev: T) => T)) => {
    const resolved = typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue;
    store.setState(key, resolved);
  };
  return [value, setValue];
}

// Specific hooks for common data
export function useMusicPlaylists() {
  return usePersistentState<{ id: string; name: string; trackIds: string[]; color: string }[]>("music_playlists", []);
}

export function useMusicTracks() {
  return usePersistentState<{ id: string; title: string; artist: string; url: string; duration: number }[]>("music_tracks", []);
}

export function useDashboardLayout() {
  return usePersistentState<{ modules: string[]; positions: Record<string, { x: number; y: number; w: number; h: number }> }>("dashboard_layout", { modules: [], positions: {} });
}

export function useQuickLinks() {
  return usePersistentState<{ label: string; url: string; icon: string }[]>("quick_links", []);
}

export function useNotes() {
  return usePersistentState<{ id: string; content: string; createdAt: number }[]>("notes", []);
}

export function useTasks() {
  return usePersistentState<{ id: string; title: string; completed: boolean; dueDate?: number; priority: "low" | "medium" | "high" }[]>("tasks", []);
}

export function useContacts() {
  return usePersistentState<{ id: string; firstName: string; lastName: string; email?: string; phone?: string; company?: string }[]>("contacts", []);
}

export function useAIAgentSettings() {
  return usePersistentState<{ agents: Array<{ id: string; name: string; role: string; enabled: boolean; model: string }> }>("ai_agents", { agents: [] });
}