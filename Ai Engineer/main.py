import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from pydantic import BaseModel
import tensorflow as tf
from tensorflow.keras.layers import Layer
import requests 

app = FastAPI(title="SisaBisa AI Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("[Loading] Memuat artefak AI SisaBisa...")

# =====================================================================
# PATCH SAPU JAGAT: AMANKAN SEMUA LAYER DARI QUANTIZATION_CONFIG
# =====================================================================
from keras.src.layers.layer import Layer
original_layer_init = Layer.__init__

def patched_layer_init(self, *args, **kwargs):
    kwargs.pop('quantization_config', None)
    original_layer_init(self, *args, **kwargs)

Layer.__init__ = patched_layer_init
# =====================================================================

# =====================================================================
# JALUR NINJA: SUBCLASS LANGSUNG DARI DENSE LAYER
# (Mengakali bentrok Keras 2 vs Keras 3 dalam membaca hirarki variabel)
# =====================================================================
@tf.keras.utils.register_keras_serializable(package='Custom', name='IngredientSynergyLayer')
class IngredientSynergyLayer(tf.keras.layers.Dense):
    def __init__(self, units=64, **kwargs):
        # Paksa AI untuk menganggap ini sebagai layer Dense biasa dengan aktivasi ReLU
        kwargs['activation'] = 'relu'
        super().__init__(units=units, **kwargs)

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config

# Load Model
tower_kulkas = tf.keras.models.load_model(
    "tower_kulkas.keras", 
    custom_objects={"IngredientSynergyLayer": IngredientSynergyLayer},
    compile=False
)
resep_embeddings = np.load("resep_embeddings.npy")

with open("tokenizer.json", "r", encoding="utf-8") as f:
    tokenizer_data = f.read()
    tokenizer = tf.keras.preprocessing.text.tokenizer_from_json(tokenizer_data)

df_resep = pd.read_excel("dataset_resep_format_final.xlsx") 

print("[OK] Semua komponen AI Berhasil Dimuat!")

# =====================================================================
# ENDPOINT 1: REKOMENDASI RESEP (TWO-TOWER MODEL)
# =====================================================================
class RekomendasiRequest(BaseModel):
    bahan_user: str  
    bahan_mau_basi: str = ""  

@app.post("/api/rekomendasi")
def cari_rekomendasi(request: RekomendasiRequest):
    try:
        input_text = request.bahan_user.lower().strip()
        seq = tokenizer.texts_to_sequences([input_text])
        pad = tf.keras.preprocessing.sequence.pad_sequences(
            seq, maxlen=40, padding="post"
        )

        vektor_kulkas = tower_kulkas.predict(pad, verbose=0)[0]
        
        eps = 1e-9 
        vektor_kulkas_norm = vektor_kulkas / (np.linalg.norm(vektor_kulkas) + eps)
        resep_embeddings_norm = resep_embeddings / (np.linalg.norm(resep_embeddings, axis=1, keepdims=True) + eps)
        
        raw_scores = np.dot(resep_embeddings_norm, vektor_kulkas_norm)
        scores = (raw_scores + 1.0) / 2.0  

        df_temp = df_resep.copy()
        df_temp["score"] = scores

        if request.bahan_mau_basi.strip():
            bahan_basi = request.bahan_mau_basi.lower().strip()
            df_temp = df_temp[df_temp["bahan"].apply(
                lambda x: bahan_basi in [b.strip().lower() for b in str(x).split(",")]
            )]

        if df_temp.empty:
            return {"status": "success", "message": "Tidak ada resep cocok", "results": []}

        top_resep = df_temp.sort_values(by="score", ascending=False).head(5)
        results = []
        for _, row in top_resep.iterrows():
            persentase = round(row['score'] * 100)
            persentase = max(0, min(persentase, 100))
            
            results.append({
                "nama_menu": row["nama_menu"],
                "bahan_resep": row["bahan"],
                "persentase_kecocokan": f"{persentase}%",
            })

        return {"status": "success", "results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# ENDPOINT 2: DETAIL RESEP & NUTRISI (GROQ LLAMA-3.1 AI)
# =====================================================================
class DetailRequest(BaseModel):
    nama_menu: str
    bahan_resep: str

@app.post("/api/detail-resep")
def dapatkan_detail(request: DetailRequest):
    prompt = f"""
    [SYSTEM INSTRUCTIONS]
    Kamu adalah AI kelas dunia yang menggabungkan 3 keahlian profesional: Master Chef, Ahli Gizi Klinis, dan Konsultan Kebugaran.
    Tugas utamamu adalah menganalisis menu masakan dan bahan sisa yang diberikan, lalu menyusun resep yang logis, praktis, dan bernutrisi.

    [INPUT DATA]
    Menu Target: {request.nama_menu}
    Bahan Tersedia: {request.bahan_resep}
    
    [PROCESSING RULES - STRICT!]
    1. ANALISIS BAHAN: Gunakan bahan yang tersedia secara efisien. Tambahkan bumbu dasar umum secara logis jika diperlukan agar rasa masakan lezat.
    2. WAKTU & KESULITAN: Berikan estimasi waktu masak yang realistis dan tingkat kesulitan (Mudah/Sedang/Sulit).
    3. LANGKAH MEMASAK: Tulis 4-5 langkah berurutan yang ringkas, *action-oriented*, dan mudah diikuti oleh pemula.
    4. MAKRO NUTRISI: Hitung estimasi nutrisi (Kalori, Protein, Karbohidrat, Lemak, Serat) seakurat mungkin untuk 1 porsi standar.
    5. INSIGHT KESEHATAN: Berikan 1-2 kalimat analisis tajam mengapa menu ini bagus untuk tubuh. Fokuskan pada aspek seperti optimalisasi gizi, kontrol kalori, atau manfaat bahan spesifik.

    [OUTPUT FORMAT]
    Keluarkan respons HANYA DALAM FORMAT JSON murni. DILARANG KERAS menambahkan teks pengantar, penutup, atau markdown formatting. 
    Struktur JSON harus persis seperti ini:
    {{
        "waktu_masak": "...",
        "tingkat_kesulitan": "...",
        "langkah_memasak": [
            "1. ...",
            "2. ..."
        ],
        "fakta_nutrisi": {{
            "kalori": "... kkal",
            "protein": "... g",
            "karbohidrat": "... g",
            "lemak": "... g",
            "serat": "... g"
        }},
        "insight_kesehatan": "..."
    }}
    """
    
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}, 
        "temperature": 0.5
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response_json = response.json()
        
        if "error" in response_json:
            raise Exception(response_json["error"].get("message", "Groq API Error"))
            
        text_output = response_json['choices'][0]['message']['content']
        json_data = json.loads(text_output)
        
        return {"status": "success", "data": json_data, "sumber": "groq_llama3.1"}
        
    except Exception as e:
        print(f"[Warning] Gen-AI gagal diakses, menggunakan sistem Fallback. Reason: {str(e)}")
        fallback_data = {
            "waktu_masak": "20 menit",
            "tingkat_kesulitan": "Sedang",
            "langkah_memasak": [
                f"1. Siapkan semua bahan, terutama {request.bahan_resep}.",
                f"2. Panaskan wajan dan olah bumbu dasar hingga harum.",
                f"3. Masukkan bahan-bahan untuk meracik {request.nama_menu}, aduk rata hingga matang.",
                "4. Koreksi rasa, angkat, dan sajikan selagi hangat."
            ],
            "fakta_nutrisi": {
                "kalori": "320 kkal",
                "protein": "15g",
                "karbohidrat": "35g",
                "lemak": "10g",
                "serat": "5g"
            },
            "insight_kesehatan": "Kombinasi bahan pada menu ini memberikan keseimbangan makronutrisi yang baik untuk pemulihan energi harian tubuh."
        }
        return {"status": "success", "data": fallback_data, "sumber": "sistem_fallback"}
