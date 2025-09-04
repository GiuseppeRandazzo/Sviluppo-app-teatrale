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
        # Estrazione di titolo e autore se non specificati
        if not script.metadata.title or script.metadata.title == "Copione senza titolo":
            title, author = self._extract_title_and_author(text)
            if title:
                script.metadata.title = title
            if author and not script.metadata.author:
                script.metadata.author = author
        
        # Identificazione dei personaggi
        characters = await self._identify_characters(text)
        script.characters = characters
        
        # Suddivisione in atti e scene
        acts = await self._identify_acts_and_scenes(text, characters)
        script.acts = acts
    
    def _extract_title_and_author(self, text: str) -> Tuple[Optional[str], Optional[str]]:
        """Estrae titolo e autore dal testo del copione"""
        title = None
        author = None
        
        # Cerca nelle prime 20 righe
        lines = text.split('\n')[:20]
        
        # Pattern per il titolo (testo in maiuscolo o tra virgolette)
        title_patterns = [
            re.compile(r'^\s*"([^"]+)"\s*$'),  # Testo tra virgolette
            re.compile(r'^\s*([A-Z][A-Z\s]+)\s*$'),  # Testo tutto maiuscolo
            re.compile(r'(?:TITOLO|TITLE)\s*:\s*(.+)', re.IGNORECASE)  # Titolo esplicito
        ]
        
        # Pattern per l'autore
        author_patterns = [
            re.compile(r'(?:di|by|autore|author)\s*:\s*(.+)', re.IGNORECASE),
            re.compile(r'(?:scritto da|written by)\s+(.+)', re.IGNORECASE)
        ]
        
        # Cerca il titolo
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Controlla i pattern del titolo
            for pattern in title_patterns:
                match = pattern.search(line)
                if match and len(match.group(1).strip()) > 3:  # Titolo di almeno 4 caratteri
                    title = match.group(1).strip()
                    break
            
            # Se abbiamo trovato un titolo, interrompi
            if title:
                break
        
        # Cerca l'autore
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Controlla i pattern dell'autore
            for pattern in author_patterns:
                match = pattern.search(line)
                if match:
                    author = match.group(1).strip()
                    break
            
            # Se abbiamo trovato un autore, interrompi
            if author:
                break
        
        return title, author
    
    async def _identify_characters(self, text: str) -> List[Character]:
        """Identifica i personaggi nel copione"""
        # Pattern per identificare i personaggi (nomi in maiuscolo seguiti da :)
        character_pattern = re.compile(r'\b([A-Z][A-Z\s]+)\s*:')
        matches = character_pattern.findall(text)
        
        # Rimozione duplicati e creazione personaggi
        character_names = list(set([name.strip() for name in matches]))
        characters = []
        
        # Conteggio battute per personaggio
        dialogue_counts = {}
        for name in character_names:
            # Conta le occorrenze di "NOME:" nel testo
            pattern = re.compile(f"\\b{re.escape(name)}\\s*:")
            dialogue_counts[name] = len(pattern.findall(text))
        
        # Parole da ignorare che potrebbero essere erroneamente identificate come personaggi
        ignore_words = ["ATTO", "SCENA", "FINE", "NOTA", "SIPARIO", "INTERMEZZO", "PROLOGO", "EPILOGO"]
        
        for name in character_names:
            # Ignora parole comuni che potrebbero essere erroneamente identificate come personaggi
            if name in ignore_words or dialogue_counts[name] < 2:  # Ignora se appare solo una volta
                continue
            
            # Determina il genere in base al nome (euristica semplice)
            gender = "unknown"
            if name.endswith("A") or name.endswith("ESSA") or name.endswith("RICE"):
                gender = "female"
            elif name.endswith("O") or name.endswith("E") or name.endswith("ORE"):
                gender = "male"
                
            character_id = str(uuid.uuid4())
            characters.append(
                Character(
                    id=character_id,
                    name=name,
                    description="",  # Da completare con analisi più avanzata
                    voice_settings={"gender": gender, "age": "adult", "accent": "neutral"},
                    avatar_settings={"style": "realistic"},
                    dialogues_count=dialogue_counts[name]
                )
            )
        
        return characters
    
    async def _identify_acts_and_scenes(self, text: str, characters: List[Character]) -> List[Act]:
        """Identifica atti e scene nel copione"""
        # Pattern per identificare atti e scene
        act_pattern = re.compile(r'\b(ATTO|ACT)\s+([IVX]+|\d+|UNICO)', re.IGNORECASE)
        scene_pattern = re.compile(r'\b(SCENA|SCENE)\s+([IVX]+|\d+|UNICA)', re.IGNORECASE)
        
        # Pattern per identificare ambientazioni
        setting_pattern = re.compile(r'\b(AMBIENTAZIONE|SETTING|LUOGO)\s*:\s*(.+)', re.IGNORECASE)
        
        # Suddivisione del testo in linee
        lines = text.split('\n')
        
        acts = []
        current_act = None
        current_scene = None
        current_setting = None
        
        # Mappa dei personaggi per nome
        character_map = {char.name: char for char in characters}
        
        # Contatori per atti e scene automatici
        act_counter = 1
        scene_counter = 1
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:  # Salta linee vuote
                continue
            
            # Controllo se è un nuovo atto
            act_match = act_pattern.search(line)
            if act_match or line.upper() in ["ATTO", "ACT"]:
                act_id = str(uuid.uuid4())
                act_title = line if act_match else f"Atto {self._to_roman(act_counter)}"
                current_act = Act(id=act_id, title=act_title, scenes=[])
                acts.append(current_act)
                act_counter += 1
                scene_counter = 1  # Reset contatore scene per nuovo atto
                continue
            
            # Controllo se è una nuova scena
            scene_match = scene_pattern.search(line)
            if scene_match or line.upper() in ["SCENA", "SCENE"]:
                if current_act is None:  # Se non abbiamo un atto, creane uno
                    act_id = str(uuid.uuid4())
                    current_act = Act(id=act_id, title=f"Atto {self._to_roman(act_counter)}", scenes=[])
                    acts.append(current_act)
                    act_counter += 1
                
                scene_id = str(uuid.uuid4())
                scene_title = line if scene_match else f"Scena {self._to_roman(scene_counter)}"
                current_scene = Scene(id=scene_id, title=scene_title, dialogues=[])
                current_act.scenes.append(current_scene)
                scene_counter += 1
                continue
            
            # Controllo se è un'ambientazione
            setting_match = setting_pattern.search(line)
            if setting_match:
                current_setting = setting_match.group(2).strip()
                if current_scene is not None:
                    current_scene.setting = current_setting
                continue
            
            # Se non abbiamo ancora un atto o una scena, creiamoli di default
            if current_act is None:
                act_id = str(uuid.uuid4())
                current_act = Act(id=act_id, title=f"Atto {self._to_roman(act_counter)}", scenes=[])
                acts.append(current_act)
                act_counter += 1
            
            if current_scene is None and current_act is not None:
                scene_id = str(uuid.uuid4())
                current_scene = Scene(id=scene_id, title=f"Scena {self._to_roman(scene_counter)}", dialogues=[])
                if current_setting:
                    current_scene.setting = current_setting
                current_act.scenes.append(current_scene)
                scene_counter += 1
            
            # Analisi delle battute e didascalie
            if current_scene is not None:
                # Controllo se è una battuta di un personaggio
                dialogue_match = re.match(r'([A-Z][A-Z\s]+)\s*:\s*(.+)', line)
                
                if dialogue_match:
                    character_name = dialogue_match.group(1).strip()
                    dialogue_text = dialogue_match.group(2).strip()
                    
                    # Trova il personaggio corrispondente
                    character_id = None
                    if character_name in character_map:
                        character_id = character_map[character_name].id
                    
                    # Controlla se il testo contiene didascalie interne (testo tra parentesi)
                    if '(' in dialogue_text and ')' in dialogue_text:
                        # Estrai le didascalie dal testo
                        direction_pattern = re.compile(r'\(([^\)]+)\)')
                        directions = direction_pattern.findall(dialogue_text)
                        
                        # Rimuovi le didascalie dal testo originale per la battuta
                        clean_text = direction_pattern.sub('', dialogue_text).strip()
                        
                        # Aggiungi la battuta pulita
                        if clean_text:
                            current_scene.dialogues.append(
                                Dialogue(
                                    character_id=character_id,
                                    text=clean_text,
                                    type=DialogueType.SPEECH
                                )
                            )
                        
                        # Aggiungi le didascalie come elementi separati
                        for direction in directions:
                            current_scene.dialogues.append(
                                Dialogue(
                                    character_id=character_id,  # Mantieni il riferimento al personaggio
                                    text=f"({direction})",
                                    type=DialogueType.DIRECTION
                                )
                            )
                    else:
                        # Aggiungi la battuta senza didascalie
                        current_scene.dialogues.append(
                            Dialogue(
                                character_id=character_id,
                                text=dialogue_text,
                                type=DialogueType.SPEECH
                            )
                        )
                
                # Controllo se è una didascalia (testo tra parentesi)
                elif re.match(r'\(.*\)', line) or line.startswith('[') and line.endswith(']'):
                    current_scene.dialogues.append(
                        Dialogue(
                            character_id=None,
                            text=line,
                            type=DialogueType.DIRECTION
                        )
                    )
                
                # Altrimenti potrebbe essere una descrizione di scena
                elif line and not line.isupper() and len(line) > 10:
                    # Verifica se sembra una descrizione di scena
                    if any(word in line.lower() for word in ['entra', 'esce', 'appare', 'scompare', 'si siede', 'si alza']):
                        current_scene.dialogues.append(
                            Dialogue(
                                character_id=None,
                                text=line,
                                type=DialogueType.DIRECTION
                            )
                        )
                    else:
                        current_scene.dialogues.append(
                            Dialogue(
                                character_id=None,
                                text=line,
                                type=DialogueType.SCENE_DESCRIPTION
                            )
                        )
        
        return acts
        
    def _to_roman(self, num: int) -> str:
        """Converte un numero in numeri romani"""
        val = [
            1000, 900, 500, 400,
            100, 90, 50, 40,
            10, 9, 5, 4,
            1
        ]
        syms = [
            "M", "CM", "D", "CD",
            "C", "XC", "L", "XL",
            "X", "IX", "V", "IV",
            "I"
        ]
        roman_num = ''
        i = 0
        while num > 0:
            for _ in range(num // val[i]):
                roman_num += syms[i]
                num -= val[i]
            i += 1
        return roman_num