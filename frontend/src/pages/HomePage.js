import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Trasforma i tuoi <span className="text-primary-600">copioni teatrali</span> in video
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Teatro AI converte automaticamente i tuoi copioni in video completi con attori virtuali, voci sincronizzate, scenografie e musiche.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/upload" className="btn-primary text-lg py-3 px-8">
            Inizia ora
          </Link>
          <a href="#come-funziona" className="btn-secondary text-lg py-3 px-8">
            Scopri di più
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="come-funziona" className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Come funziona</h2>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Carica il copione</h3>
            <p className="text-gray-600">Carica il tuo copione in formato .txt, .docx o .pdf. Il sistema analizzerà automaticamente personaggi, battute e didascalie.</p>
          </div>
          
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Personalizza</h3>
            <p className="text-gray-600">Scegli le voci per i personaggi, lo stile visivo e le ambientazioni. Modifica e perfeziona ogni scena secondo le tue preferenze.</p>
          </div>
          
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Genera e scarica</h3>
            <p className="text-gray-600">L'intelligenza artificiale genera il video completo dello spettacolo. Scarica il risultato o condividilo direttamente.</p>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto bg-white rounded-xl shadow-sm">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Esempi</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Guarda alcuni esempi di video generati con Teatro AI
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Esempio video 1</p>
          </div>
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Esempio video 2</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto a trasformare il tuo copione?</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Inizia subito a creare video professionali dal tuo copione teatrale.
        </p>
        <Link to="/upload" className="btn-primary text-lg py-3 px-8">
          Inizia gratuitamente
        </Link>
      </section>
    </div>
  );
};

export default HomePage;