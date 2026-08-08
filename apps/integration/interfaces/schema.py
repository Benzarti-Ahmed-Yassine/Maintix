from abc import ABC, abstractmethod
from typing import Any, Dict


class SchemaInterface(ABC):
    """Interface for integration schema validation and mapping."""

    @abstractmethod
    def validate(self, payload: Any) -> bool:
        raise NotImplementedError

    @abstractmethod
    def transform(self, payload: Any) -> Dict[str, Any]:
        raise NotImplementedError


class SimpleSchema(SchemaInterface):
    """Basic schema validator that checks required fields and applies key mappings."""

    def __init__(self, required_fields: list[str] | None = None, mappings: Dict[str, str] | None = None) -> None:
        self.required_fields = required_fields or []
        self.mappings = mappings or {}

    def validate(self, payload: Any) -> bool:
        if not isinstance(payload, dict):
            return False

        if all(field in payload for field in self.required_fields):
            return True

        nested_body = payload.get('body')
        if isinstance(nested_body, dict):
            return all(field in nested_body for field in self.required_fields)

        return False

    def transform(self, payload: Any) -> Dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("Payload must be a dict for SimpleSchema transformation")

        if self.mappings:
            mapped_payload: Dict[str, Any] = {}
            for source_field, target_field in self.mappings.items():
                if source_field in payload:
                    mapped_payload[target_field] = payload[source_field]
                elif isinstance(payload.get('body'), dict) and source_field in payload['body']:
                    mapped_payload[target_field] = payload['body'][source_field]
                else:
                    mapped_payload[target_field] = payload.get('body', payload)
            return mapped_payload

        return {self.mappings.get(key, key): value for key, value in payload.items()}
