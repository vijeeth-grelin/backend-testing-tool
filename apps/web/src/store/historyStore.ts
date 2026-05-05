import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry } from '../types/history';

interface HistoryState {
  entries: HistoryEntry[];
  search: string;

  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  setSearch: (search: string) => void;
  getFilteredEntries: () => HistoryEntry[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      search: '',

      addEntry: (entry) => set((state) => {
        const newEntries = [entry, ...state.entries].slice(0, 200);
        return { entries: newEntries };
      }),

      removeEntry: (id) => set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      })),

      clearAll: () => set({ entries: [] }),

      setSearch: (search) => set({ search }),

      getFilteredEntries: () => {
        const { entries, search } = get();
        if (!search) return entries;
        const lowSearch = search.toLowerCase();
        return entries.filter((e) =>
          e.url.toLowerCase().includes(lowSearch) ||
          e.method.toLowerCase().includes(lowSearch)
        );
      },
    }),
    {
      name: 'api-tester:history',
      version: 1,
    }
  )
);
