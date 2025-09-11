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
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    script_json_path = os.path.join(project_dir, "script.json")
    
    if not os.path.exists(script_json_path):
        raise HTTPException(status_code=404, detail="Progetto non trovato o analisi ancora in corso")
    
    # Caricamento dello script
    with open(script_json_path, "r", encoding="utf-8") as f:
        script_data = f.read()
    
    script = Script.model_validate_json(script_data)
    
    # Aggiornamento delle voci dei personaggi se specificate
    if character_voices:
        for char in script.characters:
            if char.id in character_voices:
                char.voice_settings = character_voices[char.id]
    
    # Creazione directory per gli audio
    audio_dir = os.path.join(project_dir, "audio")
    os.makedirs(audio_dir, exist_ok=True)
    
    # Avvio generazione audio in background
    background_tasks.add_task(
        generate_audio_task,
        script=script,
        project_id=project_id,
        audio_dir=audio_dir
    )
    
    return {"message": "Generazione audio avviata", "project_id": project_id}

@router.post("/generate-video/{project_id}")
async def generate_video(
    project_id: str,
    style: str = "realistic",  # realistic, cartoon, theatrical
    background_tasks: BackgroundTasks = None
):
    """Genera il video dello spettacolo"""
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    script_json_path = os.path.join(project_dir, "script.json")
    
    if not os.path.exists(script_json_path):
        raise HTTPException(status_code=404, detail="Progetto non trovato o analisi ancora in corso")
    
    # Caricamento dello script
    with open(script_json_path, "r", encoding="utf-8") as f:
        script_data = f.read()
    
    script = Script.model_validate_json(script_data)
    
    # Verifica che l'audio sia stato generato
    audio_dir = os.path.join(project_dir, "audio")
    if not os.path.exists(audio_dir) or not os.listdir(audio_dir):
        raise HTTPException(status_code=400, detail="Generazione audio non completata. Eseguire prima la generazione audio.")
    
    # Creazione directory per i video
    video_dir = os.path.join(project_dir, "video")
    os.makedirs(video_dir, exist_ok=True)
    
    # Avvio generazione video in background
    background_tasks.add_task(
        generate_video_task,
        script=script,
        project_id=project_id,
        audio_dir=audio_dir,
        video_dir=video_dir,
        style=style
    )
    
    return {"message": "Generazione video avviata", "project_id": project_id}

@router.get("/status/{project_id}")
async def get_status(project_id: str):
    """Ottiene lo stato di avanzamento di un progetto"""
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    script_json_path = os.path.join(project_dir, "script.json")
    
    if not os.path.exists(script_json_path):
        raise HTTPException(status_code=404, detail="Progetto non trovato")
    
    # Lettura dello stato dal file JSON
    with open(script_json_path, "r", encoding="utf-8") as f:
        script_data = json.load(f)
    
    return {
        "status": script_data.get("status", "unknown"),
        "progress": script_data.get("progress", 0),
        "error_message": script_data.get("error_message", None)
    }

async def generate_audio_task(script: Script, project_id: str, audio_dir: str):
    """Task in background per la generazione dell'audio"""
    try:
        # Inizializzazione del servizio TTS
        tts_service = TextToSpeechService()
        
        # Generazione audio
        updated_script = await tts_service.generate_audio_for_script(script, audio_dir)
        
        # Salvataggio dello script aggiornato
        script_json_path = os.path.join(settings.UPLOAD_DIR, project_id, "script.json")
        with open(script_json_path, "w", encoding="utf-8") as f:
            f.write(updated_script.model_dump_json(indent=2))
    except Exception as e:
        # In caso di errore, aggiorna lo stato dello script
        script.status = "error"
        script.error_message = str(e)
        script_json_path = os.path.join(settings.UPLOAD_DIR, project_id, "script.json")
        with open(script_json_path, "w", encoding="utf-8") as f:
            f.write(script.model_dump_json(indent=2))

async def generate_video_task(script: Script, project_id: str, audio_dir: str, video_dir: str, style: str):
    """Task in background per la generazione del video"""
    try:
        # Inizializzazione del servizio di generazione video
        video_generator = VideoGenerator()
        
        # Generazione video
        updated_script = await video_generator.generate_video_for_script(script, audio_dir, video_dir)
        
        # Salvataggio dello script aggiornato
        script_json_path = os.path.join(settings.UPLOAD_DIR, project_id, "script.json")
        with open(script_json_path, "w", encoding="utf-8") as f:
            f.write(updated_script.model_dump_json(indent=2))
    except Exception as e:
        # In caso di errore, aggiorna lo stato dello script
        script.status = "error"
        script.error_message = str(e)
        script_json_path = os.path.join(settings.UPLOAD_DIR, project_id, "script.json")
        with open(script_json_path, "w", encoding="utf-8") as f:
            f.write(script.model_dump_json(indent=2))

@router.get("/projects")
async def list_projects():
    """Ottiene la lista di tutti i progetti"""
    projects = []
    
    # Scansione della directory dei progetti
    for project_id in os.listdir(settings.UPLOAD_DIR):
        project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
        script_json_path = os.path.join(project_dir, "script.json")
        
        if os.path.isdir(project_dir) and os.path.exists(script_json_path):
            # Lettura dei metadati del progetto
            with open(script_json_path, "r", encoding="utf-8") as f:
                script_data = json.load(f)
            
            # Estrazione delle informazioni principali
            projects.append({
                "id": project_id,
                "title": script_data.get("metadata", {}).get("title", "Progetto senza titolo"),
                "author": script_data.get("metadata", {}).get("author", "Sconosciuto"),
                "status": script_data.get("status", "unknown"),
                "progress": script_data.get("progress", 0),
                "created_at": script_data.get("metadata", {}).get("created_at", ""),
                "updated_at": script_data.get("metadata", {}).get("updated_at", "")
            })
    
    return {"projects": projects}

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Elimina un progetto"""
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    
    if not os.path.exists(project_dir):
        raise HTTPException(status_code=404, detail="Progetto non trovato")
    
    # Eliminazione ricorsiva della directory del progetto
    shutil.rmtree(project_dir)
    
    return {"message": "Progetto eliminato con successo"}

@router.get("/download/{project_id}")
async def download_video(project_id: str):
    """Ottiene l'URL per il download del video finale"""
    project_dir = os.path.join(settings.UPLOAD_DIR, project_id)
    video_dir = os.path.join(project_dir, "video")
    final_video_path = os.path.join(video_dir, f"{project_id}_final.mp4")
    
    if not os.path.exists(final_video_path):
        raise HTTPException(status_code=404, detail="Video finale non trovato. La generazione potrebbe essere ancora in corso.")
    
    # Creazione URL relativo per il download
    download_url = f"/uploads/{project_id}/video/{project_id}_final.mp4"
    
    return {"download_url": download_url}