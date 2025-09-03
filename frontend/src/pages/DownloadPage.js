import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DownloadPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [includeSubtitles, setIncludeSubtitles] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
        setProject(response.data);
        
        // Verifica che il video sia stato generato
        if (!response.data.video_generated) {
          navigate(`/editor/${projectId}`);
        }
      } catch (err) {
        console.error('Errore nel caricamento del progetto:', err);
        setError('Impossibile caricare il progetto. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleDownload = async () => {
    try {
      // Simula il download del file
      // In un'implementazione reale, questa sarebbe una richiesta API per ottenere il file
      const response = await axios.get(
        `http://localhost:8000/api/projects/${projectId}/download?format=${downloadFormat}&quality=${quality}&subtitles=${includeSubtitles}`,
        { responseType: 'blob' }
      );
      
      // Crea un URL per il blob e avvia il download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.metadata?.title || 'video'}.${downloadFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Errore durante il download:', err);
      setError('Errore durante il download del file. Riprova più tardi.');
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

  if (!project) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="p-6 bg-yellow-50 rounded-lg text-yellow-700 mb-6">
          Nessun progetto trovato con questo ID.
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
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Scarica il tuo video</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Anteprima */}
        <div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Anteprima</h2>
            
            <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-white">Anteprima video</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Titolo:</span>
                <span className="font-medium">{project.metadata?.title || 'Senza titolo'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Durata:</span>
                <span className="font-medium">3:24</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dimensione stimata:</span>
                <span className="font-medium">
                  {quality === 'low' ? '45 MB' : 
                   quality === 'medium' ? '120 MB' : 
                   quality === 'high' ? '250 MB' : '500 MB'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Opzioni di download */}
        <div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Opzioni di download</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setDownloadFormat('mp4')} 
                    className={`py-2 px-4 rounded-md text-center ${downloadFormat === 'mp4' ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                  >
                    MP4
                  </button>
                  <button 
                    onClick={() => setDownloadFormat('mov')} 
                    className={`py-2 px-4 rounded-md text-center ${downloadFormat === 'mov' ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                  >
                    MOV
                  </button>
                  <button 
                    onClick={() => setDownloadFormat('webm')} 
                    className={`py-2 px-4 rounded-md text-center ${downloadFormat === 'webm' ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                  >
                    WebM
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualità</label>
                <select 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="input w-full"
                >
                  <option value="low">Bassa (720p)</option>
                  <option value="medium">Media (1080p)</option>
                  <option value="high">Alta (1440p)</option>
                  <option value="ultra">Ultra (4K)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="subtitles" 
                  checked={includeSubtitles}
                  onChange={(e) => setIncludeSubtitles(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
                />
                <label htmlFor="subtitles" className="ml-2 block text-sm text-gray-700">
                  Includi sottotitoli
                </label>
              </div>
              
              <button 
                onClick={handleDownload} 
                className="btn-primary w-full py-3 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Scarica video
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => navigate(`/preview/${projectId}`)} 
              className="btn-secondary w-full py-2"
            >
              Torna all'anteprima
            </button>
          </div>
        </div>
      </div>
      
      {/* Altre opzioni */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Altre opzioni</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="font-medium mb-2">Scarica solo l'audio</h3>
            <p className="text-sm text-gray-600 mb-4">Ottieni solo le tracce audio dei dialoghi</p>
            <button className="btn-secondary w-full py-2 text-sm">Scarica MP3</button>
          </div>
          
          <div className="card p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <h3 className="font-medium mb-2">Esporta sottotitoli</h3>
            <p className="text-sm text-gray-600 mb-4">Scarica i sottotitoli in formato SRT</p>
            <button className="btn-secondary w-full py-2 text-sm">Scarica SRT</button>
          </div>
          
          <div className="card p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="font-medium mb-2">Esporta storyboard</h3>
            <p className="text-sm text-gray-600 mb-4">Scarica le immagini chiave delle scene</p>
            <button className="btn-secondary w-full py-2 text-sm">Scarica ZIP</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;