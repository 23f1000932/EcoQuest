from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # App
    DATABASE_URL: str = "sqlite+aiosqlite:///./ecoquest.db"
    SECRET_KEY: str = "change-me-to-a-random-32-char-string"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"
    MAX_DAILY_UPLOADS: int = 10
    AI_CONFIDENCE_THRESHOLD: int = 70
    ADMIN_EMAIL: str = "admin@ecoquest.in"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
