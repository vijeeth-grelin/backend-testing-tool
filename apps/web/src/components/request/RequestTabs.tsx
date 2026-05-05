import { useState } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { cn } from '../../utils/cn';
import KeyValueTable from './KeyValueTable';
import BodyEditor from './BodyEditor';
import { FileJson, ListFilter, Shield } from 'lucide-react';
import AuthManager from './AuthManager';

export default function RequestTabs() {
  const [activeTab, setActiveTab] = useState('params');
  const { params, setParams, headers, setHeaders } = useRequestStore();

  const tabs = [
    { id: 'params', name: 'Params', icon: <ListFilter size={14} />, count: params.filter(p => p.enabled && p.key).length },
    { id: 'headers', name: 'Headers', icon: <FileJson size={14} />, count: headers.filter(h => h.enabled && h.key).length },
    { id: 'body', name: 'Body', icon: <FileJson size={14} /> },
    { id: 'auth', name: 'Auth', icon: <Shield size={14} /> },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card/20 rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex border-b bg-muted/20 px-2 gap-1 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            {tab.icon}
            {tab.name}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'params' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <KeyValueTable 
              title="Query Parameters" 
              data={params} 
              onChange={setParams} 
            />
          </div>
        )}
        {activeTab === 'headers' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <KeyValueTable 
              title="Request Headers" 
              data={headers} 
              onChange={setHeaders} 
            />
          </div>
        )}
        {activeTab === 'body' && (
          <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BodyEditor />
          </div>
        )}
        {activeTab === 'auth' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
            <AuthManager />
          </div>
        )}
      </div>
    </div>
  );
}
