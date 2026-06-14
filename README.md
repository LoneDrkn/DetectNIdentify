# 🔐 Access Role Audit & Fraud Detection

A full-stack AI-powered platform for auditing user access roles and detecting fraudulent activity in enterprise environments. The system combines real-time event monitoring, AI-driven forensic analysis (powered by Google Gemini), and role management into a unified dashboard.

---

## 🚀 Features

- **AI Forensic Audit** — Trigger Gemini-powered analysis on any user to surface anomalous behaviour patterns
- **Fraud Alerts** — View and triage flagged security events across your organisation
- **User Directory** — Browse, search, and manage users with inline role toggling
- **Log Import** — Import SOC/audit logs for ingestion and analysis
- **Synthetic Log Generator** — Generate realistic test data to simulate access scenarios
- **Dual Storage** — MongoDB for production; automatic fallback to JSON file storage when unavailable

---

## 🏗️ Project Structure

```
access-role-audit-&-fraud-detection/
├── frontend/          # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/    # Shared UI components (Header, Nav, Footer, Toast)
│   │   ├── features/      # Feature-level tab modules
│   │   │   ├── AlertsTab/
│   │   │   ├── DirectoryTab/
│   │   │   ├── GeneratorTab/
│   │   │   └── ImportTab/
│   │   ├── hooks/         # Custom React hooks (useAppData, etc.)
│   │   ├── types/         # Shared TypeScript types
│   │   └── utils/         # Utility helpers
│   └── vite.config.ts
├── backend/           # Express + TypeScript API server
│   ├── server.ts          # Main entry point & API routes
│   ├── src/               # Additional server modules
│   └── data/              # JSON fallback storage
├── .env.example       # Environment variable template
└── package.json       # Root workspace config (npm workspaces)
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **npm** v8+ (with workspaces support)
- A **Google Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))
- *(Optional)* **MongoDB** instance — falls back to JSON storage if unavailable

---

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/LoneDrkn/DetectNIdentify.git
cd DetectNIdentify
```

### 2. Install dependencies

```bash
npm install
```

> This installs dependencies for both `frontend` and `backend` workspaces in one step.

### 3. Configure environment variables

```bash
cp .env.example backend/.env
```

Then edit `backend/.env` and fill in your values:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
MONGODB_URI="mongodb://localhost:27017/fraud_detection"   # optional
```

---

## 🧑‍💻 Development

Run the frontend and backend dev servers concurrently:

```bash
npm run dev
```

| Service  | URL                    | Notes                            |
|----------|------------------------|----------------------------------|
| Frontend | http://localhost:5173  | Vite HMR dev server              |
| Backend  | http://localhost:3000  | Express API, proxied by Vite     |

Or run each workspace independently:

```bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev
```

---

## 📦 Production Build

Build the frontend and serve it from the backend on port `3000`:

```bash
npm start
```

This will:
1. Compile the React app into `frontend/dist/`
2. Copy the static build into `backend/`
3. Start the Express server, which serves both the API and the static frontend

---

## 🔑 Environment Variables

| Variable       | Required | Description                                                |
|----------------|----------|------------------------------------------------------------|
| `GEMINI_API_KEY` | ✅ Yes  | Google Gemini API key for AI forensic analysis             |
| `APP_URL`      | ✅ Yes   | Base URL of the deployed app (used for internal references)|
| `MONGODB_URI`  | ❌ No    | MongoDB connection string; falls back to JSON if omitted   |

---

## 🧰 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, TailwindCSS |
| Backend   | Node.js, Express, TypeScript, tsx   |
| AI        | Google Gemini (`@google/genai`)     |
| Database  | MongoDB (optional) / JSON fallback  |
| Build     | esbuild, npm workspaces             |

---

## 📄 License

This project is private. All rights reserved.
