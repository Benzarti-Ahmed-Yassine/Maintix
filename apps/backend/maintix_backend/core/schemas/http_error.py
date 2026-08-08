from pydantic import BaseModel

class HTTPErrorSchema(BaseModel):
    detail: str
