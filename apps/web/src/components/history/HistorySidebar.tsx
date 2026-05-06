import { useHistoryStore } from '@/store/historyStore';
import { Trash2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { METHOD_COLORS } from '@/components/request/MethodSelector';
import { useRequestStore } from '@/store/requestStore';
import { useConfirm } from '@/hooks/useConfirm';
import { showToast } from '@/utils/toast';
import dayjs from 'dayjs';

export default function HistorySidebar() {
  const { removeEntry, clearAll, getFilteredEntries } = useHistoryStore();
  const { loadRequest } = useRequestStore();
  const confirm = useConfirm();

  const handleClearAll = () => {
    confirm({
      title: 'Clear History',
      message: 'Are you sure you want to clear all request history? This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Clear All',
      onConfirm: () => {
        clearAll();
        showToast.success('History cleared');
      },
    });
  };

  const filteredEntries = getFilteredEntries();

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex items-center justify-between border-b">
        <span className="text-xs font-bold text-muted-foreground uppercase">Recent Activity</span>
        <button
          onClick={handleClearAll}
          className="text-[10px] text-muted-foreground hover:text-destructive font-bold uppercase"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No history yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-muted/30">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => loadRequest(entry.request as any)}
                className="group p-3 hover:bg-muted/50 cursor-pointer transition-colors relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-black", METHOD_COLORS[entry.method])}>
                      {entry.method}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 rounded",
                      entry.status >= 200 && entry.status < 300 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {entry.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {dayjs(entry.timestamp).format('HH:mm:ss')}
                  </span>
                </div>
                <div className="text-xs truncate text-muted-foreground group-hover:text-foreground">
                  {entry.url || '(No URL)'}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{entry.latency}ms</span>
                  <span>{entry.size}B</span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
