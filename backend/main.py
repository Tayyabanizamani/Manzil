
import json, os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

from prompt import SYSTEM_PROMPT
from validate import normalize

load_dotenv()
BASE = Path(__file__).parent
# Tries these in order and remembers the first one that works for your key.
# Put your own choice first with MODEL=... in .env
CANDIDATES = [m for m in [os.getenv("MODEL"), "gemini-flash-latest", "gemini-3.1-flash-lite",
              "gemini-3-flash-preview", "gemini-flash-lite-latest", "gemini-2.5-flash"] if m]
MODEL = CANDIDATES[0]
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Req(BaseModel):
    job: str = Field(min_length=2, max_length=80)
    skills: list[str] = Field(default_factory=list, max_length=30)
    level: str = "beginner"
    hours_per_week: int = Field(default=8, ge=1, le=60)
    weeks: int = Field(default=8, ge=2, le=16)

def fallback(note):
    data = json.loads((BASE / "fallback.json").read_text(encoding="utf-8"))
    data["_fallback"] = note
    return data

def ask_ai(r: Req):
    global MODEL
    last = None
    for model in [MODEL] + [m for m in CANDIDATES if m != MODEL]:
        try:
            resp = client.models.generate_content(
                model=model,
                contents=json.dumps(r.model_dump()),
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.4,
                    max_output_tokens=8000,
                ),
            )
            text = resp.text.strip()
            text = text[text.find("{"): text.rfind("}") + 1]
            result = normalize(json.loads(text), r.weeks)
            MODEL = model                      # remember the working model
            return result
        except Exception as e:
            last = e
            print(f"Model {model} failed:", str(e)[:200])
    raise last

@app.get("/api/models")
def models():
    """Shows which models YOUR key can use."""
    try:
        names = [m.name.replace("models/", "") for m in client.models.list()
                 if "generateContent" in (m.supported_actions or [])]
        return {"available": names, "using": MODEL}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/health")
def health():
    return {"ok": True, "model": MODEL, "key_set": bool(os.getenv("GEMINI_API_KEY"))}

@app.post("/api/roadmap")
def roadmap(r: Req):
    last = None
    for attempt in range(2):          # one retry on bad JSON or a temporary error
        try:
            return ask_ai(r)
        except Exception as e:
            last = e
            print(f"AI attempt {attempt + 1} failed:", e)
    return fallback(str(last))

# Serve the frontend from the same server
app.mount("/", StaticFiles(directory=BASE.parent / "frontend", html=True), name="web")
