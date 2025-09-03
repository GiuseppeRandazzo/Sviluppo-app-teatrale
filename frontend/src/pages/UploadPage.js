import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    setError('');
    const selectedFile = acceptedFiles[0];
    
    // Verifica estensione file
    const validExtensions = ['.txt', '.docx', '.pdf'];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setError('Formato file non supportato. Carica un file .txt, .docx o .pdf');
      return;
    }
    
    // Verifica dimensione file (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Il file è troppo grande. La dimensione massima è 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Seleziona un file da caricare');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Naviga alla pagina dell'editor con l'ID del progetto
      navigate(`/editor/${response.data.project_id}`);
    } catch (err) {
      console.error('Errore durante il caricamento:', err);
      setError(err.response?.data?.detail || 'Errore durante il caricamento del file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Carica il tuo copione</h1>
      
      <div className="mb-8">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            {isDragActive ? (
              <p className="text-lg">Rilascia il file qui...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Trascina qui il tuo file o clicca per selezionarlo</p>
                <p className="text-sm text-gray-500">Supportiamo file .txt, .docx e .pdf fino a 10MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {file && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">File selezionato:</h3>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{file.name}</span>
            <span className="ml-2 text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
            <button 
              onClick={() => setFile(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className={`btn-primary py-2 px-8 flex items-center ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Caricamento...
            </>
          ) : 'Carica e analizza'}
        </button>
      </div>

      <div className="mt-12 text-center text-gray-600">
        <h3 className="font-medium mb-4">Suggerimenti per un'analisi ottimale:</h3>
        <ul className="text-left max-w-md mx-auto space-y-2">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Assicurati che i nomi dei personaggi siano chiaramente identificabili
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Separa le battute e le didascalie in modo chiaro
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Indica chiaramente l'inizio e la fine delle scene
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPage;