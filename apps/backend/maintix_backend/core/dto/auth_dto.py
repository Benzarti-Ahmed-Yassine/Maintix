from pydantic import BaseModel, EmailStr

class LoginDTO(BaseModel):
    username: str
    password: str

class TokenDTO(BaseModel):
    access_token: str
    token_type: str = 'bearer'

class UserDTO(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
