# Secrets

Defines local secret management patterns and secret injection for infrastructure services.

## Elements

- Use `.env` files for development secrets with strict local-only storage.
- Keep secrets out of version control via `.gitignore`.
- Use Docker secrets or external secret managers in production-like local setups.
- Protect database credentials, MQTT credentials, and TLS keys.

## Notes

This file describes architecture only; no secret values are included.
