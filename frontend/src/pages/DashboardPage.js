import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '../assets/images/placeholder.svg';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, in-progress
  const navigate = useNavigate();

  useEffect(() => {
    // Simulazione di caricamento dei progetti
    // In un'implementazione reale, questa sarebbe una chiamata API
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Simulazione di ritardo di rete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dati di esempio
        const mockProjects = [
          {
            id: '1',
            title: 'Amleto',
            author: 'William Shakespeare',
            created_at: '2023-10-15',
            last_modified: '2023-10-18',
            characters: 8,
            duration: '02:45:00',
            progress: 100,
            video_generated: true,
            thumbnail: placeholderImage
          },
          {
            id: '2',
            title: 'La Locandiera',
            author: 'Carlo Goldoni',
            created_at: '2023-10-20',
            last_modified: '2023-10-20',
            characters: 5,
            duration: '01:30:00',
            progress: 65,
            video_generated: false,
            thumbnail: placeholderImage
          },
          {
            id: '3',
            title: 'Sei personaggi in cerca d\'autore',
            author: 'Luigi Pirandello',
            created_at: '2023-10-10',
            last_modified: '2023-10-12',
            characters: 6,
            duration: '02:10:00',
            progress: 100,
            video_generated: true,
            thumbnail: placeholderImage
          },
          {
            id: '4',
            title: 'Aspettando Godot',
            author: 'Samuel Beckett',
            created_at: '2023-10-05',
            last_modified: '2023-10-08',
            characters: 4,
            duration: '01:45:00',
            progress: 30,
            video_generated: false,
            thumbnail: placeholderImage
          },
        ];
        
        setProjects(mockProjects);
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento dei progetti. Riprova più tardi.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleNewProject = () => {
    navigate('/upload');
  };

  const handleEditProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  const handlePreviewProject = (projectId) => {
    navigate(`/preview/${projectId}`);
  };

  const handleDeleteProject = (projectId) => {
    // In un'implementazione reale, questa sarebbe una chiamata API
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const filteredProjects = () => {
    switch (filter) {
      case 'completed':
        return projects.filter(project => project.video_generated);
      case 'in-progress':
        return projects.filter(project => !project.video_generated);
      default:
        return projects;
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
      <div className="py-12 px-4 max-w-7xl mx-auto text-center">
        <div className="p-6 bg-red-50 rounded-lg text-red-700 mb-6">
          {error}
        </div>
        <button 
          onClick={handleNewProject} 
          className="btn-primary"
        >
          Crea nuovo progetto
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">I tuoi progetti</h1>
        <button 
          onClick={handleNewProject}
          className="btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuovo progetto
        </button>
      </div>

      {/* Filtri */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          Tutti
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          Completati
        </button>
        <button 
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          In corso
        </button>
      </div>

      {/* Progetti */}
      {filteredProjects().length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Nessun progetto trovato</h2>
          <p className="text-gray-600 mb-6">Inizia caricando un nuovo copione teatrale</p>
          <button 
            onClick={handleNewProject}
            className="btn-primary"
          >
            Crea nuovo progetto
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects().map(project => (
            <div key={project.id} className="card overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <div className="relative">
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status badge */}
                {project.video_generated ? (
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Completato
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    In corso ({project.progress}%)
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4 flex-grow">
                <h3 className="font-semibold text-lg mb-1 truncate">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{project.author}</p>
                
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Creato: {project.created_at}</span>
                  <span>{project.characters} personaggi</span>
                </div>
                
                {!project.video_generated && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleEditProject(project.id)}
                      className="text-gray-700 hover:text-primary-600 text-sm font-medium"
                    >
                      Modifica
                    </button>
                    <button 
                      onClick={() => handlePreviewProject(project.id)}
                      className="text-gray-700 hover:text-primary-600 text-sm font-medium"
                    >
                      {project.video_generated ? 'Visualizza' : 'Anteprima'}
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiche */}
      {projects.length > 0 && (
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Progetti totali</h3>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Completati</h3>
            <p className="text-3xl font-bold">{projects.filter(p => p.video_generated).length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">In corso</h3>
            <p className="text-3xl font-bold">{projects.filter(p => !p.video_generated).length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Spazio utilizzato</h3>
            <p className="text-3xl font-bold">1.2 GB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;