import type { HttpMethod, KeyValuePair, RequestBody } from './request';

export interface Project {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    collections: number;
  };
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
  auth?: any;
  variables?: KeyValuePair[];
  createdAt: number;
  updatedAt: number;
}

// Data as it comes from the Backend API
export interface PublishedCollection {
  id: string;
  name: string;
  description: string | null;
  type: string;
  fileName: string | null;
  data: any; // Usually contains { items: CollectionItem[] }
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export type CollectionItem = FolderNode | RequestNode;

export interface FolderNode {
  type: 'folder';
  id: string;
  name: string;
  items: CollectionItem[];
}

export interface RequestNode {
  type: 'request';
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: any | null;
  preScript: string;
  testsScript: string;
  description?: string;
}
