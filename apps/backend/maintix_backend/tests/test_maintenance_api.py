import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault('TESTING', '1')

from maintix_backend.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_create_and_fetch_maintenance_order(client: TestClient) -> None:
    payload = {
        'asset_id': 7,
        'title': 'Replace bearing on conveyor 3',
        'description': 'Preventive maintenance before the next shift',
        'status': 'scheduled',
        'assigned_to': 11,
        'scheduled_at': '2026-08-06T09:00:00',
    }

    create_response = client.post('/maintenance', json=payload)
    assert create_response.status_code == 201
    data = create_response.json()
    assert data['title'] == payload['title']
    assert data['status'] == 'scheduled'

    get_response = client.get('/maintenance')
    assert get_response.status_code == 200
    assert any(item['id'] == data['id'] for item in get_response.json())
