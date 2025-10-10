import os
import requests
from typing import Dict, List, Optional
import json

from app.core.config import settings
from app.models.script import Script, Scene

class SceneryGenerator:
    """Servizio per la generazione di scenografie teatrali"""
    
    def __init__(self, provider: str = "stability"):
        """Inizializza il servizio di generazione scenografie"""
        self.provider = provider
        
        # Configurazione in base al provider
        if provider == "stability":
            self.api_key = settings.STABILITY_API_KEY
            self.api_url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        elif provider == "dalle":
            self.api_key = settings.OPENAI_API_KEY
            self.api_url = "https://api.openai.com/v1/images/generations"
        elif provider == "midjourney":
            # Configurazione per Midjourney (simulata)
            pass
        else:
            raise ValueError(f"Provider scenografie non supportato: {provider}")
    
    async def generate_scenery_for_scene(self, scene: Scene, output_dir: str) -> str:
        """Genera un'immagine di scenografia per una scena specifica"""
        try:
            # Creazione directory output se non esiste
            os.makedirs(output_dir, exist_ok=True)
            
            # Estrazione delle descrizioni di scena
            scene_descriptions = [d.text for d in scene.dialogues if d.type == "scene_description"]
            scene_description = " ".join(scene_descriptions) if scene_descriptions else "Una scena teatrale"
            
            # Generazione nome file
            scenery_filename = f"scenery_{scene.id}.png"
            scenery_path = os.path.join(output_dir, scenery_filename)
            
            # Generazione scenografia
            if self.provider == "stability":
                success = await self._generate_with_stability(scene_description, scenery_path)
            elif self.provider == "dalle":
                success = await self._generate_with_dalle(scene_description, scenery_path)
            elif self.provider == "midjourney":
                success = await self._generate_with_midjourney(scene_description, scenery_path)
            else:
                success = False
            
            if success:
                return scenery_filename
            else:
                return ""
                
        except Exception as e:
            print(f"Errore nella generazione scenografia: {str(e)}")
            return ""
    
    async def _generate_with_stability(self, description: str, output_path: str) -> bool:
        """Genera scenografia utilizzando Stability AI"""
        try:
            # Preparazione del prompt
            prompt = f"Scenografia teatrale: {description}. Stile realistico, illuminazione teatrale, alta qualità."
            
            # Parametri per la generazione
            params = {
                "text_prompts": [{"text": prompt}],
                "cfg_scale": 7,
                "height": 1024,
                "width": 1024,
                "samples": 1,
                "steps": 30
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # In un'implementazione reale, qui si chiamerebbe l'API di Stability
            # response = requests.post(self.api_url, json=params, headers=headers)
            
            # Simulazione della risposta
            print(f"Generazione scenografia con Stability AI: {description[:50]}...")
            
            # Creazione di un file immagine di esempio
            with open(output_path, "wb") as f:
                f.write(b"Placeholder per immagine generata")
            
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con Stability: {str(e)}")
            return False
    
    async def _generate_with_dalle(self, description: str, output_path: str) -> bool:
        """Genera scenografia utilizzando DALL-E"""
        try:
            # Preparazione del prompt
            prompt = f"Scenografia teatrale: {description}. Stile realistico, illuminazione teatrale, alta qualità."
            
            # Parametri per la generazione
            params = {
                "prompt": prompt,
                "n": 1,
                "size": "1024x1024",
                "response_format": "url"
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # In un'implementazione reale, qui si chiamerebbe l'API di OpenAI
            # response = requests.post(self.api_url, json=params, headers=headers)
            # image_url = response.json()["data"][0]["url"]
            # image_data = requests.get(image_url).content
            
            # Simulazione della risposta
            print(f"Generazione scenografia con DALL-E: {description[:50]}...")
            
            # Creazione di un file immagine di esempio
            with open(output_path, "wb") as f:
                f.write(b"Placeholder per immagine generata")
            
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con DALL-E: {str(e)}")
            return False
    
    async def _generate_with_midjourney(self, description: str, output_path: str) -> bool:
        """Genera scenografia utilizzando Midjourney (simulato)"""
        try:
            # Simulazione della generazione
            print(f"Generazione scenografia con Midjourney: {description[:50]}...")
            
            # Creazione di un file immagine di esempio
            with open(output_path, "wb") as f:
                f.write(b"Placeholder per immagine generata")
            
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con Midjourney: {str(e)}")
            return False