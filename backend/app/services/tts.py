import os
import uuid
from typing import Dict, List, Optional
import requests
import json

from app.core.config import settings
from app.models.script import Script, Character, Dialogue

class TextToSpeechService:
    """Servizio per la generazione di audio da testo (TTS)"""
    
    def __init__(self, provider: str = "elevenlabs"):
        """Inizializza il servizio TTS con il provider specificato"""
        self.provider = provider
        
        # Configurazione in base al provider
        if provider == "elevenlabs":
            self.api_key = settings.ELEVENLABS_API_KEY
            self.base_url = "https://api.elevenlabs.io/v1"
        elif provider == "azure":
            self.api_key = settings.AZURE_SPEECH_KEY
            self.region = settings.AZURE_SPEECH_REGION
        elif provider == "google":
            self.credentials_path = settings.GOOGLE_APPLICATION_CREDENTIALS
        else:
            raise ValueError(f"Provider TTS non supportato: {provider}")
    
    async def generate_audio_for_script(self, script: Script, output_dir: str) -> Script:
        """Genera audio per tutte le battute nel copione"""
        # Aggiornamento stato
        script.status = "audio_generating"
        script.progress = 30  # 30% all'inizio della generazione audio
        
        # Creazione directory output se non esiste
        os.makedirs(output_dir, exist_ok=True)
        
        # Mappa dei personaggi per ID
        character_map = {char.id: char for char in script.characters}
        
        # Contatori per il calcolo del progresso
        total_dialogues = sum(len(scene.dialogues) for act in script.acts for scene in act.scenes)
        processed_dialogues = 0
        
        # Elaborazione di ogni atto e scena
        for act in script.acts:
            for scene in act.scenes:
                for dialogue in scene.dialogues:
                    # Genera audio solo per le battute dei personaggi
                    if dialogue.type == "speech" and dialogue.character_id:
                        character = character_map.get(dialogue.character_id)
                        if character:
                            # Generazione nome file
                            audio_filename = f"{uuid.uuid4()}.mp3"
                            audio_path = os.path.join(output_dir, audio_filename)
                            
                            # Generazione audio
                            success = await self._generate_audio(
                                text=dialogue.text,
                                output_path=audio_path,
                                voice_settings=character.voice_settings
                            )
                            
                            if success:
                                dialogue.audio_file = audio_filename
                    
                    # Aggiornamento progresso
                    processed_dialogues += 1
                    progress_percentage = 30 + int((processed_dialogues / total_dialogues) * 40)  # Da 30% a 70%
                    script.progress = min(progress_percentage, 70)
        
        # Aggiornamento stato finale
        script.status = "audio_done"
        script.progress = 70  # 70% completato dopo la generazione audio
        
        return script
    
    async def _generate_audio(self, text: str, output_path: str, voice_settings: Dict) -> bool:
        """Genera un file audio da testo utilizzando il provider configurato"""
        try:
            if self.provider == "elevenlabs":
                return await self._generate_with_elevenlabs(text, output_path, voice_settings)
            elif self.provider == "azure":
                return await self._generate_with_azure(text, output_path, voice_settings)
            elif self.provider == "google":
                return await self._generate_with_google(text, output_path, voice_settings)
            else:
                return False
        except Exception as e:
            print(f"Errore nella generazione audio: {str(e)}")
            return False
    
    async def _generate_with_elevenlabs(self, text: str, output_path: str, voice_settings: Dict) -> bool:
        """Genera audio utilizzando ElevenLabs API"""
        # Implementazione di esempio per ElevenLabs
        try:
            # Selezione della voce in base alle impostazioni
            voice_id = voice_settings.get("voice_id", "21m00Tcm4TlvDq8ikWAM")  # Default voice
            
            # Parametri di generazione
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": voice_settings.get("stability", 0.5),
                    "similarity_boost": voice_settings.get("similarity_boost", 0.75)
                }
            }
            
            # Chiamata API
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                # Salvataggio file audio
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                return True
            else:
                print(f"Errore ElevenLabs API: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Errore nella generazione con ElevenLabs: {str(e)}")
            return False
    
    async def _generate_with_azure(self, text: str, output_path: str, voice_settings: Dict) -> bool:
        """Genera audio utilizzando Azure Cognitive Services"""
        try:
            import azure.cognitiveservices.speech as speechsdk
            
            # Configurazione del servizio
            speech_config = speechsdk.SpeechConfig(subscription=self.api_key, region=self.region)
            
            # Impostazione della voce in base alle preferenze
            voice_name = voice_settings.get("voice_name", "it-IT-ElsaNeural")  # Default voce italiana
            speech_config.speech_synthesis_voice_name = voice_name
            
            # Configurazione dell'output audio
            audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
            
            # Creazione del sintetizzatore
            speech_synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config, 
                audio_config=audio_config
            )
            
            # Generazione SSML per controllo avanzato
            ssml = f"""
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="it-IT">
                <voice name="{voice_name}">
                    <prosody rate="{voice_settings.get('rate', '0%')}" 
                             pitch="{voice_settings.get('pitch', '0%')}" 
                             volume="{voice_settings.get('volume', '+0%')}">
                        {text}
                    </prosody>
                </voice>
            </speak>
            """
            
            # Sintesi vocale
            result = speech_synthesizer.speak_ssml_async(ssml).get()
            
            # Verifica del risultato
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return True
            else:
                print(f"Errore nella sintesi: {result.reason}")
                return False
                
        except Exception as e:
            print(f"Errore nella generazione con Azure: {str(e)}")
            return False
    
    async def _generate_with_google(self, text: str, output_path: str, voice_settings: Dict) -> bool:
        """Genera audio utilizzando Google Cloud Text-to-Speech"""
        try:
            from google.cloud import texttospeech
            
            # Inizializzazione del client
            client = texttospeech.TextToSpeechClient()
            
            # Configurazione dell'input
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configurazione della voce
            voice_name = voice_settings.get("voice_name", "it-IT-Wavenet-A")
            language_code = voice_name.split("-")[0] + "-" + voice_name.split("-")[1]
            
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name,
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
            )
            
            # Configurazione dell'audio
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=voice_settings.get("speaking_rate", 1.0),
                pitch=voice_settings.get("pitch", 0.0),
                volume_gain_db=voice_settings.get("volume_gain_db", 0.0)
            )
            
            # Richiesta di sintesi
            response = client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            
            # Salvataggio del file audio
            with open(output_path, "wb") as out:
                out.write(response.audio_content)
                
            return True
            
        except Exception as e:
            print(f"Errore nella generazione con Google: {str(e)}")
            return False