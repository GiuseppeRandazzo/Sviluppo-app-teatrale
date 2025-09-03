from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import uuid
import shutil

from app.core.config import settings
from app.services.parser import ScriptParser
from app.services.tts import TextToSpeechService
from app.services.video import VideoGenerator
from app.models.script import Script, Character, Scene, ScriptMetadata

router = APIRouter()

@router.post("/upload-script")
async def upload_script(
    file: UploadFile = File(...),
    title: str = Form(None),
    author: str = Form(None),
    background_tasks: BackgroundTasks = None
):
    # Controllo estensione file
    allowed_extensions = [".txt", ".docx", ".pdf"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Formato file non supportato. Formati consentiti: {', '.join(allowed_extensions)}"
        )
    
    # Generazione ID progetto
    project_id = str(uuid.uuid4())
    
    # Creazione cartelle progetto
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    # Salvataggio file
    file_path = os.path.join(project_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Parsing del copione in background
    background_tasks.add_task(
        parse_script_task, 
        file_path=file_path, 
        file_ext=file_ext,
        project_id=project_id,
        metadata=ScriptMetadata(title=title or os.path.splitext(file.filename)[0], author=author or "Sconosciuto")
    )
    
    return {"project_id": project_id, "message": "Copione caricato con successo. Analisi in corso..."}

async def parse_script_task(file_path: str, file_ext: str, project_id: str, metadata: ScriptMetadata):
    """Task in background per il parsing del copione"""
    parser = ScriptParser()
    script = await parser.parse_file(file_path, file_ext, metadata)
    
    # Salvataggio della struttura JSON del copione
    script_json_path = os.path.join(settings.UPLOAD_DIR, project_id, "script.json")
    with open(script_json_path, "w", encoding="utf-8") as f:
        f.write(script.model_dump_json(indent=2))

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Ottiene i dettagli di un progetto"""
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    script_json_path = os.path.join(project_dir, "script.json")
    
    if not os.path.exists(script_json_path):
        raise HTTPException(status_code=404, detail="Progetto non trovato o analisi ancora in corso")
    
    with open(script_json_path, "r", encoding="utf-8") as f:
        script_data = f.read()
    
    return JSONResponse(content=script_data)

@router.post("/generate-audio/{project_id}")
async def generate_audio(
    project_id: str,
    character_voices: dict = None,
    background_tasks: BackgroundTasks = None
):
    """Genera l'audio per le battute dei personaggi"""
    # Implementazione della generazione audio
    # ...
    
    return {"message": "Generazione audio avviata"}

@router.post("/generate-video/{project_id}")
async def generate_video(
    project_id: str,
    style: str = "realistic",  # realistic, cartoon, theatrical
    background_tasks: BackgroundTasks = None
):
    """Genera il video dello spettacolo"""
    # Implementazione della generazione video
    # ...
    
    return {"message": "Generazione video avviata"}

@router.get("/status/{project_id}")
async def get_status(project_id: str):
    """Ottiene lo stato di avanzamento di un progetto"""
    # Implementazione del controllo stato
    # ...
    
    return {"status": "processing", "progress": 50}