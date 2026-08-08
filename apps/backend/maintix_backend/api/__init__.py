from fastapi import APIRouter

from maintix_backend.api.health import health_router
from maintix_backend.api.auth import auth_router
from maintix_backend.api.websocket import websocket_router
from maintix_backend.api.mqtt import mqtt_router
from maintix_backend.api.maintenance import maintenance_router
from maintix_backend.api.production import production_router
from maintix_backend.api.technician import technician_router
from maintix_backend.api.director import director_router
from maintix_backend.api.settings import settings_router
from maintix_backend.api.integrations import integration_router
from maintix_backend.api.dashboard import router as dashboard_router
from maintix_backend.api.notifications import router as notifications_router
from maintix_backend.api.reports import router as reports_router
from maintix_backend.api.ai import router as ai_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(websocket_router)
api_router.include_router(mqtt_router)
api_router.include_router(maintenance_router)
api_router.include_router(production_router)
api_router.include_router(technician_router)
api_router.include_router(director_router)
api_router.include_router(settings_router)
api_router.include_router(integration_router)
api_router.include_router(dashboard_router)
api_router.include_router(notifications_router)
api_router.include_router(reports_router)
api_router.include_router(ai_router)
