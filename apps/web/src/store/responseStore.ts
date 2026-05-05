import { create } from 'zustand';
import type { ApiResponse } from '../types/request';

interface ResponseState {
  response: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  activeTab: string;

  setResponse: (response: ApiResponse | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: string) => void;
  clearResponse: () => void;
}

export const useResponseStore = create<ResponseState>((set) => ({
  response: null,
  isLoading: false,
  error: null,
  activeTab: 'body',

  setResponse: (response) => {
    console.log('STORE: setResponse called');
    set({ response, isLoading: false, error: null });
  },
  setLoading: (loading) => {
    console.log('STORE: setLoading called with:', loading);
    set({ isLoading: loading });
  },
  setError: (error) => {
    console.log('STORE: setError called with:', error);
    // Only reset loading if we are actually setting an error (not clearing it)
    set((state) => ({ 
      error, 
      isLoading: error ? false : state.isLoading,
      response: error ? null : state.response 
    }));
  },
  setActiveTab: (activeTab) => set({ activeTab }),
  clearResponse: () => set({ response: null, error: null, isLoading: false }),
}));
