import os
import logging
from functools import lru_cache
from typing import Dict, List, Optional

from app.core.config import settings

# Configurazione del logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("performance")

class PerformanceOptimizer:
    """Classe per l'ottimizzazione delle prestazioni dell'applicazione"""
    
    def __init__(self):
        """Inizializza l'ottimizzatore di prestazioni"""
        self.cache_enabled = settings.ENABLE_CACHE
        self.max_workers = settings.MAX_WORKERS
        self.batch_size = settings.BATCH_SIZE
        
        # Metriche di performance
        self.metrics = {
            "api_calls": 0,
            "processing_time": {},
            "memory_usage": {},
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    def optimize_video_settings(self, video_quality: str) -> Dict:
        """Ottimizza le impostazioni video in base alla qualità richiesta"""
        if video_quality == "high":
            return {
                "resolution": "1080p",
                "fps": 30,
                "bitrate": "5M",
                "preset": "slow"
            }
        elif video_quality == "medium":
            return {
                "resolution": "720p",
                "fps": 30,
                "bitrate": "2M",
                "preset": "medium"
            }
        else:  # low
            return {
                "resolution": "480p",
                "fps": 24,
                "bitrate": "1M",
                "preset": "fast"
            }
    
    def optimize_audio_settings(self, audio_quality: str) -> Dict:
        """Ottimizza le impostazioni audio in base alla qualità richiesta"""
        if audio_quality == "high":
            return {
                "sample_rate": 48000,
                "bitrate": "192k",
                "channels": 2
            }
        elif audio_quality == "medium":
            return {
                "sample_rate": 44100,
                "bitrate": "128k",
                "channels": 2
            }
        else:  # low
            return {
                "sample_rate": 22050,
                "bitrate": "64k",
                "channels": 1
            }
    
    def track_api_call(self, endpoint: str, duration: float):
        """Traccia una chiamata API per le metriche di performance"""
        self.metrics["api_calls"] += 1
        
        if endpoint not in self.metrics["processing_time"]:
            self.metrics["processing_time"][endpoint] = []
        
        self.metrics["processing_time"][endpoint].append(duration)
        
        # Log per chiamate lente
        if duration > 1.0:  # più di 1 secondo
            logger.warning(f"Chiamata lenta a {endpoint}: {duration:.2f}s")
    
    def track_memory_usage(self, component: str, usage_mb: float):
        """Traccia l'utilizzo della memoria per un componente"""
        if component not in self.metrics["memory_usage"]:
            self.metrics["memory_usage"][component] = []
        
        self.metrics["memory_usage"][component].append(usage_mb)
        
        # Log per utilizzo elevato
        if usage_mb > 500:  # più di 500 MB
            logger.warning(f"Utilizzo memoria elevato per {component}: {usage_mb:.2f} MB")
    
    def get_performance_report(self) -> Dict:
        """Genera un report sulle prestazioni dell'applicazione"""
        report = {
            "total_api_calls": self.metrics["api_calls"],
            "cache_efficiency": self._calculate_cache_efficiency(),
            "average_processing_times": {},
            "average_memory_usage": {}
        }
        
        # Calcolo medie
        for endpoint, times in self.metrics["processing_time"].items():
            if times:
                report["average_processing_times"][endpoint] = sum(times) / len(times)
        
        for component, usages in self.metrics["memory_usage"].items():
            if usages:
                report["average_memory_usage"][component] = sum(usages) / len(usages)
        
        return report
    
    def _calculate_cache_efficiency(self) -> float:
        """Calcola l'efficienza della cache"""
        total = self.metrics["cache_hits"] + self.metrics["cache_misses"]
        if total > 0:
            return self.metrics["cache_hits"] / total
        return 0.0
    
    def reset_metrics(self):
        """Resetta le metriche di performance"""
        self.metrics = {
            "api_calls": 0,
            "processing_time": {},
            "memory_usage": {},
            "cache_hits": 0,
            "cache_misses": 0
        }

# Singleton per l'ottimizzatore
@lru_cache()
def get_performance_optimizer() -> PerformanceOptimizer:
    """Restituisce l'istanza singleton dell'ottimizzatore di prestazioni"""
    return PerformanceOptimizer()