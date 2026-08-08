from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from maintix_backend.db.base import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), unique=True, nullable=False)
    email = Column(String(256), unique=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
