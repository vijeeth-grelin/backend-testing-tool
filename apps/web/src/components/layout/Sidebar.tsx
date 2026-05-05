import { useState } from 'react';
import { Database, History, Settings, Globe, Plus, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import CollectionSidebar from '../collections/CollectionSidebar';
import HistorySidebar from '../history/HistorySidebar';

type Tab = 'collections' | 'history' | 'environments';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('collections');

  return (
    <aside className="w-64 border-r flex flex-col bg-muted/30">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('collections')}
          className={cn(
            "flex-1 p-3 flex justify-center border-b-2 transition-colors",
            activeTab === 'collections' ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Database size={18} />
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 p-3 flex justify-center border-b-2 transition-colors",
            activeTab === 'history' ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <History size={18} />
        </button>
        <button
          onClick={() => setActiveTab('environments')}
          className={cn(
            "flex-1 p-3 flex justify-center border-b-2 transition-colors",
            activeTab === 'environments' ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe size={18} />
        </button>
      </div>

      <div className="p-3 flex items-center gap-2 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-background border rounded px-8 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'collections' && <CollectionSidebar />}
        {activeTab === 'history' && <HistorySidebar />}
        {activeTab === 'environments' && (
          <div className="p-2 space-y-1 text-sm text-center py-4 text-muted-foreground">
            No environments yet
          </div>
        )}
      </div>

      <div className="p-2 border-t">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
