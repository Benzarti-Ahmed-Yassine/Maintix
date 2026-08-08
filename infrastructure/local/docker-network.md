# Docker Network

Defines the local Docker network architecture, service segmentation, and overlay patterns for local development.

## Elements

- `frontend_network` - Frontend and reverse proxy traffic.
- `backend_network` - Backend services and API connectivity.
- `monitoring_network` - Monitoring stack and log collectors.
- `database_network` - Database and persistent stores.
- `mqtt_network` - MQTT broker and message producers/consumers.

## Notes

This file describes architecture only; no Docker network implementation is included.
