#!/bin/bash
# ==============================================================================
# MAINTIX INDUSTRIAL PLATFORM — PRODUCTION LAUNCH SCRIPT
# ==============================================================================
set -e

echo "🏭 ========================================================"
echo "   MAINTIX INDUSTRIAL DECISION INTELLIGENCE PLATFORM"
echo "   Starting Production Multi-Service Container Stack..."
echo "========================================================"

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start the Docker daemon first."
  exit 1
fi

# Copy .env.example if .env does not exist
if [ ! -f .env ]; then
  echo "📋 .env not found. Creating from .env.example..."
  cp .env.example .env
fi

echo "🚀 Building and starting containers..."
docker compose up -d --build

echo "⏳ Waiting for healthchecks to pass..."
sleep 5

docker compose ps

echo ""
echo "✅ MAINTIX Industrial Platform is ONLINE!"
echo "   - Web Application (Frontend):  http://localhost:3000"
echo "   - Industrial Core API:         http://localhost:4000/api"
echo "   - ML Inference & RAG Service:  http://localhost:8000/docs"
echo "   - Mosquitto MQTT Broker:       mqtt://localhost:1883"
echo "   - Grafana Observability:       http://localhost:3000 (via reverse-proxy or :3000 container)"
echo "   - Prometheus Metrics:          http://localhost:9090"
echo ""
echo "📝 Run 'docker compose logs -f' to view real-time production logs."
