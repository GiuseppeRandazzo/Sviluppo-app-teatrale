import os
import uuid
import subprocess
import logging
from typing import Dict, List, Optional
import requests
import json

from app.core.config import settings
from app.models.script import Script, Character, Scene, Dialogue

class VideoGenerator:
    """Servizio per la generazione di video da copioni teatrali"""
    
    def __init__(self, provider: str = "pika", style_id: str = "classic"):
        """Inizializza il servizio di generazione video con il provider specificato"""
        self.provider = provider
        self.style_id = style_id
        self.logger = logging.getLogger(__name__)
        
        # Importazione lazy dei servizi di stile
        try:
            from .styles import VideoStyleService
            self.style_service = VideoStyleService()
        except ImportError:
            self.logger.warning("Servizio stili video non disponibile")
            self.style_service = None
            
        # Configurazione in base al provider
        if provider == "pika":
            # Configurazione per Pika Labs
            pass
        elif provider == "runway":
            # Configurazione per Runway Gen-3
            pass
        elif provider == "kaiber":
            # Configurazione per Kaiber AI
            pass
        elif provider == "unreal":
            # Configurazione per Unreal Engine + Metahuman
            pass
        else:
            raise ValueError(f"Provider video non supportato: {provider}")
    
    def set_style(self, style_id: str):
        """Imposta lo stile video da utilizzare"""
        self.style_id = style_id
    
    async def generate_video_for_script(self, script: Script, audio_dir: str, output_dir: str, style_id: str = None) -> Script:
        """Genera video per tutte le scene nel copione"""
        # Usa lo stile specificato o quello predefinito
        if style_id:
            self.set_style(style_id)
            
        # Aggiornamento stato
        script.status = "video_generating"
        script.progress = 70  # 70% all'inizio della generazione video
        
        # Creazione directory output se non esiste
        os.makedirs(output_dir, exist_ok=True)
        
        # Mappa dei personaggi per ID
        character_map = {char.id: char for char in script.characters}
        
        # Contatori per il calcolo del progresso
        total_scenes = sum(len(act.scenes) for act in script.acts)
        processed_scenes = 0
        
        # Elaborazione di ogni atto e scena
        for act in script.acts:
            for scene in act.scenes:
                # Generazione nome file
                video_filename = f"{uuid.uuid4()}.mp4"
                video_path = os.path.join(output_dir, video_filename)
                
                # Generazione video per la scena
                success = await self._generate_scene_video(
                    scene=scene,
                    character_map=character_map,
                    audio_dir=audio_dir,
                    output_path=video_path
                )
                
                if success:
                    scene.video_file = video_filename
                
                # Aggiornamento progresso
                processed_scenes += 1
                progress_percentage = 70 + int((processed_scenes / total_scenes) * 20)  # Da 70% a 90%
                script.progress = min(progress_percentage, 90)
        
        # Composizione video finale
        final_video_path = os.path.join(output_dir, f"{script.id}_final.mp4")
        await self._compose_final_video(script, output_dir, final_video_path)
        
        # Genera storyboard se richiesto
        storyboard_info = None
        try:
            from .styles import StoryboardService
            storyboard_service = StoryboardService()
            storyboard_info = await storyboard_service.generate_storyboard(
                script, os.path.join(output_dir, "storyboards")
            )
        except ImportError:
            self.logger.warning("Servizio storyboard non disponibile")
        
        # Aggiornamento stato finale
        script.status = "completed"
        script.progress = 100  # 100% completato
        
        return script
    
    async def _generate_scene_video(self, scene: Scene, character_map: Dict, audio_dir: str, output_path: str) -> bool:
        """Genera un video per una singola scena"""
        try:
            if self.provider == "pika":
                return await self._generate_with_pika(scene, character_map, audio_dir, output_path)
            elif self.provider == "runway":
                return await self._generate_with_runway(scene, character_map, audio_dir, output_path)
            elif self.provider == "kaiber":
                return await self._generate_with_kaiber(scene, character_map, audio_dir, output_path)
            elif self.provider == "unreal":
                return await self._generate_with_unreal(scene, character_map, audio_dir, output_path)
            else:
                return False
        except Exception as e:
            print(f"Errore nella generazione video: {str(e)}")
            return False
    
    async def _generate_with_pika(self, scene: Scene, character_map: Dict, audio_dir: str, output_path: str) -> bool:
        """Genera video utilizzando Pika Labs API"""
        # Implementazione per Pika Labs
        # Questa è una simulazione, in un'implementazione reale si utilizzerebbe l'API di Pika Labs
        
        # Estrazione delle descrizioni di scena e didascalie
        scene_descriptions = [d.text for d in scene.dialogues if d.type == "scene_description"]
        scene_description = " ".join(scene_descriptions) if scene_descriptions else "Una scena teatrale"
        
        # In un'implementazione reale, qui si chiamerebbe l'API di Pika Labs
        # per generare il video in base alla descrizione della scena
        
        # Simulazione della generazione video
        print(f"Generazione video per la scena: {scene.title}")
        print(f"Descrizione: {scene_description}")
        
        # Creazione di un file video di esempio
        with open(output_path, "wb") as f:
            f.write(b"Placeholder per video generato")  # In un'implementazione reale, qui ci sarebbe il video generato
        
        return True
    
    async def _generate_with_runway(self, scene: Scene, character_map: Dict, audio_dir: str, output_path: str) -> bool:
        """Genera video utilizzando Runway Gen-3"""
        try:
            import requests
            
            # API Runway (simulata)
            api_url = "https://api.runwayml.com/v1/generate"
            api_key = settings.RUNWAY_API_KEY
            
            # Estrazione delle descrizioni di scena
            scene_descriptions = [d.text for d in scene.dialogues if d.type == "scene_description"]
            scene_description = " ".join(scene_descriptions) if scene_descriptions else "Una scena teatrale"
            
            # Preparazione dei personaggi presenti nella scena
            characters_in_scene = set()
            for dialogue in scene.dialogues:
                if dialogue.character_id and dialogue.character_id in character_map:
                    characters_in_scene.add(dialogue.character_id)
            
            characters_desc = []
            for char_id in characters_in_scene:
                char = character_map[char_id]
                characters_desc.append(f"{char.name}: {char.description}")
            
            # Prompt per la generazione
            prompt = f"""
            Scena teatrale: {scene.title}
            Ambientazione: {scene_description}
            Personaggi: {', '.join(characters_desc)}
            Stile: Realistico, teatrale, con buona illuminazione
            """
            
            # Parametri per la generazione video
            params = {
                "prompt": prompt,
                "negative_prompt": "bassa qualità, sfocato, distorto",
                "num_frames": 120,  # 4 secondi a 30fps
                "width": 1024,
                "height": 576,
                "guidance_scale": 7.5,
                "mode": "video"
            }
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            # In un'implementazione reale, qui si chiamerebbe l'API di Runway
            # response = requests.post(api_url, json=params, headers=headers)
            
            # Simulazione della risposta
            print(f"Generazione video Runway per la scena: {scene.title}")
            
            # Creazione di un file video di esempio
            with open(output_path, "wb") as f:
                f.write(b"Placeholder per video generato con Runway")
            
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con Runway: {str(e)}")
            return False
    
    async def _generate_with_kaiber(self, scene: Scene, character_map: Dict, audio_dir: str, output_path: str) -> bool:
        """Genera video utilizzando Kaiber AI"""
        try:
            # Estrazione delle descrizioni di scena
            scene_descriptions = [d.text for d in scene.dialogues if d.type == "scene_description"]
            scene_description = " ".join(scene_descriptions) if scene_descriptions else "Una scena teatrale"
            
            # Simulazione della generazione video con Kaiber
            print(f"Generazione video Kaiber per la scena: {scene.title}")
            print(f"Descrizione: {scene_description}")
            
            # Creazione di un file video di esempio
            with open(output_path, "wb") as f:
                f.write(b"Placeholder per video generato con Kaiber AI")
            
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con Kaiber: {str(e)}")
            return False
    
    async def _generate_with_unreal(self, scene: Scene, character_map: Dict, audio_dir: str, output_path: str) -> bool:
        """Genera video utilizzando Unreal Engine + Metahuman"""
        try:
            # Estrazione dei dialoghi e audio per la scena
            dialogues = [d for d in scene.dialogues if d.type == "dialogue" and d.character_id]
            
            # Creazione di un file di configurazione per Unreal Engine
            scene_config = {
                "title": scene.title,
                "characters": {},
                "dialogues": []
            }
            
            # Configurazione dei personaggi
            for dialogue in dialogues:
                if dialogue.character_id in character_map and dialogue.character_id not in scene_config["characters"]:
                    char = character_map[dialogue.character_id]
                    scene_config["characters"][dialogue.character_id] = {
                        "name": char.name,
                        "description": char.description,
                        "metahuman_preset": self._get_metahuman_preset(char)
                    }
            
            # Configurazione dei dialoghi
            for dialogue in dialogues:
                if dialogue.audio_file and dialogue.character_id in scene_config["characters"]:
                    audio_path = os.path.join(audio_dir, dialogue.audio_file)
                    scene_config["dialogues"].append({
                        "character_id": dialogue.character_id,
                        "text": dialogue.text,
                        "audio_file": audio_path
                    })
            
            # Salvataggio della configurazione
            config_path = f"{output_path}.json"
            with open(config_path, "w") as f:
                json.dump(scene_config, f, indent=2)
            
            # In un'implementazione reale, qui si chiamerebbe Unreal Engine
            # tramite un'API o un processo esterno
            
            # Simulazione della generazione
            print(f"Generazione video Unreal Engine per la scena: {scene.title}")
            
            # Creazione di un file video di esempio
            with open(output_path, "wb") as f:
                f.write(b"Placeholder per video generato con Unreal Engine")
            
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con Unreal Engine: {str(e)}")
            return False
            
    def _get_metahuman_preset(self, character: Character) -> str:
        """Seleziona un preset Metahuman in base alla descrizione del personaggio"""
        description = character.description.lower()
        
        if "giovane" in description and "donna" in description:
            return "F_Young_001"
        elif "giovane" in description and ("uomo" in description or "maschio" in description):
            return "M_Young_001"
        elif "anziana" in description or ("anziano" in description and "donna" in description):
            return "F_Old_001"
        elif "anziano" in description:
            return "M_Old_001"
        elif "donna" in description or "femmina" in description:
            return "F_Adult_001"
        else:
            return "M_Adult_001"
    
    async def _compose_final_video(self, script: Script, scenes_dir: str, output_path: str) -> bool:
        """Compone il video finale unendo tutte le scene"""
        try:
            # Creazione di un file di input per FFmpeg
            input_file = os.path.join(scenes_dir, "input.txt")
            with open(input_file, "w") as f:
                for act in script.acts:
                    for scene in act.scenes:
                        if scene.video_file:
                            scene_path = os.path.join(scenes_dir, scene.video_file)
                            f.write(f"file '{scene_path}'\n")
            
            # Comando FFmpeg base per concatenare i video
            cmd = [
                "ffmpeg",
                "-f", "concat",
                "-safe", "0",
                "-i", input_file
            ]
            
            # Applica stile video se disponibile
            if hasattr(self, 'style_service') and self.style_service:
                try:
                    cmd = self.style_service.apply_style_to_ffmpeg_command(cmd, self.style_id)
                    self.logger.info(f"Applicato stile video: {self.style_id}")
                except Exception as e:
                    self.logger.warning(f"Errore nell'applicazione dello stile: {str(e)}")
            
            # Aggiungi opzioni di output se non modificate dallo stile
            if "-c" not in cmd:
                cmd.extend(["-c", "copy"])
                
            # Aggiungi file di output
            cmd.append(output_path)
            
            # Esecuzione del comando
            subprocess.run(cmd, check=True)
            
            # Rimuovi file temporaneo
            os.remove(input_file)
            
            return True
        except Exception as e:
            self.logger.error(f"Errore nella composizione del video finale: {str(e)}")
            return False