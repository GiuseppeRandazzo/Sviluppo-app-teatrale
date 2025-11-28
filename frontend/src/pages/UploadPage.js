import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    setFilePreview("");
    const selectedFile = acceptedFiles[0];

    if (!selectedFile) return;

    // Verifica estensione file
    const validExtensions = [".txt", ".docx", ".pdf"];
    const fileExt = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setError(
        "Formato file non supportato. Carica un file .txt, .docx o .pdf"
      );
      return;
    }

    // Verifica dimensione file (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Il file è troppo grande. La dimensione massima è 10MB");
      return;
    }

    setFile(selectedFile);

    // Genera anteprima per file di testo
    if (fileExt === ".txt") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        // Mostra solo le prime 500 caratteri
        setFilePreview(
          text.substring(0, 500) + (text.length > 500 ? "..." : "")
        );
      };
      reader.readAsText(selectedFile);
    } else {
      // Per altri tipi di file, mostra solo info sul file
      setFilePreview(`Tipo file: ${fileExt.substring(1).toUpperCase()}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setError("Seleziona un file da caricare");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);

    // Simulazione upload con mock data
    try {
      // Simula progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Genera un ID random per il progetto
      const projectId = `project-${Date.now()}`;

      // Salva i dati mock in localStorage
      const mockProject = {
        id: projectId,
        filename: file.name,
        uploadDate: new Date().toISOString(),
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          author: "Autore sconosciuto",
        },
        characters: [],
        acts: [],
        progress: 25,
      };
      localStorage.setItem(`project-${projectId}`, JSON.stringify(mockProject));

      // Naviga alla pagina dell'editor con l'ID del progetto
      navigate(`/editor/${projectId}`);
    } catch (err) {
      console.error("Errore durante il caricamento:", err);
      setError("Errore durante il caricamento del file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Carica il tuo copione
      </h1>

      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-400"
          }`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {isDragActive ? (
              <p className="text-lg">Rilascia il file qui...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Trascina qui il tuo file o clicca per selezionarlo
                </p>
                <p className="text-sm text-gray-500">
                  Supportiamo file .txt, .docx e .pdf fino a 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {file && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">File selezionato:</h3>
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="font-medium">{file.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({(file.size / 1024).toFixed(2)} KB)
            </span>
            <button
              onClick={() => {
                setFile(null);
                setFilePreview("");
              }}
              className="ml-auto text-red-500 hover:text-red-700"
              type="button"
              aria-label="Rimuovi file">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {filePreview && (
            <div className="mt-3 p-3 bg-white rounded border border-gray-200 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                Anteprima:
              </h4>
              <p className="text-sm whitespace-pre-wrap">{filePreview}</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Caricamento in corso... {uploadProgress}%
          </p>
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
          className={`btn-primary py-2 px-8 flex items-center ${
            !file || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}>
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Caricamento...
            </>
          ) : (
            "Carica e analizza"
          )}
        </button>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="font-medium mb-4 text-center text-blue-800">
          Suggerimenti per un'analisi ottimale
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-blue-700">Formato del copione</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Assicurati che i <strong>nomi dei personaggi</strong> siano
                  chiaramente identificabili (es. in maiuscolo o seguiti da due
                  punti)
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Separa le <strong>battute</strong> e le{" "}
                  <strong>didascalie</strong> in modo chiaro (didascalie tra
                  parentesi)
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Indica chiaramente l'
                  <strong>inizio e la fine delle scene</strong> (es. "ATTO I",
                  "SCENA 1")
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-blue-700">
              Esempi di formattazione
            </h4>
            <div className="bg-white p-3 rounded border border-gray-200 text-sm">
              <p className="font-bold mb-2">ATTO I - SCENA 1</p>
              <p className="italic mb-2">
                (Un salotto. Luci soffuse. MARIA entra dalla porta principale.)
              </p>
              <p>
                <strong>MARIA:</strong> Non pensavo di trovarti qui. (sorpresa)
              </p>
              <p>
                <strong>GIOVANNI:</strong> Ti stavo aspettando.
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Il nostro parser è in grado di riconoscere automaticamente
              personaggi, battute, didascalie e struttura del copione.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
