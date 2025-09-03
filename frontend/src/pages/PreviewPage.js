import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PreviewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
        setProject(response.data);
      } catch (err) {
        console.error('Errore nel caricamento del progetto:', err);
        setError('Impossibile caricare il progetto. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // Polling per aggiornare lo stato del progetto se è in elaborazione
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/projects/${projectId}`);
        setProject(response.data);
        
        // Se il video è stato generato, interrompi il polling
        if (response.data.video_generated) {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Errore nell\'aggiornamento dello stato:', err);
      }
    }, 5000); // Controlla ogni 5 secondi

    return () => clearInterval(intervalId);
  }, [projectId]);

  const handleDownload = () => {
    navigate(`/download/${projectId}`);
  };

  const handleEdit = () => {
    navigate(`/editor/${projectId}`);
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

  // Se il video è ancora in generazione
  if (!project.video_generated) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">{project.metadata?.title || 'Progetto senza titolo'}</h1>
        
        <div className="card p-8 mb-8">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            
            <h2 className="text-2xl font-semibold mb-2">Video in elaborazione</h2>
            <p className="text-gray-600 mb-6">Stiamo generando il tuo video. Questo processo potrebbe richiedere alcuni minuti.</p>
            
            <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-primary-600 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500">{project.progress || 0}% completato</p>
          </div>
        </div>
        
        <button 
          onClick={handleEdit} 
          className="btn-secondary py-2 px-6"
        >
          Torna all'editor
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{project.metadata?.title || 'Progetto senza titolo'}</h1>
        
        <div className="flex space-x-4">
          <button 
            onClick={handleEdit} 
            className="btn-secondary py-2 px-4"
          >
            Modifica
          </button>
          <button 
            onClick={handleDownload} 
            className="btn-primary py-2 px-4 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Scarica
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="mb-8 bg-black rounded-lg overflow-hidden shadow-lg">
        <div className="aspect-video relative">
          {/* Placeholder per il video */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <p className="text-white">Anteprima video</p>
          </div>
          
          {/* Controlli video */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <button className="text-white hover:text-primary-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <div className="flex-1 mx-4">
                <div className="h-1 w-full bg-gray-500 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full w-1/3"></div>
                </div>
              </div>
              
              <span className="text-white text-sm">00:00 / 03:24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informazioni sul progetto */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dettagli</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Titolo</h3>
                <p>{project.metadata?.title || 'Senza titolo'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Autore</h3>
                <p>{project.metadata?.author || 'Sconosciuto'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Durata</h3>
                <p>3:24</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Risoluzione</h3>
                <p>1920x1080 (Full HD)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Personaggi</h2>
            <ul className="space-y-2">
              {project.characters?.map((character, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    {character.name.charAt(0)}
                  </div>
                  <span>{character.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;