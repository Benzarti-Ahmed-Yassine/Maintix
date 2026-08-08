from __future__ import annotations

from collections.abc import AsyncGenerator

from dotenv import load_dotenv
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from maintix_backend.db.base import Base

load_dotenv()

if os.getenv('DATABASE_URL'):
    DATABASE_URL = os.getenv('DATABASE_URL')
elif os.getenv('TESTING') == '1':
    DATABASE_URL = 'sqlite+aiosqlite:///./.maintix-test.db'
else:
    DATABASE_URL = 'postgresql+asyncpg://user:password@localhost:5432/maintix'

engine = create_async_engine(DATABASE_URL, future=True, echo=False)
async_session_factory: sessionmaker[AsyncSession] | None = None


async def create_session_factory() -> None:
    global async_session_factory
    if async_session_factory is None:
        async_session_factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    if os.getenv('TESTING') == '1':
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if async_session_factory is None:
        await create_session_factory()

    async with async_session_factory() as session:
        yield session
