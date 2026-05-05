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

  setResponse: (response) => set({ response, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false, response: null }),
  setActiveTab: (activeTab) => set({ activeTab }),
  clearResponse: () => set({ response: null, error: null, isLoading: false }),
}));
