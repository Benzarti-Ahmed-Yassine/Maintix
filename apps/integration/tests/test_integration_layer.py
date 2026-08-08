import pytest

from integration.connectors.rest_connector import RESTConnector
from integration.connectors.sql_connector import SQLConnector
from integration.connectors.mqtt_connector import MQTTConnector
from integration.connectors.webhook_connector import WebhookConnector
from integration.connectors.sap_connector import SAPConnector
from integration.connectors.mes_connector import MESConnector
from integration.connectors.cmms_connector import CMMSConnector
from integration.connectors.opcua_connector import OPCUAConnector
from integration.connectors.csv_connector import CSVConnector
from integration.interfaces.schema import SimpleSchema
from integration.services.registry import ConnectorRegistry
from integration.services.orchestrator import IntegrationOrchestrator


def test_connector_registry_register_and_retrieve() -> None:
    registry = ConnectorRegistry()
    rest_connector = RESTConnector()
    registry.register_connector("rest", rest_connector)

    assert registry.get_connector("rest") is rest_connector
    assert "rest" in registry.list_connectors()


def test_rest_connector_execute_requires_connection() -> None:
    connector = RESTConnector()
    with pytest.raises(ConnectionError):
        connector.execute({"hello": "world"})

    connector.connect({})
    result = connector.execute({"hello": "world"})
    assert result["status"] == "ok"
    connector.disconnect()


def test_sql_connector_insert_and_select() -> None:
    connector = SQLConnector()
    connector.connect({})
    insert_result = connector.execute({"action": "insert", "record": {"id": 1, "name": "test"}})
    assert insert_result["inserted"] == 1

    select_result = connector.execute({"action": "select"})
    assert select_result["rows"] == [{"id": 1, "name": "test"}]
    connector.disconnect()


def test_mqtt_connector_publish() -> None:
    connector = MQTTConnector()
    connector.connect({})
    result = connector.execute({"topic": "test", "payload": "data"})
    assert result["published"] is True
    assert result["count"] == 1
    connector.disconnect()


def test_webhook_connector_delivers_event() -> None:
    connector = WebhookConnector()
    connector.connect({})
    result = connector.execute({"event": "created"})
    assert result["delivered"] is True
    assert result["events"] == 1
    connector.disconnect()


def test_integration_orchestrator_routes_between_connectors() -> None:
    registry = ConnectorRegistry()
    rest_connector = RESTConnector()
    webhook_connector = WebhookConnector()
    registry.register_connector("rest", rest_connector)
    registry.register_connector("webhook", webhook_connector)

    orchestrator = IntegrationOrchestrator(registry)
    schema = SimpleSchema(required_fields=["message"], mappings={"message": "body"})
    payload = {"message": "hello"}

    result = orchestrator.route(
        source="rest",
        payload=payload,
        target="webhook",
        metadata={
            "source_config": {},
            "target_config": {},
            "schema": schema,
        },
    )

    assert result["delivered"] is True
    assert result["events"] == 1


def test_sap_connector_mock_actions() -> None:
    connector = SAPConnector()
    connector.connect({})
    result = connector.execute({"action": "order_create"})
    assert result["status"] == "created"
    assert result["order_id"] == "SAP-1001"
    connector.disconnect()


def test_mes_connector_start_run_and_list_runs() -> None:
    connector = MESConnector()
    connector.connect({})
    run_result = connector.execute({"action": "start_run", "details": {"product": "widget"}})
    assert run_result["status"] == "running"
    assert run_result["run_id"].startswith("MES-")

    list_result = connector.execute({"action": "list_runs"})
    assert list_result["runs"][0]["product"] == "widget"
    connector.disconnect()


def test_cmms_connector_create_and_list_work_orders() -> None:
    connector = CMMSConnector()
    connector.connect({})
    work_order = connector.execute({"action": "create_work_order", "details": {"asset": "pump"}})
    assert work_order["status"] == "open"
    assert work_order["asset"] == "pump"

    list_result = connector.execute({"action": "list_work_orders"})
    assert list_result["work_orders"][0]["asset"] == "pump"
    connector.disconnect()


def test_opcua_connector_read_and_browse() -> None:
    connector = OPCUAConnector()
    connector.connect({})
    read_result = connector.execute({"action": "read_node", "node_id": "Machine/Status"})
    assert read_result["value"] == "Running"

    browse_result = connector.execute({"action": "browse"})
    assert "Machine/Status" in browse_result["nodes"]
    connector.disconnect()


def test_csv_connector_write_and_read() -> None:
    connector = CSVConnector()
    connector.connect({"delimiter": ","})
    csv_result = connector.execute({
        "action": "write",
        "headers": ["id", "name"],
        "rows": [{"id": "1", "name": "Alice"}],
    })
    assert "id,name" in csv_result["csv"]

    read_result = connector.execute({"action": "read", "csv": csv_result["csv"]})
    assert read_result["rows"][0]["name"] == "Alice"
    connector.disconnect()
