export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'form-data' | 'urlencoded' | 'raw' | 'binary';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  type?: 'text' | 'file';
  file?: File | null;
  description?: string;
}

export interface RequestBody {
  type: BodyType;
  rawType?: 'text' | 'json' | 'xml' | 'html' | 'javascript';
  raw?: string;
  formData?: KeyValuePair[];
  binary?: File | null;
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic';
  token?: string;
  username?: string;
  password?: string;
}

export interface ApiRequest {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: AuthConfig;
  preScript: string;
  testsScript: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  size: number;
  latency: number;
  cookies: any[];
  testResults: TestResult[];
  consoleOutput: ConsoleLog[];
  timestamp: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface ConsoleLog {
  level: 'log' | 'warn' | 'error';
  args: unknown[];
  timestamp: number;
}
