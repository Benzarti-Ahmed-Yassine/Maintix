# Volumes

Defines the local persistent volume architecture for container state and data.

## Elements

- `db_data` - Database persistent storage.
- `mqtt_data` - MQTT broker data persistence.
- `prometheus_data` - Monitoring time-series persistence.
- `loki_data` - Log storage for Loki.
- `nginx_certs` - Certificates and TLS assets for reverse proxy.
- `app_cache` - Cache or temporary storage for local services.

## Notes

This file describes architecture only; no volume implementation is included.
