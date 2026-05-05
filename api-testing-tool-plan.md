# API Testing Tool — Implementation Plan
> Postman + Swagger Hybrid · React 18 + Vite · localStorage + Zustand Persist

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Storage Strategy](#4-storage-strategy)
5. [TypeScript Types](#5-typescript-types)
6. [Zustand Store Slices](#6-zustand-store-slices)
7. [Module Implementation Plan](#7-module-implementation-plan)
8. [Proxy Server](#8-proxy-server)
9. [Variable Interpolation Engine](#9-variable-interpolation-engine)
10. [Scripting Engine](#10-scripting-engine)
11. [OpenAPI / Docs Explorer](#11-openapi--docs-explorer)
12. [Routing Plan](#12-routing-plan)
13. [Phase-by-Phase Roadmap](#13-phase-by-phase-roadmap)
14. [Key Conventions](#14-key-conventions)

---

## 1. Project Overview

A fully browser-based API testing and documentation tool combining:

- **Postman-style** — request building, collections, environments, auth, scripting, history
- **Swagger-style** — OpenAPI 3.x / Swagger 2.0 doc explorer with one-click "Try It"

### Feature Matrix

| Feature               | Details                                                  |
|-----------------------|----------------------------------------------------------|
| Request Builder       | Methods, URL, Params, Headers, Body, Auth, Scripts       |
| Response Viewer       | Status, Latency, Size, Body (pretty/raw), Headers, Tests |
| Collections           | Folder → Request tree, drag-and-drop, import/export      |
| Environments          | Dev/Staging/Prod variable sets, `{{var}}` interpolation  |
| Auth Manager          | Bearer, API Key, Basic, OAuth 2.0 (PKCE)                 |
| Pre/Post Scripts      | JS sandbox, Chai assertions, console output              |
| Docs Explorer         | OpenAPI parser, schema viewer, one-click "Try It"        |
| History               | Auto-logged, re-run, search, filter                      |
| Collection Runner     | Run all requests sequentially with pass/fail report      |
| Code Export           | cURL, JavaScript (fetch/axios), Python, Go snippets      |

---

## 2. Tech Stack

### Frontend

| Layer            | Library                        | Why                                          |
|------------------|--------------------------------|----------------------------------------------|
| Framework        | React 18 + Vite                | Fast HMR, concurrent features                |
| Language         | TypeScript 5.x                 | Type safety across all modules               |
| State            | Zustand + persist middleware   | No boilerplate, built-in localStorage sync   |
| Routing          | React Router v6                | Nested layouts, file-based pages             |
| Styling          | Tailwind CSS v3                | Utility-first, dark mode, JIT                |
| UI Components    | shadcn/ui (Radix primitives)   | Accessible, unstyled, composable             |
| Code Editor      | @monaco-editor/react           | VS Code engine — JSON, JS, YAML              |
| HTTP Client      | Axios                          | Interceptors, cancel tokens                  |
| Tree + DnD       | dnd-kit                        | Accessible drag-and-drop for collection tree |
| OpenAPI Parser   | @readme/openapi-parser         | Validates + dereferences OpenAPI specs       |
| Icons            | lucide-react                   | Tree-shakeable, consistent                   |
| Notifications    | sonner                         | Toast notifications                          |
| Dates            | dayjs                          | Lightweight, history timestamps              |
| Panel Resize     | react-resizable-panels         | Draggable split between request / response   |

### Backend (Proxy Only)

| Layer    | Library                  | Why                                      |
|----------|--------------------------|------------------------------------------|
| Runtime  | Node.js 20 LTS           | Stable LTS, native fetch                 |
| Server   | Express 4                | Minimal, well-known                      |
| Proxy    | http-proxy-middleware    | Forward all requests, bypass CORS        |
| WS       | ws                       | WebSocket proxy support                  |

### Storage (No Database Needed)

| Data                    | Storage           | Notes                              |
|-------------------------|-------------------|------------------------------------|
| Collections & requests  | localStorage      | Zustand persist, JSON              |
| Environments & vars     | localStorage      | Zustand persist                    |
| History (last 200)      | localStorage      | Capped array, auto-trimmed         |
| Auth tokens (sensitive) | sessionStorage    | Cleared on tab close               |
| Active request state    | Zustand (memory)  | Not persisted — intentional        |
| App settings / theme    | localStorage      | Direct get/set                     |

---

## 3. Project Structure

```
api-tester/
├── apps/
│   ├── web/                              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── AppShell.tsx          # Root layout grid
│   │   │   │   │   ├── Sidebar.tsx           # Left nav panel
│   │   │   │   │   ├── TopBar.tsx            # Logo, EnvSelector, Theme
│   │   │   │   │   └── PanelSplit.tsx        # Resizable request/response
│   │   │   │   │
│   │   │   │   ├── request/
│   │   │   │   │   ├── RequestPanel.tsx      # Orchestrator
│   │   │   │   │   ├── MethodSelector.tsx    # GET/POST/PUT/... dropdown
│   │   │   │   │   ├── UrlBar.tsx            # URL input + Send button
│   │   │   │   │   ├── RequestTabs.tsx       # Params/Headers/Body/Auth/Scripts
│   │   │   │   │   ├── ParamsTable.tsx       # Key-value table for query params
│   │   │   │   │   ├── HeadersTable.tsx      # Key-value table for headers
│   │   │   │   │   ├── BodyEditor.tsx        # Body type selector + editor
│   │   │   │   │   ├── AuthPanel.tsx         # Auth type form switcher
│   │   │   │   │   ├── PreScriptEditor.tsx   # Monaco JS editor (pre-request)
│   │   │   │   │   └── TestsEditor.tsx       # Monaco JS editor (post-request)
│   │   │   │   │
│   │   │   │   ├── response/
│   │   │   │   │   ├── ResponsePanel.tsx     # Orchestrator
│   │   │   │   │   ├── StatusBadge.tsx       # 200 OK · 142ms · 2.4KB
│   │   │   │   │   ├── ResponseTabs.tsx      # Body/Headers/Cookies/Tests/Console
│   │   │   │   │   ├── PrettyJson.tsx        # Syntax-highlighted collapsible JSON
│   │   │   │   │   ├── RawBody.tsx           # Raw text response
│   │   │   │   │   ├── PreviewFrame.tsx      # HTML preview in sandboxed iframe
│   │   │   │   │   ├── ResponseHeaders.tsx   # Response headers table
│   │   │   │   │   ├── TestResults.tsx       # Pass/fail assertion list
│   │   │   │   │   └── ConsolePanel.tsx      # Script console.log output
│   │   │   │   │
│   │   │   │   ├── collections/
│   │   │   │   │   ├── CollectionSidebar.tsx # Full sidebar tab content
│   │   │   │   │   ├── CollectionTree.tsx    # Recursive tree renderer
│   │   │   │   │   ├── FolderNode.tsx        # Folder with expand/collapse
│   │   │   │   │   ├── RequestNode.tsx       # Request leaf (method badge + name)
│   │   │   │   │   ├── CollectionMenu.tsx    # Right-click context menu
│   │   │   │   │   └── ImportExportModal.tsx # Import/export Postman / OpenAPI
│   │   │   │   │
│   │   │   │   ├── environment/
│   │   │   │   │   ├── EnvSelector.tsx       # TopBar dropdown
│   │   │   │   │   ├── EnvModal.tsx          # Create/edit environment modal
│   │   │   │   │   └── VarTable.tsx          # Variable CRUD table
│   │   │   │   │
│   │   │   │   ├── auth/
│   │   │   │   │   ├── AuthForm.tsx          # Auth type switcher
│   │   │   │   │   ├── BearerForm.tsx
│   │   │   │   │   ├── ApiKeyForm.tsx
│   │   │   │   │   ├── BasicForm.tsx
│   │   │   │   │   └── OAuth2Form.tsx        # OAuth2 + PKCE flow
│   │   │   │   │
│   │   │   │   ├── docs/
│   │   │   │   │   ├── DocsExplorer.tsx      # Main docs page
│   │   │   │   │   ├── EndpointList.tsx      # Grouped endpoint sidebar
│   │   │   │   │   ├── EndpointDetail.tsx    # Expanded endpoint view
│   │   │   │   │   ├── SchemaViewer.tsx      # JSON Schema renderer
│   │   │   │   │   └── TryItPanel.tsx        # Fills RequestBuilder from spec
│   │   │   │   │
│   │   │   │   ├── history/
│   │   │   │   │   ├── HistorySidebar.tsx    # History list in sidebar tab
│   │   │   │   │   └── HistoryItem.tsx       # Single history entry row
│   │   │   │   │
│   │   │   │   ├── runner/
│   │   │   │   │   ├── RunnerModal.tsx       # Collection runner dialog
│   │   │   │   │   ├── RunProgress.tsx       # Live run progress
│   │   │   │   │   └── RunReport.tsx         # Summary report after run
│   │   │   │   │
│   │   │   │   └── ui/                       # shadcn/ui re-exports + custom
│   │   │   │       ├── KeyValueTable.tsx     # Reusable param/header table
│   │   │   │       ├── MethodBadge.tsx       # Colored HTTP method pill
│   │   │   │       ├── CopyButton.tsx
│   │   │   │       └── EmptyState.tsx
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── index.ts                  # Export all stores
│   │   │   │   ├── requestStore.ts           # Active request state
│   │   │   │   ├── responseStore.ts          # Last response state
│   │   │   │   ├── collectionStore.ts        # Collections tree (persisted)
│   │   │   │   ├── environmentStore.ts       # Environments + active env (persisted)
│   │   │   │   ├── historyStore.ts           # Request history (persisted)
│   │   │   │   ├── authStore.ts              # Auth configs (sessionStorage)
│   │   │   │   ├── docsStore.ts              # Parsed OpenAPI spec (memory)
│   │   │   │   └── uiStore.ts                # Sidebar, theme, panel sizes
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useRequest.ts             # Send request, handle response
│   │   │   │   ├── useInterpolation.ts       # Resolve {{vars}} in strings
│   │   │   │   ├── useScriptRunner.ts        # Run pre/post scripts via worker
│   │   │   │   ├── useCollectionRunner.ts    # Sequential collection execution
│   │   │   │   └── useKeyboardShortcuts.ts   # Ctrl+Enter, Ctrl+S, etc.
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── interpolate.ts            # {{var}} resolution logic
│   │   │   │   ├── openApiParser.ts          # OpenAPI → internal model
│   │   │   │   ├── postmanImport.ts          # Postman v2.1 JSON → collections
│   │   │   │   ├── postmanExport.ts          # Collections → Postman v2.1 JSON
│   │   │   │   ├── curlExport.ts             # Request → cURL string
│   │   │   │   ├── codeGen.ts                # Request → JS/Python/Go snippet
│   │   │   │   ├── storage.ts                # localStorage helpers
│   │   │   │   └── cn.ts                     # Tailwind class merger (clsx)
│   │   │   │
│   │   │   ├── workers/
│   │   │   │   └── scriptRunner.worker.ts    # Isolated JS execution via Worker
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── request.ts
│   │   │   │   ├── collection.ts
│   │   │   │   ├── environment.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── history.ts
│   │   │   │   └── openapi.ts
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── RequestPage.tsx           # Main workspace
│   │   │   │   ├── DocsPage.tsx              # OpenAPI explorer
│   │   │   │   ├── HistoryPage.tsx           # Full history view
│   │   │   │   ├── RunnerPage.tsx            # Collection runner
│   │   │   │   └── SettingsPage.tsx          # App settings
│   │   │   │
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── router.tsx
│   │   │
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── proxy/                                # Node.js CORS proxy
│       ├── src/
│       │   ├── index.ts                      # Express entry point
│       │   ├── proxyRouter.ts                # /proxy/* forwarding
│       │   └── wsProxy.ts                    # WebSocket support
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 4. Storage Strategy

### Zustand Persist (localStorage)

No database setup. One middleware call per store handles serialization, hydration, and versioning automatically.

```typescript
// Example: collectionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCollectionStore = create(
  persist(
    (set, get) => ({
      collections: [],
      // ... actions
    }),
    {
      name: 'api-tester:collections',   // localStorage key
      version: 1,                        // bump to migrate
      migrate: (persisted, version) => { // handle schema changes
        if (version === 0) { /* transform old shape */ }
        return persisted;
      },
    }
  )
);
```

### Storage Keys Layout

```
localStorage:
  api-tester:collections     → Collection[] (tree with nested requests)
  api-tester:environments    → Environment[] + activeEnvId
  api-tester:history         → HistoryEntry[] (max 200, trimmed on add)
  api-tester:ui              → theme, sidebarTab, panelHeight
  api-tester:settings        → proxyUrl, timeout, sslVerify

sessionStorage:
  api-tester:auth-tokens     → Record<configId, TokenData> (sensitive)
```

### Storage Utility

```typescript
// utils/storage.ts
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => localStorage.removeItem(key),
};
```

---

## 5. TypeScript Types

```typescript
// types/request.ts

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'form-data' | 'urlencoded' | 'raw' | 'binary';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface RequestBody {
  type: BodyType;
  rawType?: 'text' | 'json' | 'xml' | 'html' | 'javascript';
  raw?: string;
  formData?: KeyValuePair[];
  binary?: File | null;
}

export interface ApiRequest {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: AuthConfig | null;
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
  cookies: Cookie[];
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
```

```typescript
// types/collection.ts

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
  auth?: AuthConfig;
  variables?: KeyValuePair[];
  createdAt: number;
  updatedAt: number;
}

export type CollectionItem = FolderNode | RequestNode;

export interface FolderNode {
  type: 'folder';
  id: string;
  name: string;
  items: CollectionItem[];
}

export interface RequestNode {
  type: 'request';
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: AuthConfig | null;
  preScript: string;
  testsScript: string;
  description?: string;
}
```

```typescript
// types/environment.ts

export interface Environment {
  id: string;
  name: string;
  color?: string;
  variables: EnvVariable[];
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  secret: boolean;
}
```

```typescript
// types/auth.ts

export type AuthType = 'none' | 'bearer' | 'apiKey' | 'basic' | 'oauth2';

export type AuthConfig =
  | { type: 'none' }
  | { type: 'bearer'; token: string }
  | { type: 'apiKey'; key: string; value: string; in: 'header' | 'query' }
  | { type: 'basic'; username: string; password: string }
  | {
      type: 'oauth2';
      flow: 'authCode' | 'clientCredentials';
      tokenUrl: string;
      authUrl?: string;
      clientId: string;
      clientSecret?: string;
      scope?: string;
      pkce: boolean;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
    };
```

```typescript
// types/history.ts

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
```

---

## 6. Zustand Store Slices

### requestStore.ts — Active Request (memory only)

```typescript
interface RequestStore {
  // State
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: AuthConfig | null;
  preScript: string;
  testsScript: string;
  activeTab: 'params' | 'headers' | 'body' | 'auth' | 'pre-script' | 'tests';

  // Actions
  setMethod: (m: HttpMethod) => void;
  setUrl: (url: string) => void;
  setParams: (params: KeyValuePair[]) => void;
  setHeaders: (headers: KeyValuePair[]) => void;
  setBody: (body: RequestBody) => void;
  setAuth: (auth: AuthConfig | null) => void;
  setPreScript: (s: string) => void;
  setTestsScript: (s: string) => void;
  setActiveTab: (tab: string) => void;
  loadRequest: (r: RequestNode) => void;    // populate from saved
  resetRequest: () => void;
}
```

### responseStore.ts — Last Response (memory only)

```typescript
interface ResponseStore {
  response: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  activeTab: 'body' | 'headers' | 'cookies' | 'tests' | 'console';

  setResponse: (r: ApiResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setActiveTab: (tab: string) => void;
  clear: () => void;
}
```

### collectionStore.ts — Persisted to localStorage

```typescript
interface CollectionStore {
  collections: Collection[];
  activeRequestId: string | null;

  // CRUD
  addCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addFolder: (collectionId: string, name: string, parentFolderId?: string) => void;
  saveRequest: (collectionId: string, req: RequestNode, folderId?: string) => void;
  updateRequest: (collectionId: string, req: RequestNode) => void;
  deleteRequest: (collectionId: string, requestId: string) => void;
  moveItem: (from: string, to: string) => void;       // dnd-kit reorder
  setActiveRequest: (id: string | null) => void;

  // Import / Export
  importPostman: (json: unknown) => void;
  exportPostman: (collectionId: string) => object;
  importOpenApi: (spec: unknown) => void;
}
```

### environmentStore.ts — Persisted to localStorage

```typescript
interface EnvironmentStore {
  environments: Environment[];
  activeEnvId: string | null;
  globalVars: EnvVariable[];

  // Computed (use inside components)
  getActiveEnv: () => Environment | null;
  getResolvedVars: () => Record<string, string>; // global + active merged

  // Actions
  addEnvironment: (name: string) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnv: (id: string | null) => void;
  updateVars: (envId: string, vars: EnvVariable[]) => void;
  setGlobalVar: (key: string, value: string) => void;
}
```

### historyStore.ts — Persisted to localStorage (capped at 200)

```typescript
interface HistoryStore {
  entries: HistoryEntry[];
  search: string;

  addEntry: (entry: HistoryEntry) => void;   // auto-trims to 200
  removeEntry: (id: string) => void;
  clearAll: () => void;
  setSearch: (s: string) => void;

  // Computed
  filteredEntries: () => HistoryEntry[];
}
```

### uiStore.ts — Persisted to localStorage

```typescript
interface UIStore {
  sidebarOpen: boolean;
  sidebarWidth: number;
  sidebarTab: 'collections' | 'history' | 'environments';
  responsePanelSize: number;           // percentage 0–100
  theme: 'light' | 'dark' | 'system';

  toggleSidebar: () => void;
  setSidebarTab: (tab: string) => void;
  setResponsePanelSize: (n: number) => void;
  setTheme: (t: string) => void;
}
```

---

## 7. Module Implementation Plan

### 7.1 Layout — AppShell

```
┌────────────────────────────────────────────────────────┐
│  TopBar: [Logo] [EnvSelector ▼] [Theme] [Settings]     │
├───────────┬────────────────────────────────────────────┤
│ Sidebar   │  PanelSplit (react-resizable-panels)        │
│ ─────── │  ┌──────────────────────────────────────┐   │
│ [Colls]  │  │  Request Builder                     │   │
│ [Envs]   │  │  MethodSelector  UrlBar  [Send]       │   │
│ [History]│  │  Tabs: Params Headers Body Auth Script│   │
│           │  ├──────── drag handle ─────────────────┤   │
│           │  │  Response Viewer                     │   │
│           │  │  StatusBadge                         │   │
│           │  │  Tabs: Body Headers Tests Console    │   │
│           │  └──────────────────────────────────────┘   │
└───────────┴────────────────────────────────────────────┘
```

**Implementation:**
- `AppShell.tsx` — CSS Grid: `grid-template-columns: auto 1fr; grid-template-rows: 48px 1fr`
- `PanelSplit` uses `react-resizable-panels` with `PanelGroup direction="vertical"`
- Sidebar tabs use `uiStore.sidebarTab` to switch content without unmounting
- Keyboard shortcut `Ctrl+\` toggles sidebar

---

### 7.2 Request Builder

#### MethodSelector.tsx
- Dropdown (shadcn Select) of all HTTP methods
- Each method has a fixed color class for its badge:

```typescript
export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  POST:    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PUT:     'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  PATCH:   'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DELETE:  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  HEAD:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  OPTIONS: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};
```

#### UrlBar.tsx
- Full-width text input with inline `{{variable}}` highlighting
- Parse `{{word}}` tokens → render as colored `<span>` overlays
- Variables not found in active env → red underline warning
- `Ctrl+Enter` → trigger send
- Dropdown for recent URLs from history (last 10, filtered as you type)
- Lock icon when URL contains env base URL variable

#### KeyValueTable (shared: Params + Headers)
- Rows: `[☑] [key input] [value input] [desc] [🗑]`
- `+ Add Row` button at bottom
- Bulk edit mode: toggle to single textarea (`KEY: VALUE` per line)
- Paste auto-detection: detect `key=value&key2=value2` → parse into rows
- Disable row without deleting (checkbox)
- Auto-suggest header names from a static list (Accept, Content-Type, Authorization, …)

#### BodyEditor.tsx
- Body type radio: `none | raw | form-data | urlencoded | binary`
- Raw sub-type select: `Text | JSON | XML | HTML | JavaScript`
- JSON/XML → Monaco Editor (syntax highlight, auto-format on Ctrl+Shift+F)
- form-data → KeyValueTable + per-row file input toggle
- binary → `<input type="file">` + shows MIME type + size
- "Beautify" button for JSON (uses `JSON.stringify(JSON.parse(raw), null, 2)`)

#### AuthPanel.tsx
- Auth type select: `None | Bearer Token | API Key | Basic | OAuth 2.0`
- Each type renders its own inline form
- `Inherit from collection` option (uses parent collection's auth)
- OAuth 2.0 shows token status (valid/expired) and "Get New Token" button

#### PreScriptEditor.tsx / TestsEditor.tsx
- Monaco Editor in JavaScript mode, height: 160px, resizable
- IntelliSense stubs for `pm` object:
  ```javascript
  pm.environment.set("key", "value")
  pm.environment.get("key")
  pm.response.json()
  pm.response.status
  pm.expect(pm.response.status).to.equal(200)
  ```
- Run script manually with a "▶ Run" button
- Output goes to ConsolePanel

---

### 7.3 Response Viewer

#### StatusBadge.tsx
```typescript
// Color by status range
const statusColor = (s: number) =>
  s < 200 ? 'gray' :
  s < 300 ? 'green' :
  s < 400 ? 'blue' :
  s < 500 ? 'amber' : 'red';

// Renders: [200 OK]  ·  142 ms  ·  2.4 KB
```

#### PrettyJson.tsx
- Collapsible JSON tree (custom recursive renderer — no heavy lib)
- Syntax colors: string=green, number=blue, boolean=amber, null=gray, key=purple
- Search within response (Ctrl+F) — highlights matching keys/values
- Copy entire body button
- Download as `.json` button
- For large responses (>500KB): warn and offer "Load anyway"

#### ResponseTabs tabs plan

| Tab | Content |
|---|---|
| Body | PrettyJson / RawBody / PreviewFrame (switches based on content-type) |
| Headers | Simple table: key + value, copy-on-click |
| Cookies | Name, Value, Domain, Path, Expires, HttpOnly, Secure |
| Tests | TestResult list — green checkmarks / red X marks + summary |
| Console | ConsoleLog list from pre/post script execution |

---

### 7.4 Collections Tree

#### Data shape in localStorage
```typescript
// Stored as Collection[] under 'api-tester:collections'
// Items are recursive — folders contain folders or requests
[
  {
    id: "col_1",
    name: "My API",
    items: [
      { type: "folder", id: "f_1", name: "Auth", items: [
        { type: "request", id: "r_1", name: "Login", method: "POST", url: "..." }
      ]},
      { type: "request", id: "r_2", name: "Get Users", method: "GET", url: "..." }
    ]
  }
]
```

#### CollectionTree.tsx behavior
- Render using a recursive `TreeNode` component
- dnd-kit `useSortable` on each node, `useDroppable` on folders
- Right-click context menu (shadcn DropdownMenu):
  - On Collection: New Folder, New Request, Rename, Duplicate, Export, Delete
  - On Folder: New Request, Rename, Delete
  - On Request: Open, Duplicate, Move to…, Delete
- Click on a request → loads into `requestStore` → opens in main panel
- Keyboard: `↑ ↓` navigate, `Enter` open, `F2` rename, `Del` delete
- Search bar at top of sidebar filters tree in real time

#### ImportExportModal.tsx
- Import tab:
  - Drag-and-drop JSON/YAML file
  - URL input (fetch the spec)
  - Format auto-detect: Postman v2.1, OpenAPI 3.x, Swagger 2.0
- Export tab:
  - Format selector: Postman v2.1 or OpenAPI YAML
  - Download or copy to clipboard

---

### 7.5 Environment Manager

#### EnvSelector.tsx (in TopBar)
```
Dropdown shows:
  ● No Environment
  ● Dev         (green dot)
  ● Staging     (amber dot)
  ● Production  (red dot)
  ─────────────
  + New Environment
  Manage Environments…
```

#### EnvModal.tsx
- Modal with env name + color picker at top
- `VarTable` for editing variables:
  - Columns: `[☑] [Key] [Value] [Secret ☑] [🗑]`
  - Secret values shown as `••••••` with reveal toggle
  - Bulk import: paste `.env` format (`KEY=VALUE`)
  - Export: download as `.env` file

#### Variable Resolution Priority
```
1. Global Variables  (lowest priority)
2. Active Environment Variables
3. Dynamic variables set by pre-request script  (highest priority)
```

---

### 7.6 Auth Manager

#### Auth type forms:

**Bearer Token**
```
Token: [_________________________]  [Generate UUID]
Prefix: Bearer (editable)
→ Adds header: Authorization: Bearer <token>
```

**API Key**
```
Key:   [_________________________]
Value: [_________________________]
Add to: (• Header  ○ Query Param)
→ Adds header or ?key=value
```

**Basic Auth**
```
Username: [_________________________]
Password: [_________________________]  [👁]
→ Adds header: Authorization: Basic base64(user:pass)
```

**OAuth 2.0**
```
Grant Type:  [Authorization Code ▼]
Auth URL:    [_________________________]
Token URL:   [_________________________]
Client ID:   [_________________________]
Client Secret: [_________________________]  [👁]
Scope:       [_________________________]
PKCE:        [☑] Enable

[Get New Access Token]

Current token: ••••••••••  (expires in 3h 22m)
[Use Token]  [Refresh]  [Clear]
```

#### OAuth2 PKCE Flow (no server needed)
```
1. Generate code_verifier (random 64-byte, base64url)
2. code_challenge = SHA-256(code_verifier) → base64url
3. Open popup: authUrl?response_type=code&code_challenge=...
4. Popup redirects to localhost callback → sends postMessage to parent
5. Parent receives { code } → POST tokenUrl with code + code_verifier
6. Store access_token in sessionStorage (sensitive)
7. Auto-inject as Authorization: Bearer header
```

---

### 7.7 Scripting Engine

Scripts run in an isolated Web Worker — the main thread is never blocked and infinite loops are kill-able.

#### scriptRunner.worker.ts
```typescript
// Exposes a safe pm object to user scripts
// No access to DOM, fetch, or localStorage from inside worker

self.onmessage = ({ data }) => {
  const { script, request, response, envVars } = data;

  const pm = buildPmObject(request, response, envVars);
  const logs: ConsoleLog[] = [];
  const console = buildConsole(logs);

  try {
    const fn = new Function('pm', 'console', script);
    fn(pm, console);
    self.postMessage({ success: true, envUpdates: pm._envUpdates, logs, testResults: pm._results });
  } catch (err) {
    self.postMessage({ success: false, error: err.message, logs });
  }
};
```

#### pm object API (inside scripts)
```javascript
pm.environment.get("baseUrl")               // read env var
pm.environment.set("token", "abc123")       // write env var (queued)
pm.globals.get("key")
pm.globals.set("key", "value")

pm.request.url                              // current request URL
pm.request.headers.get("Content-Type")
pm.request.body                             // parsed body

pm.response.status                          // e.g. 200
pm.response.json()                          // parsed body
pm.response.text()
pm.response.headers.get("Content-Type")
pm.response.responseTime                    // ms

pm.expect(pm.response.status).to.equal(200)
pm.test("Status is 200", () => {
  pm.expect(pm.response.status).to.equal(200);
});
```

#### Worker lifecycle
```
useScriptRunner hook:
  - Creates worker once on mount
  - Sends { script, request, response, envVars } on each run
  - Sets 5-second timeout → terminates worker if exceeded
  - Returns { testResults, envUpdates, logs, error }
  - After pre-request: merge envUpdates into requestStore before sending
  - After post-request: merge envUpdates into environmentStore
```

---

### 7.8 OpenAPI / Docs Explorer

#### Parser Flow
```
User uploads / pastes / fetches YAML or JSON spec
  ↓
@readme/openapi-parser validates + dereferences $refs
  ↓
openApiParser.ts transforms into internal DocsSpec model
  ↓
docsStore.ts holds the parsed spec in memory
  ↓
DocsExplorer renders EndpointList + EndpointDetail
```

#### Internal DocsSpec model
```typescript
interface DocsSpec {
  title: string;
  version: string;
  baseUrl: string;
  servers: string[];
  tags: TagGroup[];
  endpoints: EndpointDef[];
  schemas: Record<string, JsonSchema>;
}

interface EndpointDef {
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tags: string[];
  parameters: ParameterDef[];
  requestBody?: RequestBodyDef;
  responses: Record<string, ResponseDef>;
  security?: SecurityRequirement[];
}
```

#### DocsExplorer.tsx layout
```
Left panel (280px):
  [Search endpoints…]
  ─────────────────
  ▼ Users
      GET  /users
      POST /users
      GET  /users/{id}
  ▼ Auth
      POST /auth/login
      POST /auth/refresh

Right panel:
  GET /users/{id}
  "Get a single user by ID"
  ─────────────────────────
  Parameters:
    id  (path, required, string)

  Responses:
    200  UserObject schema (collapsible)
    404  ErrorObject schema

  [▶ Try It]  ← fills Request Builder and switches to RequestPage
```

#### SchemaViewer.tsx
- Recursive JSON Schema renderer
- Shows type, format, required, description, enum values, example
- Collapsible nested objects/arrays
- Toggle between Schema view and Example JSON view

---

### 7.9 History

#### Auto-logging
Every successful request (and failed ones) gets logged via `historyStore.addEntry()` inside `useRequest.ts` after the response arrives.

#### HistorySidebar.tsx
```
[Search history…]           [Clear All]
─────────────────────────────────────
  GET  /users          200  142ms  2m ago
  POST /auth/login     401   88ms  5m ago
  DELETE /items/5      204   61ms  1h ago
```
- Click entry → load full request + response back into stores
- Color-coded status badges
- Grouped by date: Today / Yesterday / This Week / Older
- Search filters by URL, method, or status code
- Max 200 entries — oldest auto-removed on add

---

### 7.10 Collection Runner

Runs all requests in a collection (or selected folder) sequentially with delays between each.

#### RunnerModal.tsx
```
Collection: [My API ▼]
Folder:     [All requests ▼]
Iterations: [1      ]
Delay:      [0  ms  ]
Environment:[Dev ▼  ]

[▶ Run Collection]
```

#### RunProgress.tsx (live during run)
```
Running: 3 / 8 requests

✓  POST  /auth/login         200  88ms
✓  GET   /users              200  142ms
✗  GET   /users/invalid      404  66ms   — AssertionError: expected 200
▶  POST  /users/create       (running…)
```

#### RunReport.tsx (after run)
```
Collection Run Report — My API
Requests: 8  |  Passed: 6  |  Failed: 2  |  Total: 1.2s

[Export Report as JSON]  [Re-run Failed]
```

---

## 8. Proxy Server

The browser blocks cross-origin requests. All HTTP calls go through a local Express proxy.

### Architecture

```
Browser (React)
  → POST http://localhost:3001/proxy
     body: { method, url, headers, body }
  → Express proxyRouter.ts
  → http.request(targetUrl)
  → Returns { status, headers, body, latency }
  → Back to browser
```

### proxy/src/index.ts
```typescript
import express from 'express';
import cors from 'cors';
import { proxyRouter } from './proxyRouter';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use('/proxy', proxyRouter);

app.listen(3001, () => console.log('Proxy running on :3001'));
```

### proxy/src/proxyRouter.ts
```typescript
// POST /proxy
// Body: { method, url, headers, body, timeout }
// Returns: { status, statusText, headers, body, latency }

router.post('/', async (req, res) => {
  const { method, url, headers, body, timeout = 30000 } = req.body;
  const start = Date.now();

  const response = await fetch(url, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? undefined : body,
    signal: AbortSignal.timeout(timeout),
  });

  const responseBody = await response.text();
  const latency = Date.now() - start;

  res.json({
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseBody,
    latency,
  });
});
```

### Development Setup
```bash
# Terminal 1: Frontend
cd apps/web && pnpm dev          # Vite on :5173

# Terminal 2: Proxy
cd apps/proxy && pnpm dev        # Express on :3001
```

### vite.config.ts (alternative: dev proxy)
```typescript
// For development only — no separate proxy process needed
export default defineConfig({
  server: {
    proxy: {
      '/proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
```

---

## 9. Variable Interpolation Engine

### utils/interpolate.ts

```typescript
// Resolves {{varName}} in any string using resolved vars map
export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const trimmed = key.trim();
    return vars[trimmed] ?? `{{${trimmed}}}`; // leave unresolved vars as-is
  });
}

// Resolves entire request object (URL, headers, params, body)
export function interpolateRequest(
  request: ApiRequest,
  vars: Record<string, string>
): ApiRequest {
  return {
    ...request,
    url: interpolate(request.url, vars),
    params: request.params.map(p => ({
      ...p,
      value: interpolate(p.value, vars),
    })),
    headers: request.headers.map(h => ({
      ...h,
      value: interpolate(h.value, vars),
    })),
    body: {
      ...request.body,
      raw: request.body.raw ? interpolate(request.body.raw, vars) : undefined,
    },
  };
}

// Returns list of {{vars}} found in a string
export function extractVars(template: string): string[] {
  const matches = template.matchAll(/\{\{([^}]+)\}\}/g);
  return [...matches].map(m => m[1].trim());
}
```

### useInterpolation.ts hook

```typescript
export function useInterpolation() {
  const { getResolvedVars } = useEnvironmentStore();

  return {
    interpolate: (s: string) => interpolate(s, getResolvedVars()),
    interpolateRequest: (r: ApiRequest) => interpolateRequest(r, getResolvedVars()),
    extractVars,
    hasUnresolvedVars: (s: string) =>
      extractVars(s).some(v => !getResolvedVars()[v]),
  };
}
```

---

## 10. Code Export

### utils/curlExport.ts
```typescript
export function toCurl(request: ApiRequest): string {
  const parts = [`curl -X ${request.method}`];

  request.headers
    .filter(h => h.enabled)
    .forEach(h => parts.push(`  -H '${h.key}: ${h.value}'`));

  if (request.body.raw) {
    parts.push(`  -d '${request.body.raw.replace(/'/g, "\\'")}'`);
  }

  const url = buildUrl(request.url, request.params.filter(p => p.enabled));
  parts.push(`  '${url}'`);

  return parts.join(' \\\n');
}
```

### utils/codeGen.ts
Generates code snippets for:
- `fetch` (JavaScript)
- `axios` (JavaScript)
- `requests` (Python)
- `net/http` (Go)
- `HttpClient` (C#)

---

## 11. Routing Plan

```typescript
// router.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,           // persistent layout (sidebar + topbar)
    children: [
      { index: true,        element: <RequestPage /> },      // main workspace
      { path: 'docs',       element: <DocsPage /> },         // OpenAPI explorer
      { path: 'history',    element: <HistoryPage /> },      // full history table
      { path: 'runner',     element: <RunnerPage /> },       // collection runner
      { path: 'settings',   element: <SettingsPage /> },     // app config
    ],
  },
]);
```

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Send request |
| `Ctrl + S` | Save request to collection |
| `Ctrl + \` | Toggle sidebar |
| `Ctrl + K` | Open command palette (search history/collections) |
| `Ctrl + Shift + E` | Open environment manager |
| `Ctrl + N` | New request tab |
| `Esc` | Cancel in-flight request |

---

## 12. Phase-by-Phase Roadmap

### Phase 1 — Core Request/Response (Week 1–2)
Goal: Make real HTTP calls and see responses.

- [ ] Scaffold Vite + React + Tailwind + shadcn/ui
- [ ] Build AppShell layout (TopBar + Sidebar + PanelSplit)
- [ ] MethodSelector + UrlBar + Send button
- [ ] ParamsTable + HeadersTable (KeyValueTable component)
- [ ] BodyEditor (none + raw JSON initially)
- [ ] Set up Express proxy server
- [ ] useRequest hook (Axios → proxy → parse response)
- [ ] ResponsePanel (StatusBadge + PrettyJson + raw tabs)
- [ ] requestStore + responseStore (Zustand, memory only)

Milestone: You can send a GET/POST to any API and see the response.

---

### Phase 2 — Collections & Persistence (Week 3)
Goal: Save and organize requests.

- [ ] CollectionTree (recursive renderer)
- [ ] FolderNode + RequestNode with context menus
- [ ] collectionStore with Zustand persist (localStorage)
- [ ] Save/load request from collection
- [ ] dnd-kit drag-and-drop for reordering
- [ ] Import Postman v2.1 JSON
- [ ] Export Postman v2.1 JSON
- [ ] historyStore + HistorySidebar (auto-log every request)

Milestone: Save requests into folders, reload after refresh, view history.

---

### Phase 3 — Environments & Auth (Week 4)
Goal: Support multiple targets and authentication.

- [ ] environmentStore with Zustand persist
- [ ] EnvSelector dropdown (TopBar)
- [ ] EnvModal + VarTable (CRUD for env variables)
- [ ] interpolate.ts + useInterpolation hook
- [ ] UrlBar: {{var}} highlight + unresolved-var warning
- [ ] AuthPanel (Bearer, API Key, Basic, None)
- [ ] OAuth 2.0 PKCE flow (popup + postMessage)
- [ ] authStore in sessionStorage for sensitive tokens
- [ ] Global variables support

Milestone: Switch between Dev/Prod envs, authenticate with any scheme.

---

### Phase 4 — Scripting Engine (Week 5)
Goal: Pre/post-request scripts with assertions.

- [ ] scriptRunner.worker.ts (Web Worker isolation)
- [ ] Build pm object API (environment, request, response, expect, test)
- [ ] PreScriptEditor + TestsEditor (Monaco)
- [ ] useScriptRunner hook (timeout + kill)
- [ ] Run pre-script before request → apply env updates
- [ ] Run post-script after response → collect test results
- [ ] TestResults tab in ResponsePanel
- [ ] ConsolePanel for script output

Milestone: Write and run JavaScript assertions against API responses.

---

### Phase 5 — Docs Explorer (Week 6)
Goal: Swagger-like OpenAPI viewer with Try It.

- [ ] openApiParser.ts (@readme/openapi-parser)
- [ ] docsStore (memory only)
- [ ] DocsExplorer page with EndpointList sidebar
- [ ] EndpointDetail (parameters, request body, responses)
- [ ] SchemaViewer (recursive JSON Schema renderer)
- [ ] TryItPanel → populate RequestBuilder → navigate to RequestPage
- [ ] Upload / fetch / paste YAML or JSON spec
- [ ] ImportExportModal: import OpenAPI → collection

Milestone: Load any OpenAPI spec, browse endpoints, test from docs.

---

### Phase 6 — Collection Runner & Polish (Week 7+)
Goal: Production-ready feel and power features.

- [ ] CollectionRunner (RunnerModal + RunProgress + RunReport)
- [ ] useCollectionRunner hook (sequential execution with delay)
- [ ] Command palette (Ctrl+K) — search across collections + history
- [ ] Code export: cURL, fetch, axios, Python, Go
- [ ] Full dark mode (Tailwind dark:)
- [ ] SettingsPage (proxy URL, request timeout, SSL verify toggle)
- [ ] Keyboard shortcuts map + help modal
- [ ] WebSocket testing (basic connect/send/receive panel)
- [ ] Response visualizer (array of objects → auto-table)
- [ ] Export run report as JSON or HTML

---

## 13. Key Conventions

### File naming
- Components: PascalCase (`RequestPanel.tsx`)
- Hooks: camelCase with `use` prefix (`useRequest.ts`)
- Stores: camelCase with `Store` suffix (`collectionStore.ts`)
- Utils: camelCase (`interpolate.ts`)
- Types: camelCase, singular (`request.ts`)

### Component rules
- One component per file
- Keep components under ~200 lines — split into sub-components if larger
- All props typed with explicit interfaces, no `any`
- Use `cn()` (clsx + tailwind-merge) for conditional class names

### State rules
- Global state only in Zustand stores
- Component-local state for UI (open/close, hover) — use `useState`
- No prop drilling beyond 2 levels — use store or context
- Never mutate state directly — always use store actions

### Request lifecycle
```
1. User clicks Send
2. useRequest reads from requestStore
3. interpolateRequest() resolves all {{vars}}
4. useScriptRunner runs pre-request script → applies env updates
5. Axios POSTs to /proxy with fully-resolved request
6. Proxy forwards to target API
7. Response parsed + stored in responseStore
8. useScriptRunner runs post-request (tests) script
9. historyStore.addEntry() logs the pair
10. UI re-renders from stores
```

### Error handling
- Network errors (proxy unreachable) → show ProxyErrorBanner
- Request timeout → AbortSignal.timeout → show TimeoutError in response
- Script errors → caught in worker → shown in ConsolePanel (never crash app)
- JSON parse errors → show raw body instead of PrettyJson
- Invalid OpenAPI spec → validation error with line reference

---

## 14. Getting Started Commands

```bash
# Install dependencies
pnpm install

# Start frontend (Vite on :5173)
pnpm --filter web dev

# Start proxy server (Express on :3001)
pnpm --filter proxy dev

# Build for production
pnpm --filter web build

# Run unit tests
pnpm --filter web test

# Type check all
pnpm typecheck
```

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
```

### Root package.json scripts
```json
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter web dev\" \"pnpm --filter proxy dev\"",
    "build": "pnpm --filter web build",
    "typecheck": "tsc --noEmit",
    "test": "pnpm --filter web test"
  }
}
```

---

*End of Implementation Plan*
