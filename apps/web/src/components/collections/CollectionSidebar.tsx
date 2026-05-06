import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCollectionStore } from '@/store/collectionStore';
import type { Collection, CollectionItem, FolderNode, RequestNode } from '@/types/collection';
import { ChevronRight, Folder, Plus, FolderPlus, Trash2, ShieldCheck, Globe, Copy, Info, Database } from 'lucide-react';
import { cn } from '@/utils/cn';
import { METHOD_COLORS } from '@/components/request/MethodSelector';
import { useRequestStore } from '@/store/requestStore';
import { useConfirm } from '@/hooks/useConfirm';
import { usePrompt } from '@/hooks/usePrompt';
import { showToast } from '@/utils/toast';
import { safeInput } from '@/utils/security';
import { nameSchema, handleZodError } from '@/utils/validation';
import { z } from 'zod';

export default function CollectionSidebar() {
  const { collections, addCollection, clearAllCollections } = useCollectionStore();
  const { resetRequest } = useRequestStore();
  const prompt = usePrompt();
  const confirm = useConfirm();

  const handleCreateCollection = () => {
    prompt({
      title: 'New Collection',
      label: 'Enter a name for your collection',
      placeholder: 'My Awesome API',
      onConfirm: (name) => {
        try {
          const sanitized = safeInput(name);
          nameSchema.parse(sanitized);
          addCollection(sanitized);
          showToast.success(`Collection "${sanitized}" created`);
        } catch (e: any) {
          handleZodError(e);
        }
      },
    });
  };

  const handleResetWorkspace = () => {
    confirm({
      title: 'Reset Workspace',
      message: 'This will delete all imported collections and reset your active request. Are you sure?',
      variant: 'destructive',
      onConfirm: () => {
        clearAllCollections();
        resetRequest();
        showToast.success('Workspace Reset');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-card/20 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b bg-card/40">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tester Workspace</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleResetWorkspace}
            className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-all active:scale-95"
            title="Reset Workspace"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={handleCreateCollection}
            className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-95"
            title="New Collection"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {/* User Collections Section */}
        <section className="space-y-1">
          {collections.length === 0 ? (
            <div className="px-8 py-12 text-center space-y-4">
              <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto">
                <Database size={32} className="text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground">Your workspace is empty</p>
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">Import from the Portal or create a new collection to start testing.</p>
              </div>
              <button
                onClick={handleCreateCollection}
                className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                Create Collection
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-2 flex items-center gap-2 opacity-50">
                <Folder size={12} className="text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Collections</span>
              </div>
              {collections.map((collection) => (
                <CollectionNode key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function VerifiedNode({ api }: { api: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { importCollection } = useCollectionStore();

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    importCollection(api.collection);
    showToast.success('Cloned to Workspace', `"${api.name}" is now in your personal collections`);
  };
  
  return (
    <div className="space-y-0.5">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/10"
      >
        <div className={cn("transition-transform duration-200", isOpen ? "rotate-90" : "")}>
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>
        <div className="p-1.5 bg-primary/5 rounded-lg">
          <Globe size={14} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate leading-tight">{api.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{api.category || 'Verified API'}</p>
        </div>
        <button 
          onClick={handleClone}
          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-primary/10 rounded-md text-primary transition-all"
          title="Clone to Workspace"
        >
          <Copy size={12} />
        </button>
      </div>
      {isOpen && (
        <div className="ml-4 border-l pl-2 mt-1 space-y-1 animate-in slide-in-from-left-2 duration-200">
          {api.description && (
            <div className="px-2 py-2 mb-2 bg-muted/30 rounded-lg flex gap-2 items-start border border-border/50">
              <Info size={12} className="text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">{api.description}</p>
            </div>
          )}
          {/* Read-only view of the collection */}
          <ReadOnlyCollection collection={api.collection} />
        </div>
      )}
    </div>
  );
}

// Reusable components for the tree view
function ReadOnlyCollection({ collection }: { collection: Collection }) {
  return (
    <div className="space-y-0.5">
      {collection.items?.map((item) => (
        <ReadOnlyItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function ReadOnlyItem({ item }: { item: CollectionItem }) {
  if (item.type === 'folder') {
    return <ReadOnlyFolder folder={item} />;
  }
  return <ReadOnlyRequest request={item} />;
}

function ReadOnlyFolder({ folder }: { folder: FolderNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer text-muted-foreground transition-colors"
      >
        <ChevronRight size={12} className={cn("transition-transform", isOpen ? "rotate-90" : "")} />
        <Folder size={14} className="fill-muted-foreground/10" />
        <span className="text-xs truncate">{folder.name}</span>
      </div>
      {isOpen && (
        <div className="ml-3 border-l pl-2 mt-0.5 space-y-0.5">
          {folder.items?.map((child) => (
            <ReadOnlyItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReadOnlyRequest({ request }: { request: RequestNode }) {
  const { loadRequest } = useRequestStore();
  
  return (
    <div 
      onClick={() => loadRequest(request)}
      className="flex items-center gap-2 px-6 py-1 rounded-md hover:bg-primary/5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
    >
      <span className={cn("text-[8px] font-black w-8 text-right", METHOD_COLORS[request.method])}>
        {request.method}
      </span>
      <span className="text-xs truncate flex-1">{request.name}</span>
    </div>
  );
}

// Original dynamic components for personal workspace
function CollectionNode({ collection }: { collection: Collection }) {
  const [isOpen, setIsOpen] = useState(true);
  const { addFolder, addRequest, deleteCollection } = useCollectionStore();
  const prompt = usePrompt();
  const confirm = useConfirm();

  const handleAddRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    prompt({
      title: 'New Request',
      label: 'Request Name',
      onConfirm: (name) => addRequest(collection.id, name)
    });
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    prompt({
      title: 'New Folder',
      label: 'Folder Name',
      onConfirm: (name) => addFolder(collection.id, name)
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Delete Collection',
      message: `Delete "${collection.name}"?`,
      variant: 'destructive',
      onConfirm: () => deleteCollection(collection.id)
    });
  };

  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
      >
        <ChevronRight size={14} className={cn("text-muted-foreground transition-transform", isOpen ? "rotate-90" : "")} />
        <Folder size={16} className="text-muted-foreground/70" />
        <span className="text-sm font-bold truncate flex-1">{collection.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button onClick={handleAddRequest} className="p-1 hover:bg-muted rounded"><Plus size={12} /></button>
          <button onClick={handleAddFolder} className="p-1 hover:bg-muted rounded"><FolderPlus size={12} /></button>
          <button onClick={handleDelete} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 size={12} /></button>
        </div>
      </div>
      {isOpen && (
        <div className="ml-4 border-l pl-2 mt-0.5 space-y-0.5">
          {collection.items?.map((item) => (
            <ItemNode key={item.id} item={item} collectionId={collection.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemNode({ item, collectionId }: { item: CollectionItem; collectionId: string }) {
  if (item.type === 'folder') {
    return <FolderItemNode folder={item} collectionId={collectionId} />;
  }
  return <RequestItemNode request={item} collectionId={collectionId} />;
}

function FolderItemNode({ folder, collectionId }: { folder: FolderNode; collectionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { addRequest, deleteItem } = useCollectionStore();
  const prompt = usePrompt();

  return (
    <div>
      <div onClick={() => setIsOpen(!isOpen)} className="group flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer">
        <ChevronRight size={12} className={cn("text-muted-foreground transition-transform", isOpen ? "rotate-90" : "")} />
        <Folder size={14} className="text-muted-foreground/50" />
        <span className="text-xs truncate flex-1">{folder.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button onClick={(e) => { 
            e.stopPropagation(); 
            prompt({ 
              title: 'New Request', 
              label: 'Request Name', 
              onConfirm: (name) => {
                try {
                  const sanitized = safeInput(name);
                  nameSchema.parse(sanitized);
                  addRequest(collectionId, sanitized, folder.id);
                } catch (err: any) {
                  handleZodError(err);
                }
              }
            }); 
          }} className="p-1 hover:bg-muted rounded"><Plus size={10} /></button>
          <button onClick={(e) => { e.stopPropagation(); deleteItem(collectionId, folder.id); }} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 size={10} /></button>
        </div>
      </div>
      {isOpen && (
        <div className="ml-3 border-l pl-2 mt-0.5 space-y-0.5">
          {folder.items?.map((child) => <ItemNode key={child.id} item={child} collectionId={collectionId} />)}
        </div>
      )}
    </div>
  );
}

function RequestItemNode({ request, collectionId }: { request: RequestNode; collectionId: string }) {
  const { loadRequest } = useRequestStore();
  const { deleteItem } = useCollectionStore();
  
  return (
    <div onClick={() => loadRequest(request)} className="group flex items-center gap-2 px-6 py-1 rounded-md hover:bg-primary/5 cursor-pointer">
      <span className={cn("text-[8px] font-black w-8 text-right", METHOD_COLORS[request.method])}>{request.method}</span>
      <span className="text-xs truncate flex-1">{request.name}</span>
      <button onClick={(e) => { e.stopPropagation(); deleteItem(collectionId, request.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-destructive"><Trash2 size={10} /></button>
    </div>
  );
}
