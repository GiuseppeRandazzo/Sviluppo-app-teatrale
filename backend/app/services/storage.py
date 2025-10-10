import os
import shutil
import boto3
from typing import Dict, List, Optional
from datetime import datetime

from app.core.config import settings

class StorageService:
    """Servizio per la gestione dello storage dei file video e audio"""
    
    def __init__(self, provider: str = "local"):
        """Inizializza il servizio di storage"""
        self.provider = provider
        
        # Configurazione in base al provider
        if provider == "local":
            self.base_dir = settings.LOCAL_STORAGE_DIR
            os.makedirs(self.base_dir, exist_ok=True)
        elif provider == "s3":
            self.s3_bucket = settings.AWS_S3_BUCKET
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
        else:
            raise ValueError(f"Provider storage non supportato: {provider}")
    
    async def save_file(self, file_path: str, destination_path: str) -> str:
        """Salva un file nello storage e restituisce l'URL o il percorso"""
        try:
            if self.provider == "local":
                return await self._save_local(file_path, destination_path)
            elif self.provider == "s3":
                return await self._save_s3(file_path, destination_path)
            else:
                return ""
        except Exception as e:
            print(f"Errore nel salvataggio del file: {str(e)}")
            return ""
    
    async def get_file_url(self, file_path: str, expiration: int = 3600) -> str:
        """Ottiene l'URL per accedere al file"""
        try:
            if self.provider == "local":
                return os.path.join(settings.BASE_URL, "static", file_path)
            elif self.provider == "s3":
                return self._get_s3_url(file_path, expiration)
            else:
                return ""
        except Exception as e:
            print(f"Errore nell'ottenimento dell'URL: {str(e)}")
            return ""
    
    async def delete_file(self, file_path: str) -> bool:
        """Elimina un file dallo storage"""
        try:
            if self.provider == "local":
                return await self._delete_local(file_path)
            elif self.provider == "s3":
                return await self._delete_s3(file_path)
            else:
                return False
        except Exception as e:
            print(f"Errore nell'eliminazione del file: {str(e)}")
            return False
    
    async def _save_local(self, file_path: str, destination_path: str) -> str:
        """Salva un file nello storage locale"""
        try:
            # Percorso completo di destinazione
            full_dest_path = os.path.join(self.base_dir, destination_path)
            
            # Creazione directory se non esiste
            os.makedirs(os.path.dirname(full_dest_path), exist_ok=True)
            
            # Copia del file
            shutil.copy2(file_path, full_dest_path)
            
            return destination_path
        except Exception as e:
            print(f"Errore nel salvataggio locale: {str(e)}")
            return ""
    
    async def _save_s3(self, file_path: str, destination_path: str) -> str:
        """Carica un file su Amazon S3"""
        try:
            # Caricamento su S3
            self.s3_client.upload_file(
                file_path,
                self.s3_bucket,
                destination_path
            )
            
            return destination_path
        except Exception as e:
            print(f"Errore nel caricamento su S3: {str(e)}")
            return ""
    
    def _get_s3_url(self, file_path: str, expiration: int = 3600) -> str:
        """Genera un URL prefirmato per accedere al file su S3"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.s3_bucket,
                    'Key': file_path
                },
                ExpiresIn=expiration
            )
            
            return url
        except Exception as e:
            print(f"Errore nella generazione dell'URL S3: {str(e)}")
            return ""
    
    async def _delete_local(self, file_path: str) -> bool:
        """Elimina un file dallo storage locale"""
        try:
            # Percorso completo
            full_path = os.path.join(self.base_dir, file_path)
            
            # Verifica esistenza file
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            else:
                return False
        except Exception as e:
            print(f"Errore nell'eliminazione locale: {str(e)}")
            return False
    
    async def _delete_s3(self, file_path: str) -> bool:
        """Elimina un file da Amazon S3"""
        try:
            # Eliminazione da S3
            self.s3_client.delete_object(
                Bucket=self.s3_bucket,
                Key=file_path
            )
            
            return True
        except Exception as e:
            print(f"Errore nell'eliminazione da S3: {str(e)}")
            return False