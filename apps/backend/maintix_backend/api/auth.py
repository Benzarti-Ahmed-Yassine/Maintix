from fastapi import APIRouter, Header, HTTPException, status

from maintix_backend.core.security.token_provider import TokenProvider
from maintix_backend.schemas.auth import LoginSchema, TokenSchema

auth_router = APIRouter(prefix='/auth', tags=['Auth'])


@auth_router.post('/login', response_model=TokenSchema)
async def login(payload: LoginSchema) -> TokenSchema:
    if payload.username == 'tech' and payload.password == 'secret':
        token = TokenProvider.create_access_token(payload.username)
        return TokenSchema(access_token=token)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')


@auth_router.get('/validate')
async def validate(authorization: str | None = Header(default=None)) -> dict[str, str | bool]:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing bearer token')

    token = authorization.split(' ', 1)[1]
    try:
        payload = TokenProvider.verify_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token') from exc

    return {'status': 'valid', 'subject': payload.get('sub', 'unknown')}
