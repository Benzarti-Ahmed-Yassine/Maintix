import asyncio
import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault('TESTING', '1')

from maintix_backend.core.events.event_bus import EventBus
from maintix_backend.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_login_and_token_validation(client: TestClient) -> None:
    login_response = client.post('/auth/login', json={'username': 'tech', 'password': 'secret'})
    assert login_response.status_code == 200
    token = login_response.json()['access_token']

    validate_response = client.get('/auth/validate', headers={'Authorization': f'Bearer {token}'})
    assert validate_response.status_code == 200
    assert validate_response.json()['status'] == 'valid'


def test_integration_status_reports_module_health(client: TestClient) -> None:
    response = client.get('/integrations/status')
    assert response.status_code == 200
    payload = response.json()
    assert payload['status'] == 'ok'
    assert payload['modules']['rag']['status'] == 'ready'
    assert payload['communications']['backend->mcp'] == 'ready'


def test_operator_endpoints_return_ui_payloads(client: TestClient) -> None:
    maintenance_overview = client.get('/maintenance/overview')
    assert maintenance_overview.status_code == 200
    assert maintenance_overview.json()['backlog'] == 24

    production_metrics = client.get('/production/metrics')
    assert production_metrics.status_code == 200
    assert production_metrics.json()[0]['label'] == 'Line A'

    systems = client.get('/integrations/systems')
    assert systems.status_code == 200
    assert systems.json()[0]['name'] == 'ERP connector'


def test_websocket_broadcasts_alert_events(client: TestClient) -> None:
    with client.websocket_connect('/ws/events') as websocket:
        connected = websocket.receive_json()
        assert connected['type'] == 'connected'

        asyncio.run(EventBus.publish('mqtt.message', {'topic': 'maintix/telemetry', 'payload': '{"temp": 82}'}))

        message = websocket.receive_json()
        assert message['type'] == 'mqtt.message'
        assert message['payload']['topic'] == 'maintix/telemetry'
