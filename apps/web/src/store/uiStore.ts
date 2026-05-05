import type { ReactNode } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModalState {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
}

interface UIState {
  modal: ModalState;
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;

  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      modal: {
        isOpen: false,
        title: '',
        content: null,
      },
      openModal: (modal) => set({ modal: { ...modal, isOpen: true } }),
      closeModal: () => set((state) => ({
        modal: { ...state.modal, isOpen: false },
      })),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
