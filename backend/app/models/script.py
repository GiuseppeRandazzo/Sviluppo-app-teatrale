from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum
import datetime

class DialogueType(str, Enum):
    SPEECH = "speech"  # Battuta normale
    DIRECTION = "direction"  # Didascalia
    SCENE_DESCRIPTION = "scene_description"  # Descrizione scena

class Dialogue(BaseModel):
    character_id: Optional[str] = None  # None per didascalie
    text: str
    type: DialogueType
    audio_file: Optional[str] = None  # Percorso file audio generato

class Character(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    voice_settings: Optional[Dict] = None  # Impostazioni voce (tono, età, accento)
    avatar_settings: Optional[Dict] = None  # Impostazioni avatar
    dialogues_count: int = 0  # Numero di battute nel copione

class Scene(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    dialogues: List[Dialogue] = []
    setting: Optional[str] = None  # Ambientazione
    background_music: Optional[str] = None
    video_file: Optional[str] = None  # Percorso file video generato

class Act(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    scenes: List[Scene] = []

class ScriptMetadata(BaseModel):
    title: str
    author: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    notes: Optional[str] = None

class Script(BaseModel):
    id: str
    metadata: ScriptMetadata
    characters: List[Character] = []
    acts: List[Act] = []
    status: str = "parsing"  # parsing, parsed, audio_generating, audio_done, video_generating, completed
    progress: int = 0  # Percentuale di completamento