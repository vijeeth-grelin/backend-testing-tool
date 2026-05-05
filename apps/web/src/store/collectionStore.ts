import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, RequestNode, FolderNode, CollectionItem } from '../types/collection';

interface CollectionState {
  collections: Collection[];
  activeRequestId: string | null;

  addCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  setActiveRequestId: (id: string | null) => void;

  addFolder: (collectionId: string, name: string, parentFolderId?: string) => void;
  addItem: (collectionId: string, item: CollectionItem, parentFolderId?: string) => void;
  addRequest: (collectionId: string, request: RequestNode | string, parentFolderId?: string) => void;
  deleteItem: (collectionId: string, itemId: string) => void;
  updateItem: (collectionId: string, itemId: string, updates: Partial<CollectionItem>) => void;
  importCollection: (collection: Collection) => void;
  clearAllCollections: () => void;
}

const createDefaultRequest = (name: string): RequestNode => ({
  type: 'request',
  id: crypto.randomUUID(),
  name,
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: { type: 'none' },
  auth: null,
  preScript: '',
  testsScript: '',
});

const regenerateIds = (items: CollectionItem[]): CollectionItem[] => {
  return items.map(item => {
    const newItem = { ...item, id: crypto.randomUUID() };
    if (newItem.type === 'folder') {
      newItem.items = regenerateIds(newItem.items);
    }
    return newItem;
  });
};

const findAndAddItem = (items: CollectionItem[], parentId: string, newItem: CollectionItem): boolean => {
  for (const item of items) {
    if (item.type === 'folder') {
      if (item.id === parentId) {
        item.items.push(newItem);
        return true;
      }
      if (findAndAddItem(item.items, parentId, newItem)) return true;
    }
  }
  return false;
};

const findAndDeleteItem = (items: CollectionItem[], itemId: string): boolean => {
  const index = items.findIndex((i) => i.id === itemId);
  if (index !== -1) {
    items.splice(index, 1);
    return true;
  }
  for (const item of items) {
    if (item.type === 'folder' && findAndDeleteItem(item.items, itemId)) return true;
  }
  return false;
};

const findAndUpdateItem = (items: CollectionItem[], itemId: string, updates: Partial<CollectionItem>): boolean => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === itemId) {
      items[i] = { ...items[i], ...updates } as CollectionItem;
      return true;
    }
    if (items[i].type === 'folder' && findAndUpdateItem((items[i] as FolderNode).items, itemId, updates)) return true;
  }
  return false;
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collections: [],
      activeRequestId: null,

      addCollection: (name) => set((state) => ({
        collections: [
          ...state.collections,
          {
            id: crypto.randomUUID(),
            name,
            items: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })),

      deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
      })),

      renameCollection: (id, name) => set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? { ...c, name, updatedAt: Date.now() } : c
        ),
      })),

      setActiveRequestId: (activeRequestId) => set({ activeRequestId }),

      addItem: (collectionId, item, parentFolderId) => set((state) => {
        const collections = [...state.collections];
        const collection = collections.find((c) => c.id === collectionId);
        if (!collection) return state;

        if (parentFolderId) {
          findAndAddItem(collection.items, parentFolderId, item);
        } else {
          collection.items.push(item);
        }
        collection.updatedAt = Date.now();
        return { collections };
      }),

      addFolder: (collectionId, name, parentFolderId) => {
        const newFolder: FolderNode = {
          type: 'folder',
          id: crypto.randomUUID(),
          name,
          items: [],
        };
        get().addItem(collectionId, newFolder, parentFolderId);
      },

      addRequest: (collectionId: string, request: RequestNode | string, parentFolderId?: string) => {
        const requestNode = typeof request === 'string' ? createDefaultRequest(request) : request;
        get().addItem(collectionId, requestNode, parentFolderId);
      },

      importCollection: (collection: Collection) => set((state) => {
        const existingIndex = state.collections.findIndex(c => c.name === collection.name);
        
        const newCollection: Collection = {
          ...collection,
          id: existingIndex !== -1 ? state.collections[existingIndex].id : crypto.randomUUID(),
          items: regenerateIds(collection.items || []),
          createdAt: existingIndex !== -1 ? state.collections[existingIndex].createdAt : Date.now(),
          updatedAt: Date.now(),
        };

        if (existingIndex !== -1) {
          const newCollections = [...state.collections];
          newCollections[existingIndex] = newCollection;
          return { collections: newCollections };
        }

        return {
          collections: [...state.collections, newCollection]
        };
      }),

      deleteItem: (collectionId, itemId) => set((state) => {
        const collections = [...state.collections];
        const collection = collections.find((c) => c.id === collectionId);
        if (!collection) return state;

        findAndDeleteItem(collection.items, itemId);
        collection.updatedAt = Date.now();
        return { collections };
      }),

      updateItem: (collectionId, itemId, updates) => set((state) => {
        const collections = [...state.collections];
        const collection = collections.find((c) => c.id === collectionId);
        if (!collection) return state;

        findAndUpdateItem(collection.items, itemId, updates);
        collection.updatedAt = Date.now();
        return { collections };
      }),
      
      clearAllCollections: () => set({ collections: [], activeRequestId: null }),
    }),
    {
      name: 'api-tester:collections',
      version: 1,
    }
  )
);
