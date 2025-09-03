import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('characters');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
        setScript(response.data);
      } catch (err) {
        console.error('Errore nel caricamento del copione:', err);
        setError('Impossibile caricare il copione. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [projectId]);

  const handleGenerateAudio = async () => {
    setGenerating(true);
    try {
      await axios.post(`http://localhost:8000/api/projects/${projectId}/generate-audio`);
      // Aggiorna lo script per mostrare lo stato aggiornato
      const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
      setScript(response.data);
    } catch (err) {
      console.error('Errore nella generazione audio:', err);
      setError('Errore nella generazione audio. Riprova più tardi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    setGenerating(true);
    try {
      await axios.post(`http://localhost:8000/api/projects/${projectId}/generate-video`);
      // Aggiorna lo script per mostrare lo stato aggiornato
      const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
      setScript(response.data);
      // Naviga alla pagina di anteprima
      navigate(`/preview/${projectId}`);
    } catch (err) {
      console.error('Errore nella generazione video:', err);
      setError('Errore nella generazione video. Riprova più tardi.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="p-6 bg-red-50 rounded-lg text-red-700 mb-6">
          {error}
        </div>
        <button 
          onClick={() => navigate('/upload')} 
          className="btn-primary"
        >
          Torna al caricamento
        </button>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="p-6 bg-yellow-50 rounded-lg text-yellow-700 mb-6">
          Nessun copione trovato con questo ID.
        </div>
        <button 
          onClick={() => navigate('/upload')} 
          className="btn-primary"
        >
          Carica un nuovo copione
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{script.metadata?.title || 'Copione senza titolo'}</h1>
        <div className="flex space-x-4">
          <button 
            onClick={handleGenerateAudio} 
            disabled={generating}
            className={`btn-secondary py-2 px-4 flex items-center ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generating ? 'Generazione...' : 'Genera Audio'}
          </button>
          <button 
            onClick={handleGenerateVideo} 
            disabled={generating || !script.audio_generated}
            className={`btn-primary py-2 px-4 flex items-center ${(generating || !script.audio_generated) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generating ? 'Generazione...' : 'Genera Video'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('characters')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'characters' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Personaggi
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'scenes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Scene
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Impostazioni
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'characters' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Personaggi</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {script.characters?.map((character, index) => (
                <div key={index} className="card p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{character.name}</h3>
                      <p className="text-gray-500 text-sm">{character.dialogues_count} battute</p>
                    </div>
                    <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                      {character.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voce</label>
                    <select 
                      className="input w-full" 
                      defaultValue="default"
                    >
                      <option value="default">Voce predefinita</option>
                      <option value="male1">Uomo 1</option>
                      <option value="male2">Uomo 2</option>
                      <option value="female1">Donna 1</option>
                      <option value="female2">Donna 2</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                    <select 
                      className="input w-full" 
                      defaultValue="default"
                    >
                      <option value="default">Avatar predefinito</option>
                      <option value="realistic">Realistico</option>
                      <option value="cartoon">Cartone animato</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scenes' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Scene</h2>
            <div className="space-y-6">
              {script.acts?.map((act, actIndex) => (
                <div key={actIndex} className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Atto {act.number}</h3>
                  
                  {act.scenes?.map((scene, sceneIndex) => (
                    <div key={sceneIndex} className="card p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Scena {scene.number}</h4>
                        <button className="text-primary-600 hover:text-primary-800 text-sm">
                          Modifica
                        </button>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{scene.description || 'Nessuna descrizione'}</p>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ambientazione</label>
                        <select 
                          className="input w-full" 
                          defaultValue="default"
                        >
                          <option value="default">Ambientazione predefinita</option>
                          <option value="indoor">Interno</option>
                          <option value="outdoor">Esterno</option>
                          <option value="fantasy">Fantasy</option>
                          <option value="historical">Storico</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stile visivo</label>
                        <select 
                          className="input w-full" 
                          defaultValue="default"
                        >
                          <option value="default">Stile predefinito</option>
                          <option value="realistic">Realistico</option>
                          <option value="cinematic">Cinematografico</option>
                          <option value="artistic">Artistico</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Impostazioni</h2>
            
            <div className="card p-6 mb-6">
              <h3 className="font-medium mb-4">Impostazioni generali</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    defaultValue={script.metadata?.title || ''}
                    placeholder="Titolo del copione"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autore</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    defaultValue={script.metadata?.author || ''}
                    placeholder="Nome dell'autore"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servizio Text-to-Speech</label>
                  <select 
                    className="input w-full" 
                    defaultValue="elevenlabs"
                  >
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="azure">Azure</option>
                    <option value="google">Google Cloud</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servizio Video</label>
                  <select 
                    className="input w-full" 
                    defaultValue="pikalabs"
                  >
                    <option value="pikalabs">Pika Labs</option>
                    <option value="runway">Runway Gen-3</option>
                    <option value="kaiber">Kaiber AI</option>
                    <option value="unreal">Unreal Engine + Metahuman</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-medium mb-4">Impostazioni avanzate</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualità video</label>
                  <select 
                    className="input w-full" 
                    defaultValue="high"
                  >
                    <option value="low">Bassa (720p)</option>
                    <option value="medium">Media (1080p)</option>
                    <option value="high">Alta (1440p)</option>
                    <option value="ultra">Ultra (4K)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato output</label>
                  <select 
                    className="input w-full" 
                    defaultValue="mp4"
                  >
                    <option value="mp4">MP4</option>
                    <option value="mov">MOV</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="subtitles" 
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                    defaultChecked
                  />
                  <label htmlFor="subtitles" className="ml-2 block text-sm text-gray-700">
                    Genera sottotitoli
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="music" 
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                    defaultChecked
                  />
                  <label htmlFor="music" className="ml-2 block text-sm text-gray-700">
                    Aggiungi musica di sottofondo
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Stato:</span>
            <span className="ml-2 text-sm font-medium">
              {script.video_generated ? 'Video generato' : 
               script.audio_generated ? 'Audio generato' : 
               'Analisi completata'}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Progresso:</span>
            <div className="w-48 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${script.progress || 0}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-500">{script.progress || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;