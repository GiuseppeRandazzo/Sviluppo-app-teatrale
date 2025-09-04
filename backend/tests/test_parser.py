import asyncio
import sys
import os
import json
from pydantic import BaseModel

# Aggiungi la directory principale al path per importare i moduli
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.parser import ScriptParser
from app.models.script import ScriptMetadata

async def test_parser():
    # Percorso del file di esempio
    file_path = os.path.join(os.path.dirname(__file__), "copione_esempio.txt")
    file_ext = ".txt"
    
    # Creazione del parser
    parser = ScriptParser()
    
    # Metadati iniziali
    metadata = ScriptMetadata(title="Copione senza titolo")
    
    # Parsing del file
    print(f"Analisi del file: {file_path}")
    script = await parser.parse_file(file_path, file_ext, metadata)
    
    # Stampa dei risultati
    print(f"\nRisultati del parsing:")
    print(f"Titolo: {script.metadata.title}")
    print(f"Autore: {script.metadata.author}")
    print(f"Stato: {script.status}")
    print(f"Progresso: {script.progress}%")
    
    # Stampa dei personaggi
    print(f"\nPersonaggi identificati ({len(script.characters)}):")
    for char in script.characters:
        print(f"  - {char.name} (Battute: {char.dialogues_count}, Genere: {char.voice_settings.get('gender', 'sconosciuto')})")
    
    # Stampa degli atti e scene
    print(f"\nStruttura del copione:")
    for act in script.acts:
        print(f"\n{act.title}")
        for scene in act.scenes:
            print(f"  {scene.title}")
            if scene.setting:
                print(f"  Ambientazione: {scene.setting}")
            print(f"  Dialoghi: {len(scene.dialogues)}")
            
            # Stampa di alcuni dialoghi di esempio
            if scene.dialogues:
                print(f"  Esempi di dialoghi:")
                for i, dialogue in enumerate(scene.dialogues[:3]):
                    char_name = "[Didascalia]" if dialogue.character_id is None else next(
                        (char.name for char in script.characters if char.id == dialogue.character_id), "Sconosciuto")
                    print(f"    {char_name}: {dialogue.text[:50]}{'...' if len(dialogue.text) > 50 else ''}")
                if len(scene.dialogues) > 3:
                    print(f"    ... e altri {len(scene.dialogues) - 3} dialoghi")
    
    # Conversione a JSON per debug
    class EnhancedJSONEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, BaseModel):
                return o.dict()
            elif hasattr(o, 'isoformat'):  # Per oggetti datetime
                return o.isoformat()
            return super().default(o)
    
    # Salva il risultato in un file JSON per ispezione
    with open(os.path.join(os.path.dirname(__file__), "parsed_script.json"), "w", encoding="utf-8") as f:
        json.dump(script.model_dump(), f, cls=EnhancedJSONEncoder, ensure_ascii=False, indent=2)
    
    print(f"\nRisultato completo salvato in: {os.path.join(os.path.dirname(__file__), 'parsed_script.json')}")

if __name__ == "__main__":
    asyncio.run(test_parser())