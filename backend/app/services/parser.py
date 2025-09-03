import os
import re
import uuid
from typing import List, Dict, Tuple, Optional
import docx
from PyPDF2 import PdfReader

from app.models.script import (
    Script, 
    ScriptMetadata, 
    Character, 
    Act, 
    Scene, 
    Dialogue, 
    DialogueType
)

class ScriptParser:
    """Parser per analizzare copioni teatrali in diversi formati"""
    
    async def parse_file(self, file_path: str, file_ext: str, metadata: ScriptMetadata) -> Script:
        """Analizza un file di copione e restituisce una struttura Script"""
        # Estrazione del testo in base al formato
        if file_ext.lower() == ".txt":
            text = await self._extract_text_from_txt(file_path)
        elif file_ext.lower() == ".docx":
            text = await self._extract_text_from_docx(file_path)
        elif file_ext.lower() == ".pdf":
            text = await self._extract_text_from_pdf(file_path)
        else:
            raise ValueError(f"Formato file non supportato: {file_ext}")
        
        # Creazione struttura script
        script_id = str(uuid.uuid4())
        script = Script(id=script_id, metadata=metadata)
        
        # Analisi del testo e popolamento della struttura
        await self._analyze_script(text, script)
        
        # Aggiornamento stato
        script.status = "parsed"
        script.progress = 20  # 20% completato dopo il parsing
        
        return script
    
    async def _extract_text_from_txt(self, file_path: str) -> str:
        """Estrae il testo da un file .txt"""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    async def _extract_text_from_docx(self, file_path: str) -> str:
        """Estrae il testo da un file .docx"""
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    
    async def _extract_text_from_pdf(self, file_path: str) -> str:
        """Estrae il testo da un file .pdf"""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    async def _analyze_script(self, text: str, script: Script):
        """Analizza il testo del copione e popola la struttura Script"""
        # Identificazione dei personaggi
        characters = await self._identify_characters(text)
        script.characters = characters
        
        # Suddivisione in atti e scene
        acts = await self._identify_acts_and_scenes(text, characters)
        script.acts = acts
    
    async def _identify_characters(self, text: str) -> List[Character]:
        """Identifica i personaggi nel copione"""
        # Pattern per identificare i personaggi (nomi in maiuscolo seguiti da :)
        character_pattern = re.compile(r'\b([A-Z][A-Z\s]+)\s*:')
        matches = character_pattern.findall(text)
        
        # Rimozione duplicati e creazione personaggi
        character_names = list(set([name.strip() for name in matches]))
        characters = []
        
        for name in character_names:
            # Ignora parole comuni che potrebbero essere erroneamente identificate come personaggi
            if name in ["ATTO", "SCENA", "FINE", "NOTA"]:
                continue
                
            character_id = str(uuid.uuid4())
            characters.append(
                Character(
                    id=character_id,
                    name=name,
                    description="",  # Da completare con analisi più avanzata
                    voice_settings={"gender": "unknown", "age": "adult", "accent": "neutral"},
                    avatar_settings={"style": "realistic"}
                )
            )
        
        return characters
    
    async def _identify_acts_and_scenes(self, text: str, characters: List[Character]) -> List[Act]:
        """Identifica atti e scene nel copione"""
        # Pattern per identificare atti e scene
        act_pattern = re.compile(r'\b(ATTO|ACT)\s+([IVX]+|\d+)', re.IGNORECASE)
        scene_pattern = re.compile(r'\b(SCENA|SCENE)\s+([IVX]+|\d+)', re.IGNORECASE)
        
        # Suddivisione del testo in linee
        lines = text.split('\n')
        
        acts = []
        current_act = None
        current_scene = None
        
        # Mappa dei personaggi per nome
        character_map = {char.name: char for char in characters}
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Controllo se è un nuovo atto
            act_match = act_pattern.search(line)
            if act_match:
                act_id = str(uuid.uuid4())
                current_act = Act(id=act_id, title=line, scenes=[])
                acts.append(current_act)
                continue
            
            # Controllo se è una nuova scena
            scene_match = scene_pattern.search(line)
            if scene_match and current_act is not None:
                scene_id = str(uuid.uuid4())
                current_scene = Scene(id=scene_id, title=line, dialogues=[])
                current_act.scenes.append(current_scene)
                continue
            
            # Se non abbiamo ancora un atto o una scena, creiamoli di default
            if current_act is None:
                act_id = str(uuid.uuid4())
                current_act = Act(id=act_id, title="Atto I", scenes=[])
                acts.append(current_act)
            
            if current_scene is None and current_act is not None:
                scene_id = str(uuid.uuid4())
                current_scene = Scene(id=scene_id, title="Scena 1", dialogues=[])
                current_act.scenes.append(current_scene)
            
            # Analisi delle battute e didascalie
            if current_scene is not None and line:
                # Controllo se è una battuta di un personaggio
                dialogue_match = re.match(r'([A-Z][A-Z\s]+)\s*:\s*(.+)', line)
                
                if dialogue_match:
                    character_name = dialogue_match.group(1).strip()
                    dialogue_text = dialogue_match.group(2).strip()
                    
                    # Trova il personaggio corrispondente
                    character_id = None
                    if character_name in character_map:
                        character_id = character_map[character_name].id
                    
                    # Aggiungi la battuta
                    current_scene.dialogues.append(
                        Dialogue(
                            character_id=character_id,
                            text=dialogue_text,
                            type=DialogueType.SPEECH
                        )
                    )
                
                # Controllo se è una didascalia (testo tra parentesi)
                elif re.match(r'\(.*\)', line):
                    current_scene.dialogues.append(
                        Dialogue(
                            character_id=None,
                            text=line,
                            type=DialogueType.DIRECTION
                        )
                    )
                
                # Altrimenti potrebbe essere una descrizione di scena
                elif line and not line.isupper() and len(line) > 10:
                    current_scene.dialogues.append(
                        Dialogue(
                            character_id=None,
                            text=line,
                            type=DialogueType.SCENE_DESCRIPTION
                        )
                    )
        
        return acts