import os
from typing import Dict, List, Optional

class VideoStyleService:
    """Servizio per la gestione degli stili video"""
    
    def __init__(self):
        """Inizializza il servizio degli stili video"""
        # Definizione degli stili predefiniti
        self.available_styles = {
            "classic": {
                "name": "Classico",
                "description": "Stile teatrale classico con illuminazione tradizionale",
                "filters": {
                    "contrast": 1.1,
                    "saturation": 1.0,
                    "brightness": 1.0,
                    "color_temperature": 5500
                },
                "transitions": "fade",
                "aspect_ratio": "16:9"
            },
            "noir": {
                "name": "Film Noir",
                "description": "Stile drammatico in bianco e nero con contrasti forti",
                "filters": {
                    "contrast": 1.4,
                    "saturation": 0.0,
                    "brightness": 0.9,
                    "color_temperature": 0
                },
                "transitions": "fade",
                "aspect_ratio": "16:9"
            },
            "vintage": {
                "name": "Vintage",
                "description": "Stile retrò con effetto pellicola d'epoca",
                "filters": {
                    "contrast": 1.2,
                    "saturation": 0.8,
                    "brightness": 0.95,
                    "color_temperature": 4000
                },
                "transitions": "dissolve",
                "aspect_ratio": "4:3"
            },
            "modern": {
                "name": "Moderno",
                "description": "Stile contemporaneo con colori vivaci",
                "filters": {
                    "contrast": 1.1,
                    "saturation": 1.2,
                    "brightness": 1.05,
                    "color_temperature": 6500
                },
                "transitions": "smooth",
                "aspect_ratio": "16:9"
            },
            "dramatic": {
                "name": "Drammatico",
                "description": "Stile intenso con illuminazione teatrale",
                "filters": {
                    "contrast": 1.3,
                    "saturation": 0.9,
                    "brightness": 0.9,
                    "color_temperature": 5000
                },
                "transitions": "fade",
                "aspect_ratio": "2.35:1"
            }
        }
    
    def get_available_styles(self) -> List[Dict]:
        """Restituisce la lista degli stili disponibili"""
        return [
            {
                "id": style_id,
                "name": style["name"],
                "description": style["description"]
            }
            for style_id, style in self.available_styles.items()
        ]
    
    def get_style_config(self, style_id: str) -> Dict:
        """Restituisce la configurazione completa di uno stile"""
        if style_id in self.available_styles:
            return self.available_styles[style_id]
        else:
            # Stile predefinito se non trovato
            return self.available_styles["classic"]
    
    def apply_style_to_ffmpeg_command(self, cmd: List[str], style_id: str) -> List[str]:
        """Applica uno stile a un comando FFmpeg"""
        if style_id not in self.available_styles:
            style_id = "classic"
        
        style = self.available_styles[style_id]
        filters = style["filters"]
        
        # Costruzione della stringa di filtri FFmpeg
        filter_str = ""
        
        # Contrasto
        if filters["contrast"] != 1.0:
            filter_str += f"eq=contrast={filters['contrast']}:"
        else:
            filter_str += "eq=contrast=1.0:"
        
        # Saturazione
        if filters["saturation"] != 1.0:
            filter_str += f"saturation={filters['saturation']}:"
        else:
            filter_str += "saturation=1.0:"
        
        # Luminosità
        if filters["brightness"] != 1.0:
            filter_str += f"brightness={filters['brightness']}"
        else:
            filter_str += "brightness=1.0"
        
        # Temperatura colore (se non è bianco e nero)
        if filters["color_temperature"] > 0:
            # Implementazione semplificata della temperatura colore
            if filters["color_temperature"] < 5500:
                # Più caldo (giallastro)
                warmth = (5500 - filters["color_temperature"]) / 1500
                filter_str += f",colorbalance=rs=0:gs=0:bs={-warmth}:rm=0:gm=0:bm={-warmth}"
            elif filters["color_temperature"] > 5500:
                # Più freddo (bluastro)
                coolness = (filters["color_temperature"] - 5500) / 1500
                filter_str += f",colorbalance=rs={-coolness}:gs=0:bs=0:rm={-coolness}:gm=0:bm=0"
        
        # Aspect ratio
        if style["aspect_ratio"] != "16:9":
            filter_str += f",setdar=dar={style['aspect_ratio'].replace(':', '/')}"
        
        # Aggiunta dei filtri al comando
        filter_idx = -1
        for i, arg in enumerate(cmd):
            if arg == "-vf" and i < len(cmd) - 1:
                filter_idx = i + 1
                break
        
        if filter_idx >= 0:
            # Aggiunta ai filtri esistenti
            cmd[filter_idx] = cmd[filter_idx] + "," + filter_str
        else:
            # Aggiunta come nuovo filtro
            cmd.extend(["-vf", filter_str])
        
        return cmd


class StoryboardService:
    """Servizio per la generazione di storyboard"""
    
    def __init__(self):
        """Inizializza il servizio di storyboard"""
        pass
    
    async def generate_storyboard(self, script, output_dir: str) -> Dict:
        """Genera uno storyboard per un copione"""
        try:
            # Creazione directory output se non esiste
            os.makedirs(output_dir, exist_ok=True)
            
            # Generazione nome file
            storyboard_filename = f"storyboard_{script.id}.pdf"
            storyboard_path = os.path.join(output_dir, storyboard_filename)
            
            # In un'implementazione reale, qui si genererebbe lo storyboard
            # Per ora, creiamo un file di placeholder
            with open(storyboard_path, "w") as f:
                f.write("Placeholder per storyboard")
            
            return {
                "success": True,
                "filename": storyboard_filename,
                "path": storyboard_path
            }
            
        except Exception as e:
            print(f"Errore nella generazione dello storyboard: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }