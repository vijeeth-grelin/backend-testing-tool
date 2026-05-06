import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/utils/toast';
import { 
  Shield, Plus, FileJson, Globe, Trash2, Database, ExternalLink, 
  Loader2, FolderPlus, Folder, Clock, Tag, LayoutDashboard, Settings2,
  X, Save, ChevronRight, ListFilter, ShieldCheck, Key, FileCode, LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { projectSchema, collectionSchema, handleZodError } from '@/utils/validation';
import { safeInput } from '@/utils/security';
import { z } from 'zod';

import type { Project, Collection, RequestNode, PublishedCollection } from '@/types/collection';
import type { KeyValuePair, HttpMethod, BodyType } from '@/types/request';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [collections, setCollections] = useState<PublishedCollection[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Project Form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projBaseUrl, setProjBaseUrl] = useState('');

  // Collection Builder State
  const [collName, setCollName] = useState('');
  const [requests, setRequests] = useState<RequestNode[]>([]);
  const [activeReqIndex, setActiveReqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');

  const { token, logout } = useAuthStore();

  const fetchData = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (e) {
      showToast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async (projId: string) => {
    try {
      const res = await api.get(`/api/projects/${projId}/collections`);
      setCollections(res.data);
    } catch (e) {
      showToast.error('Failed to load collections');
    }
  };

  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    if (selectedProjectId) {
      fetchCollections(selectedProjectId);
      // Clear builder state when switching projects
      setCollName('');
      setRequests([]);
      setActiveReqIndex(null);
    }
  }, [selectedProjectId]);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      const data = { 
        name: safeInput(projName), 
        description: safeInput(projDesc), 
        baseUrl: safeInput(projBaseUrl) 
      };
      projectSchema.parse(data);
      
      setIsSubmitting(true);
      if (editingProjectId) {
        await api.put(`/api/projects/${editingProjectId}`, data);
        showToast.success('Project Updated');
      } else {
        await api.post('/api/projects', data);
        showToast.success('Project Created');
      }
      setProjName(''); setProjDesc(''); setProjBaseUrl(''); 
      setShowProjectForm(false); setEditingProjectId(null);
      fetchData();
    } catch (e: any) {
      handleZodError(e, 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewVersion = () => {
    setCollName('');
    setRequests([]);
    setActiveReqIndex(null);
    showToast.success('New Version Started', 'The builder has been cleared.');
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjName(p.name);
    setProjDesc(p.description || '');
    setProjBaseUrl(p.baseUrl || '');
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project and all its collections?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      showToast.success('Project Deleted');
      if (selectedProjectId === id) setSelectedProjectId(null);
      fetchData();
    } catch (e) {
      showToast.error('Failed to delete project');
    }
  };

  const addEmptyRequest = () => {
    const newReq: RequestNode = {
      type: 'request',
      id: crypto.randomUUID(),
      name: `Request ${requests.length + 1}`,
      method: 'GET',
      url: '',
      params: [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }],
      headers: [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }],
      body: { type: 'json', raw: '' },
      auth: { type: 'none', token: '' },
      preScript: '',
      testsScript: ''
    };
    setRequests([...requests, newReq]);
    setActiveReqIndex(requests.length);
  };

  const updateActiveRequest = (updates: Partial<RequestNode>) => {
    if (activeReqIndex === null) return;
    const newRequests = [...requests];
    newRequests[activeReqIndex] = { ...newRequests[activeReqIndex], ...updates };
    setRequests(newRequests);
  };

  const deleteRequest = (index: number) => {
    const newRequests = requests.filter((_, i) => i !== index);
    setRequests(newRequests);
    if (activeReqIndex === index) setActiveReqIndex(null);
    else if (activeReqIndex !== null && activeReqIndex > index) setActiveReqIndex(activeReqIndex - 1);
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Delete this version?')) return;
    try {
      await api.delete(`/api/admin/collections/${id}`);
      showToast.success('Version Deleted');
      if (selectedProjectId) fetchCollections(selectedProjectId);
      fetchData();
    } catch (e) { showToast.error('Delete failed'); }
  };

  const handleLoadCollection = (collection: PublishedCollection) => {
    try {
      const data = typeof collection.data === 'string' ? JSON.parse(collection.data) : collection.data;
      setCollName(collection.name);
      setRequests(data.items || []);
      setActiveReqIndex(data.items?.length > 0 ? 0 : null);
      showToast.success('Version Loaded', 'You can now edit and re-publish this version.');
    } catch (e) {
      showToast.error('Failed to load version data');
    }
  };

  const handlePublishCollection = async () => {
    if (isSubmitting) return; // Prevent double click
    
    if (!selectedProjectId || !collName || requests.length === 0) {
      showToast.error('Provide a version name and at least one request');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const sanitizedCollName = safeInput(collName);
      const collectionData = {
        name: sanitizedCollName,
        items: requests.map(r => ({ ...r, type: 'request' }))
      };

      collectionSchema.parse({ name: sanitizedCollName, requests });

      setIsSubmitting(true);

      await api.post(`/api/admin/projects/${selectedProjectId}/collections`, {
        name: collName,
        description: '',
        type: 'COLLECTION',
        data: collectionData,
        fileName: `${collName.toLowerCase().replace(/\s+/g, '-')}.json`
      });

      showToast.success('Version Published');
      setCollName(''); setRequests([]); setActiveReqIndex(null);
      fetchCollections(selectedProjectId);
      fetchData(); 
    } catch (error: any) {
      handleZodError(error, 'Publish failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm backdrop-blur-md bg-card/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
            <Shield size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">Project Master</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] text-primary/70">Centralized API Management</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => window.open('/', '_blank')} className="text-xs font-bold flex items-center gap-2 hover:text-primary transition-all">
            <LayoutDashboard size={14} /> Open Portal
          </button>
          
          <div className="h-8 w-px bg-border mx-2" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Grelinhealth Team</p>
              <p className="text-[10px] text-primary font-bold">Pro Account</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-xs font-black border-2 border-background shadow-xl hover:scale-110 transition-transform cursor-pointer">
              GT
            </div>
          </div>

          <button onClick={logout} className="p-2.5 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive hover:text-white transition-all border border-destructive/20 shadow-sm" title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r bg-card/30 flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Managed Projects</h2>
            <button 
              onClick={() => { setShowProjectForm(true); setEditingProjectId(null); setProjName(''); setProjDesc(''); setProjBaseUrl(''); }}
              className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
            >
              <FolderPlus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {showProjectForm && (
              <form onSubmit={handleSaveProject} className="p-6 bg-card border rounded-3xl shadow-xl space-y-4 mb-4 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">{editingProjectId ? 'Edit Project' : 'New Project'}</h3>
                  <button type="button" onClick={() => setShowProjectForm(false)} className="text-muted-foreground"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <input required value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project Name" className="w-full bg-muted/20 border rounded-xl px-3 py-2 text-xs outline-none" />
                  <input value={projBaseUrl} onChange={e => setProjBaseUrl(e.target.value)} placeholder="Base URL (e.g. https://api.crm.com)" className="w-full bg-muted/20 border rounded-xl px-3 py-2 text-xs outline-none" />
                  <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Description" className="w-full bg-muted/20 border rounded-xl px-3 py-2 text-xs outline-none resize-none" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-black text-[10px] py-2.5 rounded-xl shadow-lg shadow-primary/20">
                  {isSubmitting ? 'SAVING...' : 'SAVE PROJECT'}
                </button>
              </form>
            )}

            {projects.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={cn(
                  "group p-4 rounded-2xl border transition-all cursor-pointer",
                  selectedProjectId === p.id ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-card hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <Folder size={18} className={selectedProjectId === p.id ? "text-primary-foreground" : "text-primary"} />
                    <p className="text-sm font-black truncate max-w-[140px]">{p.name}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); handleEditProject(p); }} className={cn("p-1 rounded-md", selectedProjectId === p.id ? "hover:bg-white/20" : "hover:bg-muted")}><Settings2 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className={cn("p-1 rounded-md", selectedProjectId === p.id ? "hover:bg-white/20" : "hover:bg-destructive/10 text-destructive")}><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className={cn("text-[9px] font-bold truncate opacity-60", selectedProjectId === p.id ? "text-primary-foreground" : "text-muted-foreground")}>{p.baseUrl || 'No Base URL'}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-hidden flex flex-col bg-muted/10">
          {!selectedProjectId ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
              <Database size={100} strokeWidth={1} />
              <p className="mt-4 font-black uppercase tracking-[0.3em]">Select a project to build collections</p>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
               <div className="w-72 border-r bg-card/20 flex flex-col">
                  <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Folder</h3>
                    <button 
                      onClick={handleNewVersion}
                      className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                      title="New Version"
                    >
                      <FolderPlus size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {collections.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => handleLoadCollection(c)}
                        className="p-4 bg-card border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
                      >
                        <p className="text-xs font-black">{c.name}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCollection(c.id); }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {collections.length === 0 && <p className="text-xs text-muted-foreground italic p-4 text-center">No versions published</p>}
                  </div>
               </div>

               <div className="flex-1 flex flex-col overflow-hidden bg-background">
                 <div className="p-8 border-b bg-card flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{projects.find(p => p.id === selectedProjectId)?.name}</h2>
                      <p className="text-[10px] text-primary font-bold uppercase mt-1 tracking-widest">Builder Mode</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        value={collName} onChange={e => setCollName(e.target.value)} 
                        placeholder="Folder name"
                        className="bg-muted border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary w-40"
                      />
                      <button 
                        onClick={handlePublishCollection}
                        disabled={isSubmitting || requests.length === 0 || !collName.trim()}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 disabled:opacity-30"
                      >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Publish
                      </button>
                    </div>
                 </div>

                 <div className="flex-1 flex overflow-hidden">
                    <div className="w-64 border-r bg-muted/5 flex flex-col">
                      <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Requests</span>
                        <button onClick={addEmptyRequest} className="p-1 bg-primary/10 text-primary rounded-md transition-all hover:bg-primary/20"><Plus size={16} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {requests.map((r, i) => (
                          <div 
                            key={r.id} 
                            onClick={() => setActiveReqIndex(i)}
                            className={cn(
                              "group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                              activeReqIndex === i ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-card border-border hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                               <span className={cn("text-[8px] font-black w-8 text-right", 
                                 activeReqIndex === i ? "text-white" : r.method === 'GET' ? "text-blue-500" : "text-green-500"
                               )}>{r.method}</span>
                               <span className="text-[11px] font-bold truncate">{r.name}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteRequest(i); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 text-destructive rounded-md"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                      {activeReqIndex !== null ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                           <div className="p-6 border-b bg-card space-y-6">
                              <div className="grid grid-cols-12 gap-4">
                                <select 
                                  value={requests[activeReqIndex].method}
                                  onChange={(e) => updateActiveRequest({ method: e.target.value as HttpMethod })}
                                  className="col-span-2 bg-muted/30 border rounded-xl px-3 py-2.5 text-xs font-black outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                                </select>
                                <input 
                                  value={requests[activeReqIndex].name}
                                  onChange={(e) => updateActiveRequest({ name: e.target.value })}
                                  className="col-span-10 bg-muted/30 border rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                  placeholder="Friendly Name"
                                />
                              </div>
                              <div className="flex items-center bg-muted/30 border rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-muted/50 border-r text-[10px] font-mono text-muted-foreground">{projects.find(p => p.id === selectedProjectId)?.baseUrl}/</div>
                                <input 
                                  value={requests[activeReqIndex].url}
                                  onChange={(e) => updateActiveRequest({ url: e.target.value })}
                                  className="flex-1 px-4 py-2.5 text-xs font-mono outline-none bg-transparent"
                                  placeholder="api/endpoint"
                                />
                              </div>
                           </div>

                           <div className="flex border-b bg-muted/10 px-6 gap-6">
                              {[
                                { id: 'params', name: 'Params', icon: <ListFilter size={14} /> },
                                { id: 'headers', name: 'Headers', icon: <Tag size={14} /> },
                                { id: 'body', name: 'Body', icon: <FileCode size={14} /> },
                                { id: 'auth', name: 'Auth', icon: <ShieldCheck size={14} /> },
                              ].map(t => (
                                <button 
                                  key={t.id} 
                                  onClick={() => setActiveTab(t.id as any)}
                                  className={cn(
                                    "flex items-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
                                    activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {t.icon} {t.name}
                                </button>
                              ))}
                           </div>

                           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                              {activeTab === 'params' && (
                                <KeyValueTable data={requests[activeReqIndex].params} onChange={(p) => updateActiveRequest({ params: p })} />
                              )}
                              {activeTab === 'headers' && (
                                <KeyValueTable data={requests[activeReqIndex].headers} onChange={(h) => updateActiveRequest({ headers: h })} />
                              )}
                              {activeTab === 'body' && (
                                <div className="space-y-4 h-full flex flex-col">
                                   <select 
                                      value={requests[activeReqIndex].body.type}
                                      onChange={(e) => updateActiveRequest({ body: { ...requests[activeReqIndex].body, type: e.target.value as BodyType } })}
                                      className="w-40 bg-muted/30 border rounded-lg px-3 py-2 text-[10px] font-bold uppercase outline-none"
                                   >
                                      <option value="none">No Body</option>
                                      <option value="json">JSON</option>
                                      <option value="raw">Raw Text</option>
                                   </select>
                                   <textarea 
                                      value={requests[activeReqIndex].body.raw}
                                      onChange={(e) => updateActiveRequest({ body: { ...requests[activeReqIndex].body, raw: e.target.value } })}
                                      className="flex-1 w-full bg-card/50 border rounded-[2rem] p-6 text-xs font-mono outline-none resize-none min-h-[300px] focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all custom-scrollbar shadow-inner"
                                      placeholder='{ "key": "value" }'
                                   />
                                </div>
                              )}
                              {activeTab === 'auth' && (
                                <div className="space-y-6 max-w-xl">
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Auth Type</label>
                                      <select 
                                        value={requests[activeReqIndex].auth.type}
                                        onChange={(e) => updateActiveRequest({ auth: { ...requests[activeReqIndex].auth, type: e.target.value as any } })}
                                        className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-xs outline-none"
                                      >
                                        <option value="none">No Auth</option>
                                        <option value="bearer">Bearer Token</option>
                                      </select>
                                   </div>
                                   {requests[activeReqIndex].auth.type === 'bearer' && (
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Token</label>
                                        <input 
                                          value={requests[activeReqIndex].auth.token}
                                          onChange={(e) => updateActiveRequest({ auth: { ...requests[activeReqIndex].auth, token: e.target.value } })}
                                          className="w-full bg-muted/30 border rounded-xl px-4 py-3 text-xs font-mono outline-none"
                                          placeholder="eyJhbG..."
                                        />
                                      </div>
                                   )}
                                </div>
                              )}
                           </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-20">
                          <LayoutDashboard size={80} />
                          <p className="mt-4 font-black uppercase tracking-widest text-sm">Select a request to configure</p>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function KeyValueTable({ data, onChange }: { data: any[], onChange: (data: any[]) => void }) {
  const addRow = () => onChange([...data, { key: '', value: '', enabled: true }]);
  const removeRow = (index: number) => onChange(data.filter((_, i) => i !== index));
  const updateRow = (index: number, updates: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12 text-center">Use</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" checked={row.enabled} onChange={(e) => updateRow(i, { enabled: e.target.checked })} className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                </td>
                <td className="px-2 py-2">
                  <input value={row.key} onChange={(e) => updateRow(i, { key: e.target.value })} className="w-full bg-transparent px-2 py-1 text-xs outline-none" placeholder="Key" />
                </td>
                <td className="px-2 py-2">
                  <input value={row.value} onChange={(e) => updateRow(i, { value: e.target.value })} className="w-full bg-transparent px-2 py-1 text-xs outline-none" placeholder="Value" />
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
        <Plus size={12} /> Add New Row
      </button>
    </div>
  );
}
