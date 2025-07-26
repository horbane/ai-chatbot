from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

class ChatMessage(BaseModel):
    message: str

@app.get("/")
def root():
    return {"message": "✅ Backend is live! Use POST /chat to talk to the AI."}

@app.post("/chat")
def chat(msg: ChatMessage):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {NVIDIA_API_KEY}"
    }

    payload = {
        "model": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Please give your final answer directly and do not show your reasoning or thought process."
            },
            {"role": "user", "content": msg.message}
        ],
        "temperature": 0.6,
        "top_p": 0.95,
        "max_tokens": 4096,
        "stream": False
    }

    try:
        response = requests.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload)
        )

        data = response.json()
        reply = data["choices"][0]["message"]["content"].strip()

        return {"reply": reply}

    except Exception as e:
        print("🔥 Backend error:", e)
        return {"reply": f"🔥 Backend error: {str(e)}"}
