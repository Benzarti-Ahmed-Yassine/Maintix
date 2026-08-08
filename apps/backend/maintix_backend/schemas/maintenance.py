from datetime import datetime
from pydantic import BaseModel


class MaintenanceOrderBaseSchema(BaseModel):
    asset_id: int
    title: str
    description: str | None = None
    status: str
    assigned_to: int | None = None
    scheduled_at: datetime | None = None


class MaintenanceOrderCreateSchema(MaintenanceOrderBaseSchema):
    pass


class MaintenanceOrderUpdateSchema(BaseModel):
    asset_id: int | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assigned_to: int | None = None
    scheduled_at: datetime | None = None


class MaintenanceOrderSchema(MaintenanceOrderBaseSchema):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        'from_attributes': True,
    }
