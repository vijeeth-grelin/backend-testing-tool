import { useState } from 'react';
import { useRequestStore } from '../../store/requestStore';
import { Key, Shield, User, Lock, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function AuthManager() {
  const { auth, setAuth } = useRequestStore();
  
  const types = [
    { id: 'none', name: 'No Auth', icon: <Shield size={14} /> },
    { id: 'bearer', name: 'Bearer Token', icon: <Lock size={14} /> },
    { id: 'basic', name: 'Basic Auth', icon: <User size={14} /> },
    { id: 'apikey', name: 'API Key', icon: <Key size={14} /> },
  ];

  const currentType = auth?.type || 'none';

  const updateAuth = (updates: any) => {
    setAuth({ ...auth, ...updates });
  };

  const handleTypeChange = (type: string) => {
    if (type === 'none') setAuth(null);
    else setAuth({ type, ...getDefaults(type) });
  };

  const getDefaults = (type: string) => {
    switch (type) {
      case 'bearer': return { token: '' };
      case 'basic': return { username: '', password: '' };
      case 'apikey': return { key: '', value: '', addTo: 'header' };
      default: return {};
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTypeChange(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all",
              currentType === t.id 
                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {t.icon}
            {t.name}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-[2rem] p-8 space-y-6 shadow-sm min-h-[200px] flex flex-col justify-center">
        {currentType === 'none' && (
          <div className="text-center space-y-2 opacity-50">
            <Shield size={48} className="mx-auto text-muted-foreground" />
            <p className="text-sm font-bold">No Authentication</p>
            <p className="text-[10px] uppercase tracking-widest">This request does not use any auth.</p>
          </div>
        )}

        {currentType === 'bearer' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Bearer Token</label>
              <textarea
                value={auth.token}
                onChange={(e) => updateAuth({ token: e.target.value })}
                placeholder="Paste your token here..."
                className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-xs font-mono focus:ring-1 focus:ring-primary outline-none resize-none"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <AlertCircle size={14} className="text-primary" />
              <p className="text-[10px] font-medium text-primary">The token will be sent in the "Authorization: Bearer {'<token>'}" header.</p>
            </div>
          </div>
        )}

        {currentType === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Username</label>
              <input
                value={auth.username}
                onChange={(e) => updateAuth({ username: e.target.value })}
                className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={auth.password}
                onChange={(e) => updateAuth({ password: e.target.value })}
                className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {currentType === 'apikey' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Key</label>
                <input
                  value={auth.key}
                  onChange={(e) => updateAuth({ key: e.target.value })}
                  placeholder="X-API-Key"
                  className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Value</label>
                <input
                  value={auth.value}
                  onChange={(e) => updateAuth({ value: e.target.value })}
                  className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Add to</label>
              <select
                value={auth.addTo}
                onChange={(e) => updateAuth({ addTo: e.target.value })}
                className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-xs outline-none"
              >
                <option value="header">Header</option>
                <option value="query">Query Params</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
