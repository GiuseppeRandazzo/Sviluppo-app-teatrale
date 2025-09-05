import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Importazione delle pagine
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';
import DownloadPage from './pages/DownloadPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';

// Importazione del contesto di autenticazione
import { AuthProvider } from './context/AuthContext';

// Importazione dei componenti
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/editor/:projectId" element={<EditorPage />} />
            <Route path="/preview/:projectId" element={<PreviewPage />} />
            <Route path="/download/:projectId" element={<DownloadPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;