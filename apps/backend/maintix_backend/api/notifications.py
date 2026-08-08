from fastapi import APIRouter

router = APIRouter(prefix='/notifications', tags=['Notifications'])


@router.get('')
async def notifications() -> list[dict[str, str]]:
    return [
        {'id': 'note-1', 'category': 'Maintenance', 'message': 'Bearing life exceeded on asset A12.', 'time': '5m ago', 'status': 'Unread'},
        {'id': 'note-2', 'category': 'Production', 'message': 'Shift performance below target for line B.', 'time': '20m ago', 'status': 'Unread'},
        {'id': 'note-3', 'category': 'IT', 'message': 'Data sync completed for ERP connector.', 'time': '1h ago', 'status': 'Read'},
    ]
