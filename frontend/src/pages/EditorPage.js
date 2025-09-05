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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Personaggi</h2>
              <div className="flex space-x-2">
                <button className="btn-secondary py-1 px-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Esporta
                </button>
                <button className="btn-secondary py-1 px-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Aggiungi
                </button>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sono stati rilevati <strong>{script.characters?.length || 0} personaggi</strong> nel copione. Puoi personalizzare le voci e gli avatar per ciascun personaggio.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {script.characters?.map((character, index) => (
                <div key={index} className="card p-4 border border-gray-200 hover:border-primary-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{character.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {character.dialogues_count} battute
                        <span className="mx-2">•</span>
                        <span className={character.gender === 'male' ? 'text-blue-500' : character.gender === 'female' ? 'text-pink-500' : 'text-gray-500'}>
                          {character.gender === 'male' ? 'Uomo' : character.gender === 'female' ? 'Donna' : 'Non specificato'}
                        </span>
                      </div>
                    </div>
                    <div className={`rounded-full w-12 h-12 flex items-center justify-center text-white font-medium ${character.gender === 'male' ? 'bg-blue-500' : character.gender === 'female' ? 'bg-pink-500' : 'bg-gray-400'}`}>
                      {character.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voce</label>
                    <select 
                      className="input w-full" 
                      defaultValue={character.gender === 'male' ? 'male1' : character.gender === 'female' ? 'female1' : 'default'}
                    >
                      <option value="default">Voce predefinita</option>
                      <optgroup label="Voci maschili">
                        <option value="male1">Uomo 1 - Profonda</option>
                        <option value="male2">Uomo 2 - Giovane</option>
                        <option value="male3">Uomo 3 - Anziano</option>
                      </optgroup>
                      <optgroup label="Voci femminili">
                        <option value="female1">Donna 1 - Adulta</option>
                        <option value="female2">Donna 2 - Giovane</option>
                        <option value="female3">Donna 3 - Anziana</option>
                      </optgroup>
                    </select>
                    <button className="mt-1 text-primary-600 hover:text-primary-800 text-xs flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ascolta anteprima
                    </button>
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
                      <option value="custom">Personalizzato</option>
                    </select>
                    <div className="mt-2 flex justify-between">
                      <button className="text-primary-600 hover:text-primary-800 text-xs flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Anteprima
                      </button>
                      <button className="text-primary-600 hover:text-primary-800 text-xs flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Carica immagine
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scenes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Scene</h2>
              <div className="flex space-x-2">
                <button className="btn-secondary py-1 px-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Esporta
                </button>
              </div>
            </div>
            
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sono stati rilevati <strong>{script.acts?.length || 0} atti</strong> e <strong>{script.acts?.reduce((total, act) => total + (act.scenes?.length || 0), 0) || 0} scene</strong> nel copione. Puoi personalizzare le ambientazioni e lo stile visivo per ciascuna scena.
              </p>
            </div>
            
            <div className="space-y-6">
              {script.acts?.map((act, actIndex) => (
                <div key={actIndex} className="mb-8">
                  <div className="flex items-center mb-4 bg-gray-100 p-2 rounded-lg">
                    <h3 className="text-lg font-medium">Atto {act.number}</h3>
                    <span className="ml-2 text-sm text-gray-500">({act.scenes?.length || 0} scene)</span>
                    <button className="ml-auto text-primary-600 hover:text-primary-800 text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Espandi
                    </button>
                  </div>
                  
                  {act.scenes?.map((scene, sceneIndex) => (
                    <div key={sceneIndex} className="card p-4 mb-4 border border-gray-200 hover:border-primary-300 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-medium">Scena {scene.number}</h4>
                          <div className="text-sm text-gray-500">
                            {scene.dialogues?.length || 0} battute • {scene.setting ? `Ambientazione: ${scene.setting}` : 'Nessuna ambientazione specificata'}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Anteprima
                          </button>
                          <button className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifica
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm italic">
                        {scene.description ? (
                          <p className="text-gray-700">{scene.description}</p>
                        ) : (
                          <p className="text-gray-500">Nessuna descrizione disponibile</p>
                        )}
                      </div>
                      
                      {scene.dialogues && scene.dialogues.length > 0 && (
                        <div className="mb-4 border-l-2 border-gray-200 pl-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Esempio di dialogo:</h5>
                          {scene.dialogues.slice(0, 2).map((dialogue, dIndex) => (
                            <div key={dIndex} className="mb-2 text-sm">
                              {dialogue.character && <span className="font-medium">{dialogue.character}: </span>}
                              <span>{dialogue.text}</span>
                              {dialogue.type === 'direction' && <span className="text-gray-500 italic"> (didascalia)</span>}
                            </div>
                          ))}
                          {scene.dialogues.length > 2 && (
                            <p className="text-xs text-gray-500">+ altri {scene.dialogues.length - 2} dialoghi</p>
                          )}
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ambientazione</label>
                          <select 
                            className="input w-full" 
                            defaultValue={scene.setting ? 'custom' : 'default'}
                          >
                            <option value="default">Ambientazione predefinita</option>
                            <option value="indoor">Interno</option>
                            <option value="outdoor">Esterno</option>
                            <option value="fantasy">Fantasy</option>
                            <option value="historical">Storico</option>
                            <option value="custom">Personalizzata</option>
                          </select>
                          {scene.setting && (
                            <input 
                              type="text" 
                              className="input w-full mt-2" 
                              defaultValue={scene.setting}
                              placeholder="Descrizione ambientazione personalizzata"
                            />
                          )}
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
                            <option value="custom">Personalizzato</option>
                          </select>
                          <div className="mt-2 flex justify-between">
                            <button className="text-primary-600 hover:text-primary-800 text-xs flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Carica immagine di riferimento
                            </button>
                          </div>
                        </div>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Impostazioni</h2>
              <div className="flex space-x-2">
                <button className="btn-secondary py-1 px-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salva
                </button>
              </div>
            </div>
            
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Configura le impostazioni generali del progetto e i servizi di generazione audio e video.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 border-b pb-2">Informazioni sul progetto</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="Inserisci il titolo del progetto"
                    defaultValue={script.metadata?.title || ''}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autore</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="Inserisci l'autore del copione"
                    defaultValue={script.metadata?.author || ''}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea 
                    className="input w-full h-24" 
                    placeholder="Inserisci una breve descrizione dell'opera"
                    defaultValue={script.metadata?.description || ''}
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genere</label>
                  <select 
                    className="input w-full" 
                    defaultValue={script.metadata?.genre || 'drama'}
                  >
                    <option value="drama">Dramma</option>
                    <option value="comedy">Commedia</option>
                    <option value="tragedy">Tragedia</option>
                    <option value="musical">Musical</option>
                    <option value="historical">Storico</option>
                    <option value="other">Altro</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 border-b pb-2">Servizi di generazione</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servizio Text-to-Speech</label>
                  <select 
                    className="input w-full" 
                    defaultValue="elevenlabs"
                  >
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="azure">Microsoft Azure</option>
                    <option value="google">Google Cloud</option>
                  </select>
                  
                  <div className="mt-2">
                    <label className="flex items-center text-sm">
                      <input type="checkbox" className="mr-2" />
                      Usa API key personale
                    </label>
                    <input 
                      type="password" 
                      className="input w-full mt-2" 
                      placeholder="Inserisci la tua API key"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servizio di generazione video</label>
                  <select 
                    className="input w-full" 
                    defaultValue="pikalabs"
                  >
                    <option value="pikalabs">Pika Labs</option>
                    <option value="runway">Runway Gen-3</option>
                    <option value="kaiber">Kaiber AI</option>
                    <option value="unreal">Unreal Engine + Metahuman</option>
                  </select>
                  
                  <div className="mt-2">
                    <label className="flex items-center text-sm">
                      <input type="checkbox" className="mr-2" />
                      Usa API key personale
                    </label>
                    <input 
                      type="password" 
                      className="input w-full mt-2" 
                      placeholder="Inserisci la tua API key"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualità di generazione</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Standard</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      defaultValue="2" 
                      className="w-full" 
                    />
                    <span className="text-sm text-gray-500">Alta</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Una qualità più alta richiede più tempo di elaborazione</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato di output</label>
                  <select 
                    className="input w-full" 
                    defaultValue="mp4"
                  >
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="webm">WebM</option>
                    <option value="mov">MOV</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <h3 className="font-medium text-gray-800 mb-4">Opzioni avanzate</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Genera sottotitoli automatici
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <input type="checkbox" className="mr-2" />
                    Applica miglioramenti audio automatici
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Includi didascalie nel video
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center text-sm mb-2">
                    <input type="checkbox" className="mr-2" />
                    Genera storyboard prima del video
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