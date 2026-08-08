from fastapi import APIRouter

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])


@router.get('/overview')
async def dashboard_overview() -> dict[str, object]:
    return {
        'topMetrics': [
            {'title': 'Asset readiness', 'value': '96%', 'description': 'Predictive maintenance coverage for critical equipment.'},
            {'title': 'OEE forecast', 'value': '88%', 'description': 'Estimated output efficiency across all production lines.'},
            {'title': 'AI risk alerts', 'value': '3 active', 'description': 'High-priority issues requiring supervisory review.'},
        ],
        'oeeLabels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'oeeValues': [84, 86, 88, 87, 89, 90, 91],
        'backlogLabels': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        'backlogValues': [18, 22, 20, 16],
        'activeAlerts': [
            {
                'id': 'alert-1',
                'title': 'Temperature drift on press line 2',
                'severity': 'high',
                'details': 'AI model detected repeated temperature spikes above threshold.',
                'timestamp': '12m ago',
            }
        ],
    }
