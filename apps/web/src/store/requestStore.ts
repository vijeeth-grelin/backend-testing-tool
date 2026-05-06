import { create } from 'zustand';
import type { HttpMethod, KeyValuePair, RequestBody, ApiRequest } from '@/types/request';
import type { RequestNode } from '@/types/collection';

interface RequestState {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: any | null;
  preScript: string;
  testsScript: string;
  activeTab: string;

  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setParams: (params: KeyValuePair[]) => void;
  setHeaders: (headers: KeyValuePair[]) => void;
  setBody: (body: RequestBody) => void;
  setAuth: (auth: any | null) => void;
  setPreScript: (script: string) => void;
  setTestsScript: (script: string) => void;
  setActiveTab: (tab: string) => void;
  loadRequest: (request: RequestNode) => void;
  resetRequest: () => void;
}

const initialRequest: ApiRequest = {
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: { type: 'none' },
  auth: null,
  preScript: '',
  testsScript: '',
};

export const useRequestStore = create<RequestState>((set) => ({
  ...initialRequest,
  activeTab: 'params',

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  setParams: (params) => set({ params }),
  setHeaders: (headers) => set({ headers }),
  setBody: (body) => set({ body }),
  setAuth: (auth) => set({ auth }),
  setPreScript: (preScript) => set({ preScript }),
  setTestsScript: (testsScript) => set({ testsScript }),
  setActiveTab: (activeTab) => set({ activeTab }),
  
  loadRequest: (request) => set({
    method: request.method,
    url: request.url,
    params: request.params,
    headers: request.headers,
    body: request.body,
    auth: request.auth,
    preScript: request.preScript,
    testsScript: request.testsScript,
  }),

  resetRequest: () => set({ ...initialRequest, activeTab: 'params' }),
}));
