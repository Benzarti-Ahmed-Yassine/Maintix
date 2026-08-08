from fastapi.testclient import TestClient
from maintix_mcp.core.app import app

client = TestClient(app)

def test_health() -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}

def test_list_agents() -> None:
    response = client.get('/agents')
    assert response.status_code == 200
    assert 'diagnosis' in response.json()['agents']

def test_agent_call() -> None:
    response = client.post('/agent', json={'agent': 'diagnosis', 'input': {'issue': 'sensor fault'}})
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert data['agent'] == 'diagnosis'
    assert 'diagnosis' in data['output']

def test_memory_endpoints() -> None:
    client.post('/agent', json={'agent': 'planning', 'input': {'target': 'line 1'}})
    response = client.get('/memory')
    assert response.status_code == 200
    entries = response.json()['entries']
    assert len(entries) >= 1
    clear_response = client.post('/memory/clear')
    assert clear_response.status_code == 200
    assert clear_response.json()['status'] == 'cleared'
