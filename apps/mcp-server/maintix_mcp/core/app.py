from __future__ import annotations

from fastapi import FastAPI
from maintix_mcp.services.agent_manager import AgentManager
from maintix_mcp.services.prompt_library import PromptLibrary
from maintix_mcp.services.context_manager import ContextManager
from maintix_mcp.schemas.agents import AgentRequest, AgentResponse, ToolDescriptor, MemoryRequest, MemoryResponse

app = FastAPI(title='Maintix MCP Server', version='0.1.0')
agent_manager = AgentManager()
prompt_library = PromptLibrary()
context_manager = ContextManager()

prompt_library.register('diagnosis', 'Diagnose the issue: {query}', 'Diagnostic prompt')
prompt_library.register('planning', 'Plan for: {query}', 'Planning prompt')
prompt_library.register('production', 'Execute production action: {query}', 'Production workflow prompt')
prompt_library.register('executive', 'Make an executive decision on: {query}', 'Executive prompt')

@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}

@app.get('/agents')
def list_agents() -> dict[str, list[str]]:
    return {'agents': agent_manager.list_agents()}

@app.get('/prompts')
def list_prompts() -> dict[str, list[dict[str, str]]]:
    return {'prompts': [prompt.model_dump() for prompt in prompt_library.list()]}

@app.post('/agent', response_model=AgentResponse)
async def call_agent(request: AgentRequest) -> AgentResponse:
    result = await agent_manager.act(request.agent, request.input)
    context_manager.add_context(request.agent, str(request.input), str(result))
    return AgentResponse(agent=request.agent, output=result, status='success')

@app.get('/memory', response_model=MemoryResponse)
def get_memory() -> MemoryResponse:
    return MemoryResponse(entries=[
        {
            'id': str(index + 1),
            'agent': item['agent'],
            'query': item['query'],
            'response': item['response'],
            'context': [],
        }
        for index, item in enumerate(context_manager.list_context())
    ])

@app.post('/memory/clear')
def clear_memory() -> dict[str, str]:
    context_manager.clear()
    return {'status': 'cleared'}
