from fastapi import APIRouter

integration_router = APIRouter(prefix='/integrations', tags=['Integrations'])


@integration_router.get('/status')
async def integration_status() -> dict[str, object]:
    return {
        'status': 'ok',
        'modules': {
            'backend': {'status': 'ready'},
            'rag': {'status': 'ready'},
            'mcp': {'status': 'ready'},
            'mqtt': {'status': 'ready'},
            'timescaledb': {'status': 'ready'},
        },
        'communications': {
            'backend->mcp': 'ready',
            'backend->rag': 'ready',
            'backend->mqtt': 'ready',
            'backend->timescaledb': 'ready',
        },
    }


@integration_router.get('/systems')
async def systems() -> list[dict[str, str]]:
    return [
        {'id': 'sys-1', 'name': 'ERP connector', 'connector': 'SAP S/4HANA', 'status': 'Healthy', 'latency': '120ms'},
        {'id': 'sys-2', 'name': 'MES pipeline', 'connector': 'Siemens OpCenter', 'status': 'Warning', 'latency': '320ms'},
        {'id': 'sys-3', 'name': 'CMMS sync', 'connector': 'IBM Maximo', 'status': 'Healthy', 'latency': '95ms'},
        {'id': 'sys-4', 'name': 'IoT gateway', 'connector': 'MQTT Mesh', 'status': 'Offline', 'latency': '—'},
    ]
