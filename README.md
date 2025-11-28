# Teatro AI - Web App per Trasformare Copioni Teatrali in Video

Teatro AI è un'applicazione web che permette di caricare copioni teatrali e trasformarli automaticamente in video completi con attori virtuali, voci sincronizzate, scenografie e musiche.

## Funzionalità Principali

1. **Parsing e Analisi del Copione**

   - Riconoscimento automatico di personaggi, battute e didascalie
   - Struttura dati JSON per rappresentare lo spettacolo

2. **Generazione Audio (Text-to-Speech)**

   - Voci realistiche per ogni personaggio
   - Opzioni di personalizzazione (tono, età, accento)

3. **Generazione Video**

   - Avatar 3D o attori virtuali realistici
   - Sincronizzazione labiale automatica
   - Ambientazioni generate dalle descrizioni

4. **Scenografie e Atmosfera**

   - Ambienti coerenti con le didascalie
   - Musiche ed effetti sonori

5. **Interfaccia Web**

   - Frontend moderno e responsivo (React + TailwindCSS)
   - Upload drag&drop dei file
   - Anteprima e modifica scene

6. **Backend**

   - Gestione processi (Python con FastAPI)
   - Elaborazione e generazione contenuti

7. **Storage e Output**

   - Salvataggio scene in cloud
   - Composizione video finale (FFmpeg)
   - Download o condivisione

8. **Extra**
   - Stili video personalizzabili
   - Modalità storyboard

## Struttura del Progetto

/teatro-ai
/frontend # Applicazione React
/backend # API FastAPI
/docs # Documentazione

## Installazione e Avvio

### Frontend (Modalità Standalone)

```bash
cd frontend
npm install
npm start
```

L'applicazione si avvierà su `http://localhost:3000`

**Nota:** Attualmente l'app funziona in modalità standalone senza backend. Tutte le funzionalità utilizzano dati mock salvati in localStorage.

## Tecnologie Utilizzate

- **Frontend**: React, TailwindCSS
- **Backend**: Python, FastAPI
- **Text-to-Speech**: ElevenLabs API / Azure Cognitive Services / Google Cloud
- **Generazione Video**: Pika Labs / Runway Gen-3 / Kaiber AI / Unreal Engine + Metahuman / Unity
- **Scenografie**: Stable Diffusion (ControlNet)
- **Video Processing**: FFmpeg
