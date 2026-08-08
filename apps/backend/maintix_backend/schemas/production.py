from datetime import datetime
from pydantic import BaseModel

class ProductionScheduleBaseSchema(BaseModel):
    name: str
    description: str | None = None
    status: str
    plan: str | None = None

class ProductionScheduleCreateSchema(ProductionScheduleBaseSchema):
    pass

class ProductionScheduleUpdateSchema(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    plan: str | None = None

class ProductionScheduleSchema(ProductionScheduleBaseSchema):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        'from_attributes': True,
    }
