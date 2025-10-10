import pytest
import os
import asyncio
from unittest.mock import patch, MagicMock

from app.services.tts import TextToSpeechService
from app.services.video import VideoGenerator
from app.services.scenery import SceneryGenerator
from app.services.storage import StorageService
from app.services.output import VideoOutputService
from app.models.script import Script, Character, Act, Scene, Dialogue

# Fixture per un copione di test
@pytest.fixture
def test_script():
    script = Script(
        id="test123",
        title="Test Script",
        author="Test Author",
        user_id="user123",
        status="processing",
        progress=0
    )
    
    # Aggiunta personaggi
    script.characters = [
        Character(id="char1", name="Personaggio 1", description="Un giovane uomo alto"),
        Character(id="char2", name="Personaggio 2", description="Una donna anziana")
    ]
    
    # Aggiunta atti e scene
    act = Act(id="act1", title="Atto 1", order=1)
    scene = Scene(id="scene1", title="Scena 1", order=1)
    
    # Aggiunta dialoghi
    scene.dialogues = [
        Dialogue(
            id="dial1",
            type="scene_description",
            text="Una stanza buia con una finestra che si affaccia sul mare."
        ),
        Dialogue(
            id="dial2",
            type="dialogue",
            character_id="char1",
            text="Buongiorno, come stai oggi?"
        ),
        Dialogue(
            id="dial3",
            type="dialogue",
            character_id="char2",
            text="Molto bene, grazie."
        )
    ]
    
    act.scenes = [scene]
    script.acts = [act]
    
    return script

# Test per il servizio TTS
@pytest.mark.asyncio
async def test_tts_service():
    # Creazione servizio
    tts = TextToSpeechService(provider="elevenlabs")
    
    # Mock per la generazione audio
    with patch.object(tts, '_generate_with_elevenlabs', return_value=True) as mock_generate:
        # Test generazione audio
        output_dir = "/tmp/test_audio"
        os.makedirs(output_dir, exist_ok=True)
        
        # Creazione dialogo di test
        dialogue = Dialogue(
            id="test_dial",
            type="dialogue",
            character_id="test_char",
            text="Questo è un test."
        )
        
        # Generazione audio
        result = await tts._generate_audio(
            text=dialogue.text,
            output_path=os.path.join(output_dir, "test.mp3"),
            voice_id="test_voice",
            voice_settings={}
        )
        
        # Verifica chiamata
        assert result is True
        mock_generate.assert_called_once()

# Test per il servizio di generazione video
@pytest.mark.asyncio
async def test_video_generator(test_script):
    # Creazione servizio
    video_gen = VideoGenerator(provider="pika")
    
    # Mock per la generazione video
    with patch.object(video_gen, '_generate_with_pika', return_value=True) as mock_generate:
        # Test generazione video per una scena
        scene = test_script.acts[0].scenes[0]
        character_map = {char.id: char for char in test_script.characters}
        
        output_dir = "/tmp/test_video"
        os.makedirs(output_dir, exist_ok=True)
        
        # Generazione video
        result = await video_gen._generate_scene_video(
            scene=scene,
            character_map=character_map,
            audio_dir="/tmp/test_audio",
            output_path=os.path.join(output_dir, "test.mp4")
        )
        
        # Verifica chiamata
        assert result is True
        mock_generate.assert_called_once()

# Test per il servizio di generazione scenografie
@pytest.mark.asyncio
async def test_scenery_generator(test_script):
    # Creazione servizio
    scenery_gen = SceneryGenerator(provider="stability")
    
    # Mock per la generazione scenografia
    with patch.object(scenery_gen, '_generate_with_stability', return_value=True) as mock_generate:
        # Test generazione scenografia
        scene = test_script.acts[0].scenes[0]
        
        output_dir = "/tmp/test_scenery"
        os.makedirs(output_dir, exist_ok=True)
        
        # Generazione scenografia
        result = await scenery_gen.generate_scenery_for_scene(
            scene=scene,
            output_dir=output_dir
        )
        
        # Verifica risultato
        assert result != ""
        mock_generate.assert_called_once()

# Test per il servizio di storage
@pytest.mark.asyncio
async def test_storage_service():
    # Creazione servizio
    storage = StorageService(provider="local")
    
    # Mock per il salvataggio locale
    with patch.object(storage, '_save_local', return_value="test/path.mp4") as mock_save:
        # Test salvataggio file
        result = await storage.save_file(
            file_path="/tmp/test.mp4",
            destination_path="test/path.mp4"
        )
        
        # Verifica risultato
        assert result == "test/path.mp4"
        mock_save.assert_called_once()

# Test per il servizio di output video
@pytest.mark.asyncio
async def test_output_service(test_script):
    # Creazione servizio
    output = VideoOutputService()
    
    # Mock per l'ottimizzazione video
    with patch.object(output, '_optimize_video', return_value=True) as mock_optimize:
        # Mock per il salvataggio nello storage
        with patch.object(output.storage, 'save_file', return_value="videos/test.mp4") as mock_save:
            # Mock per l'URL
            with patch.object(output.storage, 'get_file_url', return_value="http://example.com/test.mp4") as mock_url:
                # Mock per la durata
                with patch.object(output, '_get_video_duration', return_value=120.5) as mock_duration:
                    # Test processamento video
                    result = await output.process_final_video(
                        script=test_script,
                        video_path="/tmp/test.mp4"
                    )
                    
                    # Verifica risultato
                    assert result["success"] is True
                    assert "url" in result
                    mock_optimize.assert_called_once()
                    mock_save.assert_called_once()
                    mock_url.assert_called_once()
                    mock_duration.assert_called_once()

# Esecuzione dei test
if __name__ == "__main__":
    asyncio.run(pytest.main(["-xvs", __file__]))