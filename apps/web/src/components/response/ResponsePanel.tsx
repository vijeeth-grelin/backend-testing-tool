import { useResponseStore } from '../../store/responseStore';
import { Clock, Database, Globe, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ResponsePanel() {
  const { response, isLoading, error, activeTab, setActiveTab, clearResponse } = useResponseStore();

  const statusColor = (s: number) =>
    s < 300 ? 'text-green-500 bg-green-500/10 border-green-500/20' :
    s < 400 ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
    s < 500 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
    'text-red-500 bg-red-500/10 border-red-500/20';

  return (
    <div className="flex flex-col h-full bg-card/30 relative overflow-hidden">
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden z-50">
          <div className="h-full bg-primary animate-progress-loading w-1/2" />
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn("flex-1 flex flex-col min-h-0 transition-opacity duration-300", isLoading && response ? "opacity-50 pointer-events-none" : "opacity-100")}>
        
        {/* Loading State (Full Screen if no response yet) */}
        {isLoading && !response && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Loader2 size={48} className="animate-spin opacity-20 text-primary" />
            <div className="text-center">
              <p className="font-bold text-foreground">Sending Request...</p>
              <p className="text-sm">Waiting for server response</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex-1 flex flex-col items-center justify-center text-destructive gap-4 p-8">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle size={48} className="text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-bold text-xl">Connection Failed</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{error}</p>
              <div className="pt-4 flex flex-col gap-2 items-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Troubleshooting</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ensure the proxy server is running at port 3001</li>
                  <li>• Check if the target URL is accessible</li>
                  <li>• Verify any firewall or CORS restrictions</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !response && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Globe size={64} className="opacity-10" />
            <div className="text-center max-w-xs">
              <p className="font-bold text-foreground/50">No Response Yet</p>
              <p className="text-xs">Enter a URL and click Send to see the API response here.</p>
            </div>
          </div>
        )}

        {/* Response Data */}
        {response && (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", statusColor(response.status))}>
                    {response.status} {response.statusText}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Time: <span className="text-primary ml-1">{response.latency} ms</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Database size={14} />
                  <span>Size: <span className="text-primary ml-1">{(response.size / 1024).toFixed(2)} KB</span></span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={clearResponse}
                  className="text-xs px-3 py-1 border rounded hover:bg-muted transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex border-b bg-muted/20 px-2 gap-1">
              {['Body', 'Headers', 'Cookies', 'Tests'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={cn(
                    "px-4 py-2 text-xs font-bold transition-all border-b-2",
                    activeTab === tab.toLowerCase()
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-sm custom-scrollbar">
              {activeTab === 'body' && (
                <pre className="bg-muted/10 p-4 rounded-md border overflow-x-auto">
                  <code className="text-foreground/90 leading-relaxed whitespace-pre">
                    {response.body}
                  </code>
                </pre>
              )}
              {activeTab === 'headers' && (
                <div className="border rounded-md divide-y bg-muted/5">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[200px_1fr] p-3 hover:bg-muted/20">
                      <span className="font-bold text-primary/80 truncate pr-4">{key}</span>
                      <span className="text-muted-foreground break-all">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab !== 'body' && activeTab !== 'headers' && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-12">
                  <Globe size={48} className="opacity-10" />
                  <p className="text-sm italic">Tab "{activeTab}" is not yet implemented</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
