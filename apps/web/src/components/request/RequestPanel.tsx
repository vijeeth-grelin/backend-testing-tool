import { Send } from 'lucide-react';
import MethodSelector from '@/components/request/MethodSelector';
import UrlBar from '@/components/request/UrlBar';
import RequestTabs from '@/components/request/RequestTabs';
import { useRequestStore } from '@/store/requestStore';
import { useRequest } from '@/hooks/useRequest';
import { useResponseStore } from '@/store/responseStore';

export default function RequestPanel() {
  const { url, setUrl, method, setMethod } = useRequestStore();
  const { sendRequest } = useRequest();
  const isLoading = useResponseStore((state) => state.isLoading);

  console.log('[RequestPanel] Render, isLoading:', isLoading);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <MethodSelector value={method} onChange={setMethod} />
        <UrlBar value={url} onChange={setUrl} />
        <button
          onClick={sendRequest}
          disabled={isLoading || !url.trim()}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-6 py-2 rounded-md font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
          <Send size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
      <RequestTabs />
    </div>
  );
}
