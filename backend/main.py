from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(
    title="Teatro AI API",
    description="API per la trasformazione di copioni teatrali in video",
    version="0.1.0"
)

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, specificare domini consentiti
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montaggio delle routes API
app.include_router(api_router, prefix="/api")

# Montaggio cartella static per file generati
if not os.path.exists("uploads"):
    os.makedirs("uploads")
if not os.path.exists("output"):
    os.makedirs("output")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/output", StaticFiles(directory="output"), name="output")

@app.get("/")
async def root():
    return {"message": "Benvenuto nell'API di Teatro AI"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)