from pydantic import BaseModel, EmailStr

class LoginSchema(BaseModel):
    username: str
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = 'bearer'

class UserSchema(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
