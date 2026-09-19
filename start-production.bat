@echo off
REM ==============================================================================
REM MAINTIX INDUSTRIAL PLATFORM — WINDOWS PRODUCTION LAUNCH SCRIPT
REM ==============================================================================

echo 🏭 ========================================================
echo    MAINTIX INDUSTRIAL DECISION INTELLIGENCE PLATFORM
echo    Starting Production Multi-Service Container Stack...
echo ========================================================

if not exist .env (
    echo 📋 .env not found. Creating from .env.example...
    copy .env.example .env
)

echo 🚀 Building and starting containers via Docker Compose...
docker compose up -d --build

echo ⏳ Verifying container health status...
docker compose ps

echo.
echo ✅ MAINTIX Industrial Platform is ONLINE!
echo    - Web Application (Frontend):  http://localhost:3000
echo    - Industrial Core API:         http://localhost:4000/api
echo    - ML Inference & RAG Service:  http://localhost:8000/docs
echo    - Mosquitto MQTT Broker:       mqtt://localhost:1883
echo    - Prometheus Metrics:          http://localhost:9090
echo.
echo 📝 Run 'docker compose logs -f' to inspect container logs.
