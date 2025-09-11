@echo off
echo Attivazione dell'ambiente virtuale...
call .venv\Scripts\activate

echo Installazione delle dipendenze...
pip install -r requirements.txt

echo Avvio del server FastAPI...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause