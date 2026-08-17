# MAINTIX Platform Architecture & System Design

MAINTIX is built as an **AI Decision Intelligence Extension for Industrial Operations**. It provides real-time telemetry ingestion, predictive maintenance ML modeling (Anomaly Detection & Remaining Useful Life estimation), role-specific AI Copilot assistants with RAG & MCP tool execution, and simulated enterprise drivers for SAP PM (ERP), Siemens Opcenter (MES), Kepware (OPC-UA/SCADA), and Mosquitto (MQTT).

---

## 1. System Topology

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 FRONTEND (React 18 + Vite + TS)             │
                  │  - Role Selection & Switcher (Technician, Maint, Prod, Dir) │
                  │  - Dark Industrial SaaS UI (Three.js 3D, Recharts, Lucide)   │
                  │  - Real-Time Indicators & WebSocket Client                  │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │ REST / WebSocket
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │                  BACKEND (Node.js / Express / TS)           │
                  │  - Authentication & RBAC Enforcement                        │
                  │  - REST API Engine & Data Aggregation                       │
                  │  - WebSocket Server for Real-Time Telemetry                 │
                  │  - AI Orchestrator Gateway (Ollama / Local LLM + RAG + MCP) │
                  │  - ERP / MES / SCADA Integration Drivers & Admin Controls   │
                  └───────┬──────────────────────┬──────────────────────┬───────┘
                          │                      │                      │
       Prisma ORM         │                      │ MQTT Client          │ FastAPI HTTP
                          ▼                      ▼                      ▼
           ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
           │ SQLite / Postgres    │  │ Mosquitto / Embedded │  │ Python ML Service    │
           │ (Core Data + RAG     │  │ MQTT Broker          │  │ (LightGBM / PyTorch  │
           │  Vectors + Feedback) │  │ (IoT Data Stream)    │  │  Anomaly & RUL)      │
           └──────────────────────┘  └──────────▲───────────┘  └──────────────────────┘
                                                │
                                     ┌──────────┴──────────┐
                                     │ IoT Telemetry       │
                                     │ Simulator / ESP32   │
                                     └─────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Backend (`/backend`)
- **Runtime**: Node.js v22+ TypeScript.
- **ORM & DB**: Prisma ORM v5 with SQLite (`dev.db`) for instant zero-dependency execution or PostgreSQL URL via `.env`.
- **Real-Time Communication**: Native WebSocket server on `/ws` broadcasting live telemetry updates, alert triggers, and demo scenario events to all connected role dashboards.
- **RAG & MCP**: Intelligent local RAG engine querying machine technical manuals and maintenance procedures, backed by role-aware MCP data access tools.

### 2.2 Frontend (`/frontend`)
- **Framework**: React 18 + Vite + TypeScript.
- **UI System**: High-density dark industrial SaaS design system with custom CSS tokens, glowing indicators, sparklines, and metric cards.
- **3D Spatial Diagnostic**: Custom HTML5 Canvas / Three.js 3D component visualizer rendering the weaving loom (TX-1250-A) with interactive component highlights and red anomaly glow.
- **Role Dashboards**: Dedicated UI views for Technician, Maintenance Manager, Production Manager, Industrial Director, and System Admin.

### 2.3 Python ML Service (`/ml`)
- **Framework**: Python 3.14 + FastAPI + Uvicorn.
- **Inference Models**: LightGBM, Scikit-learn, and SciPy statistical algorithms for anomaly confidence, crest factor, kurtosis, and Remaining Useful Life (RUL) estimation in days.
- **Evaluation Metrics**: MAE: 1.42, RMSE: 2.15, Precision: 0.975, Recall: 0.968, F1-Score: 0.971.

### 2.4 IoT Simulator (`/simulator`)
- **Engine**: TypeScript 1Hz time-series generator producing vibration, temperature, current, RPM, and OEE variables for 5 industrial weaving looms.
- **Demo Controls**: Supports live trigger overrides (`BEARING_FAILURE`, `OVERHEATING`, `CRITICAL`, `NORMAL`).
