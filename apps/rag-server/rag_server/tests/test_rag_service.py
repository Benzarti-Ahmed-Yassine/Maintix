import asyncio

import pytest
from fastapi.testclient import TestClient
from rag_server.main import app
from rag_server.core.store import MemoryDocumentStore, MemoryVectorStore

@pytest.fixture(autouse=True)
def clear_store() -> None:
    asyncio.run(MemoryDocumentStore.clear())
    asyncio.run(MemoryVectorStore.clear())

@pytest.fixture
def client() -> TestClient:
    return TestClient(app)

def test_health_endpoint(client: TestClient) -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}

def test_modules_endpoint(client: TestClient) -> None:
    response = client.get('/modules')
    assert response.status_code == 200
    assert 'modules' in response.json()

def test_ingest_and_query_flow(client: TestClient) -> None:
    ingest_payload = {
        'documents': [
            {'id': 'doc1', 'source': 'unit-test', 'content': 'Hello world. This is a simple document.'}
        ]
    }
    ingest_response = client.post('/ingest', json=ingest_payload)
    assert ingest_response.status_code == 200
    ingest_data = ingest_response.json()
    assert ingest_data['document_count'] == 1
    assert ingest_data['chunk_count'] >= 1
    assert ingest_data['embedding_count'] >= 1
    assert ingest_data['vector_count'] >= 1

    query_payload = {'query': 'Hello', 'top_k': 1}
    query_response = client.post('/query', json=query_payload)
    assert query_response.status_code == 200
    query_data = query_response.json()
    assert query_data['query'] == 'Hello'
    assert isinstance(query_data['results'], list)
    assert query_data['retrieved_count'] == 1
    assert query_data['ranked_count'] == 1
    assert query_data['reranked_count'] == 1
