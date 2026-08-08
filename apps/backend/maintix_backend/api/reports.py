from fastapi import APIRouter

router = APIRouter(prefix='/reports', tags=['Reports'])


@router.get('')
async def reports() -> list[dict[str, str]]:
    return [
        {'id': 'report-1', 'name': 'Weekly performance', 'team': 'Operations', 'published': 'Today', 'status': 'Ready'},
        {'id': 'report-2', 'name': 'Asset reliability', 'team': 'Maintenance', 'published': 'Yesterday', 'status': 'Scheduled'},
        {'id': 'report-3', 'name': 'Supply chain health', 'team': 'Supply', 'published': '2 days ago', 'status': 'Pending'},
    ]
