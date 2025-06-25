from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("MY_API_KEY")

app = FastAPI()

# Allow frontend from Live Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    message: str


@app.post("/chat")
def chat(msg: Message):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
            {"role": "system", "content": "You are a helpful smart shopping assistant."},
            {"role": "user", "content": msg.message}
        ]
    }

    try:
        res = requests.post("https://openrouter.ai/api/v1/chat/completions",
                            headers=headers, json=payload)
        res.raise_for_status()
        return {"reply": res.json()["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"reply": f"⚠️ Error: {str(e)}"}
