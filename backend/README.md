# Backend Teatro AI

Backend per l'applicazione di trasformazione di copioni teatrali in video, sviluppato con FastAPI.

## Requisiti

- Python 3.8 o superiore
- Dipendenze elencate in `requirements.txt`

## Installazione

1. Creare un ambiente virtuale:

```bash
python -m venv .venv
```

2. Attivare l'ambiente virtuale:

- Windows:
```bash
.venv\Scripts\activate
```

- Linux/Mac:
```bash
source .venv/bin/activate
```

3. Installare le dipendenze:

```bash
pip install -r requirements.txt
```

4. Configurare le variabili d'ambiente:

Copiare il file `.env.example` in `.env` e modificare i valori secondo le proprie esigenze, in particolare inserire le API key necessarie per i servizi esterni.

## Avvio del server

```bash
uvicorn main:app --reload
```

Il server sarà disponibile all'indirizzo http://localhost:8000

## Documentazione API

La documentazione interattiva delle API è disponibile all'indirizzo:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Struttura del progetto

```
backend/
├── app/
│   ├── api/            # Definizione delle route API
│   ├── core/           # Configurazioni e funzionalità core
│   ├── models/         # Modelli dati (Pydantic)
│   ├── services/       # Servizi (parser, TTS, video)
│   └── utils/          # Utilità varie
├── tests/              # Test
├── .env                # Variabili d'ambiente
├── main.py             # Punto di ingresso dell'applicazione
└── requirements.txt    # Dipendenze
```

## Flusso di lavoro

1. Upload del copione teatrale
2. Parsing e analisi del testo
3. Generazione audio per le battute dei personaggi
4. Generazione video per le scene
5. Composizione del video finale
6. Download del risultato

## API Endpoints

- `POST /api/upload-script`: Carica un copione teatrale
- `GET /api/projects`: Ottiene la lista di tutti i progetti
- `GET /api/projects/{project_id}`: Ottiene i dettagli di un progetto specifico
- `POST /api/generate-audio/{project_id}`: Avvia la generazione audio
- `POST /api/generate-video/{project_id}`: Avvia la generazione video
- `GET /api/status/{project_id}`: Ottiene lo stato di avanzamento
- `GET /api/download/{project_id}`: Ottiene l'URL per il download del video
- `DELETE /api/projects/{project_id}`: Elimina un progetto