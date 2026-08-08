from fastapi import FastAPI
from rag_server.core.registry import ModuleRegistry
from rag_server.schemas.rag import IngestRequest, IngestResponse, QueryRequest, QueryResponse
from rag_server.services.rag_service import RagService

app = FastAPI(title='Maintix RAG Server', version='0.1.0')
service = RagService()

@app.on_event('startup')
async def startup() -> None:
    ModuleRegistry.initialize_defaults()

@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}

@app.get('/modules')
def list_modules() -> dict[str, list[str]]:
    return {'modules': ModuleRegistry.list_modules()}

@app.post('/ingest', response_model=IngestResponse)
async def ingest(request: IngestRequest) -> IngestResponse:
    result = await service.ingest_documents([doc.model_dump() for doc in request.documents])
    return IngestResponse(**result)

@app.post('/query', response_model=QueryResponse)
async def query(request: QueryRequest) -> QueryResponse:
    result = await service.query(request.query, request.top_k)
    return QueryResponse(**result)
