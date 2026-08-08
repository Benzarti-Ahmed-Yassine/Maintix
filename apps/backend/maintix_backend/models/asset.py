from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from maintix_backend.db.base import Base

class Asset(Base):
    __tablename__ = 'assets'

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String(128), unique=True, nullable=False)
    name = Column(String(256), nullable=False)
    category = Column(String(128), nullable=False)
    location = Column(String(256), nullable=True)
    asset_metadata = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
