from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix='/ai', tags=['AI'])


class AiReplyRequest(BaseModel):
    question: str


@router.get('/suggestions')
async def suggestions() -> list[dict[str, str]]:
    return [
        {'id': 'suggestion-1', 'label': 'Inspect surge tanks after next batch'},
        {'id': 'suggestion-2', 'label': 'Shift preventive maintenance window to midnight'},
        {'id': 'suggestion-3', 'label': 'Use production buffer for line C to avoid delay'},
    ]


@router.post('/reply')
async def reply(payload: AiReplyRequest) -> dict[str, str]:
    return {
        'id': 'reply-1',
        'question': payload.question,
        'answer': f"I reviewed the latest operational state. For '{payload.question}', I recommend verifying connection health, batching maintenance checks, and aligning schedules with the process window to reduce rework.",
        'createdAt': '2026-08-06T00:00:00Z',
    }
