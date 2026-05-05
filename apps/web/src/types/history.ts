import type { HttpMethod, ApiRequest, ApiResponse } from './request';

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  latency: number;
  size: number;
  timestamp: number;
  request: ApiRequest;
  response: ApiResponse;
}
