import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Teatro AI"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Directories
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "output"
    
    # API Keys (da impostare tramite variabili d'ambiente)
    ELEVENLABS_API_KEY: Optional[str] = None
    AZURE_SPEECH_KEY: Optional[str] = None
    AZURE_SPEECH_REGION: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    
    # Limiti
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()