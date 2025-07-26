from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import requests

app = FastAPI()

# Allow all origins for now (you can restrict to your Vercel domain later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Welcome route at /
@app.get("/")
def read_root():
    return {
        "message": "✅ Backend is live! Use POST /chat to talk to the AI."
    }

# Info route at /chat (for testing GET)
@app.get("/chat")
def chat_info():
    return {
        "message": "This endpoint expects a POST request with a JSON message."
    }

# Actual chat endpoint (POST only)
@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    if not user_message:
        return {"reply": "⚠️ No message provided."}

    # Send request to NVIDIA API
    try:
        NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

        nvidia_response = requests.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {NVIDIA_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
                "messages": [
                    {"role": "system", "content": "detailed thinking on"},
                    {"role": "user", "content": user_message}
                ],
                "max_tokens": 1024,
                "temperature": 0.7
            }
        )

        response_json = nvidia_response.json()

        if "choices" in response_json and response_json["choices"]:
            reply = response_json["choices"][0]["message"]["content"]
            return {"reply": reply}

        return {"reply": "⚠️ Unexpected response from NVIDIA."}

    except Exception as e:
        return {"reply": f"🔥 Backend error: {str(e)}"}
