import os
import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Spark Radar"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "spark-radar-dev-super-secure-key-2026-forest-green-193D33")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # SQLite default, PostgreSQL ready
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spark_radar.db")
    
    # Storage directory for document uploads
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    
    # Google OAuth (Project: spark-radar-513115)
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    # Frontend URL for production deployment
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://spark-radar-saas.vercel.app")

    # Production CORS settings: allow deployed Vercel frontend without permitting arbitrary origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://spark-radar-saas.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        default_origins = [
            "https://spark-radar-saas.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ]
        
        # Check if FRONTEND_URL is set in environment
        frontend_env = os.getenv("FRONTEND_URL")
        if frontend_env and frontend_env.strip():
            clean_fe = frontend_env.strip().rstrip("/")
            if clean_fe not in default_origins:
                default_origins.append(clean_fe)

        origins: List[str] = []
        if isinstance(v, str):
            v_clean = v.strip()
            if v_clean.startswith("[") and v_clean.endswith("]"):
                try:
                    parsed = json.loads(v_clean)
                    origins = [str(i).strip().rstrip("/") for i in parsed if str(i).strip()]
                except Exception:
                    origins = [i.strip().rstrip("/") for i in v_clean.strip("[]").split(",") if i.strip()]
            else:
                origins = [i.strip().rstrip("/") for i in v_clean.split(",") if i.strip()]
        elif isinstance(v, list):
            origins = [str(i).strip().rstrip("/") for i in v if str(i).strip()]
        else:
            origins = default_origins

        # Always include default and configured production URLs
        for origin in default_origins:
            clean_default = origin.rstrip("/")
            if clean_default not in origins:
                origins.append(clean_default)

        # Disallow wildcard '*' to enforce strict CORS with allow_credentials=True
        return [o for o in origins if o != "*"]

settings = Settings()
