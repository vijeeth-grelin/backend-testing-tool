import axios from 'axios';
import { useRequestStore } from '../store/requestStore';
import { useResponseStore } from '../store/responseStore';
import { useHistoryStore } from '../store/historyStore';
import { showToast } from '../utils/toast';

export function useRequest() {
  const { setResponse, setLoading, setError } = useResponseStore();
  const { addEntry } = useHistoryStore();

  const sendRequest = async () => {
    // Get the absolute latest state from the store to avoid stale closures
    const state = useRequestStore.getState();
    
    if (!state.url) {
      showToast.error('URL is required');
      return;
    }

    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      
      state.headers.forEach((h) => {
        if (h.enabled && h.key) headers[h.key] = h.value;
      });

      // Target URL for proxy
      headers['x-target-url'] = state.url;

      // Build params
      const params: Record<string, string> = {};
      state.params.forEach((p) => {
        if (p.enabled && p.key) params[p.key] = p.value;
      });

      // Build body
      let data: any = null;
      if (state.method !== 'GET' && state.method !== 'HEAD') {
        if (state.body.type === 'json' && state.body.raw) {
          try {
            data = JSON.parse(state.body.raw);
          } catch (e) {
            data = state.body.raw;
          }
        } else if (state.body.type === 'raw') {
          data = state.body.raw;
        }
      }

      const response = await axios({
        method: state.method,
        url: 'http://127.0.0.1:3001/proxy',
        headers,
        params,
        data,
        timeout: 30000,
        validateStatus: () => true,
      });

      const latency = Date.now() - startTime;
      const responseData = response.data;
      const size = typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length;

      const apiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        body: typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : String(responseData),
        size,
        latency,
        cookies: [],
        testResults: [],
        consoleOutput: [],
        timestamp: Date.now(),
      };

      setResponse(apiResponse);

      // Add to history
      addEntry({
        id: crypto.randomUUID(),
        method: state.method,
        url: state.url,
        status: response.status,
        latency,
        size,
        timestamp: Date.now(),
        request: { ...state },
        response: apiResponse,
      });

      if (response.status >= 400) {
        showToast.warning(`Request finished with status ${response.status}`);
      } else {
        showToast.success(`Request completed with status ${response.status}`);
      }
    } catch (err: any) {
      let errorMsg = 'Request failed';
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out (30s)';
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network Error: Check if the proxy server is running at http://localhost:3001';
      } else {
        errorMsg = err.response?.data?.message || err.message || 'Request failed';
      }

      setError(errorMsg);
      showToast.error('Request failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest };
}
