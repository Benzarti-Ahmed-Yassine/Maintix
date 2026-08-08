from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from maintix_backend.core.security.token_provider import TokenProvider

bearer_scheme = HTTPBearer()

async def auth_middleware(request: Request) -> None:
    credentials = await bearer_scheme(request)
    if credentials.scheme.lower() != 'bearer':
        raise HTTPException(status_code=401, detail='Invalid authentication scheme')
    try:
        TokenProvider.verify_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail='Invalid token') from exc
