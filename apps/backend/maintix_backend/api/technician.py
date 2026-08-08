from fastapi import APIRouter

technician_router = APIRouter(prefix='/technician', tags=['Technician'])


@technician_router.get('/dashboard')
async def dashboard() -> list[dict[str, str]]:
    return [
        {'id': 'task-1', 'title': 'Replace filter assembly', 'asset': 'Compressor 11', 'due': 'Today 17:00', 'status': 'In progress', 'priority': 'High'},
        {'id': 'task-2', 'title': 'Validate torque sensor', 'asset': 'Robot Arm 5', 'due': 'Tomorrow 09:00', 'status': 'Assigned', 'priority': 'Medium'},
        {'id': 'task-3', 'title': 'Lubricate conveyor sprockets', 'asset': 'Line B', 'due': 'Today 22:00', 'status': 'Review', 'priority': 'Low'},
    ]


@technician_router.get('/tasks')
async def tasks() -> list[dict[str, str]]:
    return await dashboard()
