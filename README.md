# Maintix

Maintix is a multi-application industrial maintenance platform built for asset monitoring, predictive maintenance, gateway integration, and MLOps workflows. This repository includes backend services, frontend UI, edge device firmware, AI/ML pipelines, RAG services, integration connectors, and infrastructure configuration.

## Key components

- `apps/backend` — FastAPI backend service with REST APIs, MQTT integration, and database models.
- `apps/frontend` — Vite + React frontend application for dashboards, maintenance operations, and system management.
- `apps/edge-firmware` — Embedded firmware and libraries for edge devices.
- `apps/edge-gateway` — Gateway service for device communication, adapters, and local storage.
- `apps/ai-platform` — AI platform modules and orchestration services.
- `apps/mlops` — MLOps pipelines, model registry, monitoring, and deployment utilities.
- `apps/rag-server` — Retrieval-Augmented Generation server and document/vector store adapters.
- `apps/integration` — Connectors and orchestrators for external systems like MQTT, OPC UA, SAP, and REST.
- `apps/mcp-server` — Modular Copilot-based planning and diagnosis agents.
- `packages` — Shared SDKs, utilities, and type packages used across the monorepo.
- `infrastructure` — Docker composition, networking, monitoring, and deployment documentation.

## Repository structure

```text
.
├── apps/
│   ├── ai-platform/
│   ├── backend/
│   ├── edge-firmware/
│   ├── edge-gateway/
│   ├── frontend/
│   ├── integration/
│   ├── mcp-server/
│   ├── mlops/
│   └── rag-server/
├── config/
├── data/
├── docs/
├── infrastructure/
├── packages/
├── tests/
├── docker-compose.yml
├── pyproject.toml
├── pytest.ini
└── README.md
```

## Getting started

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ or compatible version
- Node.js 18+ / npm or pnpm
- Git

### Local setup

1. Clone the repository:

```bash
git clone https://github.com/Benzarti-Ahmed-Yassine/Maintix.git
cd Maintix
```

2. Create and activate a Python virtual environment:

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # PowerShell
# or
.\.venv\Scripts\activate.bat  # Command Prompt
```

3. Install Python dependencies for the services you intend to run. For example, in `apps/backend`:

```bash
cd apps/backend
pip install -r requirements.txt
```

4. Install frontend dependencies:

```bash
cd apps/frontend
npm install
```

### Running the platform

The repository includes a root-level `docker-compose.yml` for local orchestration. Use Docker Compose for a complete stack:

```bash
docker compose up --build
```

Individual apps can also be launched separately:

- Backend: `apps/backend`
- Frontend: `apps/frontend`
- MLOps: `apps/mlops`
- RAG server: `apps/rag-server`
- Edge gateway: `apps/edge-gateway`

## App-specific notes

### Backend

The backend service is located in `apps/backend` and exposes REST APIs, MQTT integration, and database persistence. Check `apps/backend/README.md` for additional startup instructions.

### Frontend

The frontend is a Vite + React app under `apps/frontend`. Use `npm run dev` to start the development server.

### MLOps

The `apps/mlops` directory contains pipelines, model artifacts, and monitoring utilities for training and deployment.

### Edge gateway and firmware

- `apps/edge-gateway` contains adapters and gateway logic for industrial communication protocols.
- `apps/edge-firmware` contains firmware sources and platform configuration for edge devices.

## Testing

Use `pytest` for Python tests. From the repository root:

```bash
pytest
```

For frontend tests and local validation, use the tools defined in `apps/frontend`.

## Contributing

1. Fork the repository or create a feature branch.
2. Add tests for new features or bug fixes.
3. Update documentation as needed.
4. Submit a pull request with a clear description of the change.

## License

This repository is licensed under the terms of the `LICENSE` file.

