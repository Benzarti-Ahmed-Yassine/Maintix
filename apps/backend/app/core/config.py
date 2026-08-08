from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    PROJECT_NAME: str = "maintix-backend"
    DATABASE_URL: str = "sqlite:///./maintix.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_SECRET_KEY: str = "CHANGE_ME_USE_ENV"
    JWT_ALGORITHM: str = "HS256"
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883

    class Config:
        env_file = ".env"


settings = Settings()
