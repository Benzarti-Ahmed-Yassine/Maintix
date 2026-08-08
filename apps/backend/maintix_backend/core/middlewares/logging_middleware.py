from fastapi import Request
import logging

logger = logging.getLogger('maintix')

async def logging_middleware(request: Request, call_next):
    logger.info('Incoming request', extra={'path': request.url.path, 'method': request.method})
    response = await call_next(request)
    logger.info('Outgoing response', extra={'status_code': response.status_code})
    return response
