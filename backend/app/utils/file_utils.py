import os
import shutil
from typing import List, Optional
from fastapi import UploadFile, HTTPException

from app.core.config import settings

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Verifica se l'estensione del file è tra quelle consentite"""
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions

async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Salva un file caricato nella destinazione specificata"""
    try:
        os.makedirs(os.path.dirname(destination), exist_ok=True)
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        return destination
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel salvataggio del file: {str(e)}")

def get_file_size(file_path: str) -> int:
    """Ottiene la dimensione di un file in bytes"""
    return os.path.getsize(file_path)

def check_file_size(file_path: str, max_size_bytes: int) -> bool:
    """Verifica se la dimensione del file è inferiore al limite massimo"""
    return get_file_size(file_path) <= max_size_bytes

def create_project_directories(project_id: str) -> dict:
    """Crea le directory necessarie per un nuovo progetto"""
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    audio_dir = os.path.join(settings.OUTPUT_DIR, project_id, "audio")
    video_dir = os.path.join(settings.OUTPUT_DIR, project_id, "video")
    
    os.makedirs(project_dir, exist_ok=True)
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(video_dir, exist_ok=True)
    
    return {
        "project_dir": project_dir,
        "audio_dir": audio_dir,
        "video_dir": video_dir
    }