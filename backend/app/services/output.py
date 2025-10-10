import os
import subprocess
from typing import Dict, List, Optional
import json

from app.core.config import settings
from app.models.script import Script
from app.services.storage import StorageService

class VideoOutputService:
    """Servizio per la gestione dell'output video finale"""
    
    def __init__(self):
        """Inizializza il servizio di output video"""
        self.storage = StorageService(provider=settings.STORAGE_PROVIDER)
        self.output_dir = settings.VIDEO_OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def process_final_video(self, script: Script, video_path: str) -> Dict:
        """Processa il video finale, lo salva nello storage e restituisce i metadati"""
        try:
            # Generazione nome file
            timestamp = script.updated_at.strftime("%Y%m%d_%H%M%S")
            output_filename = f"{script.id}_{timestamp}_final.mp4"
            output_path = os.path.join(self.output_dir, output_filename)
            
            # Ottimizzazione video (compressione, aggiunta metadati)
            success = await self._optimize_video(video_path, output_path, script)
            
            if not success:
                return {"success": False, "message": "Errore nell'ottimizzazione del video"}
            
            # Salvataggio nello storage
            storage_path = f"videos/{script.user_id}/{output_filename}"
            saved_path = await self.storage.save_file(output_path, storage_path)
            
            if not saved_path:
                return {"success": False, "message": "Errore nel salvataggio del video"}
            
            # Generazione URL
            video_url = await self.storage.get_file_url(saved_path)
            
            # Creazione metadati
            metadata = {
                "success": True,
                "script_id": script.id,
                "filename": output_filename,
                "storage_path": saved_path,
                "url": video_url,
                "duration": await self._get_video_duration(output_path),
                "size": os.path.getsize(output_path),
                "format": "mp4"
            }
            
            return metadata
            
        except Exception as e:
            print(f"Errore nel processamento del video finale: {str(e)}")
            return {"success": False, "message": str(e)}
    
    async def _optimize_video(self, input_path: str, output_path: str, script: Script) -> bool:
        """Ottimizza il video finale con FFmpeg"""
        try:
            # Metadati per il video
            metadata = {
                "title": script.title,
                "author": script.author,
                "comment": f"Generato automaticamente da {settings.APP_NAME}"
            }
            
            # Comando FFmpeg per ottimizzazione
            cmd = [
                "ffmpeg",
                "-i", input_path,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart"
            ]
            
            # Aggiunta metadati
            for key, value in metadata.items():
                cmd.extend(["-metadata", f"{key}={value}"])
            
            # Output finale
            cmd.append(output_path)
            
            # Esecuzione comando
            subprocess.run(cmd, check=True)
            
            return True
            
        except Exception as e:
            print(f"Errore nell'ottimizzazione del video: {str(e)}")
            return False
    
    async def _get_video_duration(self, video_path: str) -> float:
        """Ottiene la durata del video in secondi"""
        try:
            # Comando FFprobe per ottenere la durata
            cmd = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "json",
                video_path
            ]
            
            # Esecuzione comando
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Parsing del risultato
            data = json.loads(result.stdout)
            duration = float(data["format"]["duration"])
            
            return duration
            
        except Exception as e:
            print(f"Errore nell'ottenimento della durata: {str(e)}")
            return 0.0