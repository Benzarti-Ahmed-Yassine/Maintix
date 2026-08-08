from typing import Any, Dict
from integration.interfaces.schema import SchemaInterface, SimpleSchema
from integration.services.registry import ConnectorRegistry


class IntegrationOrchestrator:
    """Orchestration service for integration workflows."""

    def __init__(self, registry: ConnectorRegistry) -> None:
        self.registry = registry

    def route(self, source: str, payload: Any, target: str, metadata: Dict[str, Any] | None = None) -> Any:
        metadata = metadata or {}
        source_connector = self.registry.get_connector(source)
        target_connector = self.registry.get_connector(target)

        source_connector.connect(metadata.get("source_config", {}))
        raw_payload = source_connector.execute(payload)
        source_connector.disconnect()

        transformed_payload = self.transform(raw_payload, metadata.get("schema"))

        target_connector.connect(metadata.get("target_config", {}))
        result = target_connector.execute(transformed_payload)
        target_connector.disconnect()

        return result

    def transform(self, payload: Any, schema: Any | None = None) -> Any:
        if isinstance(schema, SchemaInterface):
            if not schema.validate(payload):
                raise ValueError("Payload validation failed")
            return schema.transform(payload)

        if isinstance(schema, dict):
            validator = SimpleSchema(
                required_fields=schema.get("required_fields"),
                mappings=schema.get("mappings"),
            )
            if not validator.validate(payload):
                raise ValueError("Payload validation failed")
            return validator.transform(payload)

        return payload
