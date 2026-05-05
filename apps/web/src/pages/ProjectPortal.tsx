import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Folder, Database, Search, FileJson, Clock, ArrowLeft, 
  ChevronRight, LayoutGrid, List, Filter, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useCollectionStore } from '../store/collectionStore';
import { showToast } from '../utils/toast';

import type { Project, PublishedCollection } from '../types/collection';

export default function ProjectPortal() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [collections, setCollections] = useState<PublishedCollection[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const navigate = useNavigate();
  const { importCollection } = useCollectionStore();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3001/api/projects');
        setProjects(res.data);
      } catch (e) {
        console.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    try {
      const res = await axios.get(`http://127.0.0.1:3001/api/projects/${project.id}/collections`);
      setCollections(res.data);
    } catch (e) {
      console.error('Failed to load collections');
    }
  };

  const handleOpenInTester = (collection: PublishedCollection) => {
    const baseUrl = selectedProject?.baseUrl || '';
    const updatedData = {
      ...collection.data,
      items: (collection.data.items || []).map((item: any) => {
        if (item.type === 'request') {
          // Only prepend if the URL is relative and baseUrl exists
          const fullUrl = (baseUrl && !item.url.startsWith('http')) 
            ? `${baseUrl.replace(/\/$/, '')}/${item.url.replace(/^\//, '')}`
            : item.url;
          return { ...item, url: fullUrl };
        }
        return item;
      })
    };
    
    importCollection(updatedData);
    showToast.success('Collection Loaded', `"${collection.name}" is now available in your workspace`);
    navigate('/tester');
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        <nav className="h-20 border-b bg-card/80 backdrop-blur-md px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setSelectedProject(null); setCollections([]); }}
              className="p-3 hover:bg-muted rounded-2xl transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="h-6 w-px bg-border" />
            <h2 className="font-black text-2xl tracking-tight">{selectedProject.name}</h2>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-12 bg-muted/5 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight">Available Collections</h1>
              <p className="text-xl text-muted-foreground font-medium">Select a version to open it in the API Tester.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {collections.map(c => (
                <div key={c.id} className="group bg-card border rounded-[2.5rem] p-8 flex items-center justify-between hover:shadow-2xl hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/5 text-primary rounded-3xl group-hover:scale-110 transition-transform">
                      <FileJson size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{c.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                        <Clock size={14} />
                        <span className="text-xs font-bold">{new Date(c.createdAt).toLocaleString()}</span>
                        <span className="text-xs italic">• {c.fileName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleOpenInTester(c)}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Play size={16} />
                    Open in Tester
                  </button>
                </div>
              ))}
              {collections.length === 0 && (
                <div className="p-20 text-center bg-card/50 border border-dashed rounded-[3rem] text-muted-foreground italic">
                  No collections published for this project yet.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
              <Database size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Internal API Portal</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter">Team Collections</h1>
            <p className="text-2xl text-muted-foreground max-w-2xl font-medium">
              Centrally managed API collections for all internal projects and services.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate('/docs')}
               className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 text-primary rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-primary/20"
             >
               <FileJson size={14} /> Platform Guide
             </button>

             <div className="relative w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
               <input 
                 type="text" 
                 placeholder="Search projects..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-card border rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-lg"
               />
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center border border-dashed rounded-[3rem] animate-pulse">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest tracking-widest">Syncing Repository...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className="group bg-card border rounded-[3rem] p-10 hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="p-5 bg-primary/5 rounded-[2rem] text-primary group-hover:scale-110 transition-transform duration-300 w-fit">
                  <Folder size={40} />
                </div>
                
                <div className="space-y-4 mt-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{project.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <FileJson size={16} className="text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest">{project._count?.collections || 0} Collections</span>
                    </div>
                    <div className="p-3 bg-muted rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
