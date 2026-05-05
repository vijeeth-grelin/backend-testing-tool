# Grelinhealth API Testing Tool

A high-performance, centralized API documentation and testing platform designed for internal engineering teams.

## 🚀 Project Overview

The **Grelinhealth API Testing Tool** (formerly AntiGravity) is a hybrid platform that combines the flexibility of **Postman** with the structured documentation of **Swagger**. It serves as the single source of truth for all internal APIs, enabling developers to discover, test, and audit services in a unified environment.

### Problems It Solves:
*   **Fragmentation**: Replaces scattered local Postman collections with a centralized database of versioned API snapshots.
*   **Protocol Complexity**: Handles REST and WebSockets in a single interface with built-in proxying to bypass CORS issues.
*   **Documentation Lag**: Allows admins to "Publish" live versions of API collections directly to a team portal, ensuring documentation is always in sync with implementation.
*   **Security**: Implements strict Zod-based validation and DOMPurify sanitization to protect internal auditing data.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Zustand (State Management), Lucide Icons.
*   **Backend**: Node.js, Express, Prisma ORM (SQLite), Socket.io (WS Bridge).
*   **Security**: Zod (Validation), DOMPurify (XSS Protection), JWT (Auth).
*   **Persistence**: Zustand Persist (Browser) + SQLite (Server-side snapshots).

---

## 📂 Project Structure

The project is managed as a **pnpm workspace**:

```text
.
├── apps/
│   ├── web/                # React Frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── hooks/      # Custom React hooks (useRequest, etc.)
│   │   │   ├── pages/      # Main application views (Admin, Portal, Tester)
│   │   │   ├── store/      # Zustand state slices
│   │   │   └── utils/      # Security, validation, and helper functions
│   │   └── index.html
│   └── proxy/              # Express Backend & API Proxy
│       ├── prisma/         # Database schema and migrations
│       ├── src/
│       │   ├── lib/        # Core utilities (auth, db, schemas)
│       │   ├── middleware/ # Auth & Validation logic
│       │   └── index.ts    # Server entry point
│       └── package.json
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md               # You are here
```

---

## 🚦 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   pnpm (`npm install -g pnpm`)

### 2. Installation
```bash
pnpm install
```

### 3. Database Setup (Proxy)
```bash
cd apps/proxy
npx prisma generate
npx prisma migrate dev
pnpm tsx src/seed.ts # Seeds the admin account (admin@grelinhealth.ai / admin123)
```

### 4. Running Locally
From the root directory:
```bash
pnpm dev
```
*   **Frontend**: `http://localhost:5173`
*   **Backend/Proxy**: `http://localhost:3001`

---

## 🔐 Key Security Features
*   **Input Sanitization**: All user-provided strings are sanitized via `utils/security.ts` before rendering to prevent XSS.
*   **Schema Validation**: Every API request and form submission is validated using **Zod** on both the client and server.
*   **Role-Based Access**: The `/admin` dashboard is protected by a strict middleware layer requiring an Admin JWT.

## 🤝 Contributing
For new developers:
1.  Review the `api-testing-tool-plan.md` for deep architecture details.
2.  Ensure all new components use the established design system (Tailwind + Lucide).
3.  Always wrap API interactions in the `handleZodError` utility for consistent feedback.

---
© 2026 Grelinhealth AI. All rights reserved.
