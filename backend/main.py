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
    if not NVIDIA_API_KEY:
        return {"reply": "🔥 Error: NVIDIA_API_KEY environment variable is not set"}
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {NVIDIA_API_KEY}"
    }

    payload = {
        "model": "nvidia/llama-3.1-8b-instruct-q4_0",  # Using a more common model
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Please give your final answer directly and do not show your reasoning or thought process."
            },
            {"role": "user", "content": msg.message}
        ],
        "temperature": 0.6,
        "top_p": 0.95,
        "max_tokens": 2048,  # Reduced token limit
        "stream": False
    }

    try:
        print(f"🔄 Sending request to NVIDIA API with message: {msg.message}")
        
        response = requests.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload),
            timeout=30
        )

        print(f"📡 NVIDIA API Response Status: {response.status}")
        
        # Check if the request was successful
        if response.status_code != 200:
            error_text = response.text
            print(f"❌ NVIDIA API Error: {error_text}")
            return {"reply": f"🔥 NVIDIA API Error (Status {response.status_code}): {error_text}"}

        data = response.json()
        print(f"📄 NVIDIA API Response: {data}")
        
        # Check if the response has the expected structure
        if "choices" not in data:
            print(f"❌ Unexpected response structure: {data}")
            return {"reply": f"🔥 Unexpected API response format: {str(data)}"}
        
        if not data["choices"] or len(data["choices"]) == 0:
            return {"reply": "🔥 No response generated from the AI model"}
        
        if "message" not in data["choices"][0]:
            return {"reply": f"🔥 Invalid response structure: {str(data['choices'][0])}"}
        
        if "content" not in data["choices"][0]["message"]:
            return {"reply": f"🔥 No content in response: {str(data['choices'][0]['message'])}"}
        
        reply = data["choices"][0]["message"]["content"].strip()
        print(f"✅ Generated reply: {reply}")
        
        return {"reply": reply}

    except requests.exceptions.Timeout:
        print("⏰ Request timeout")
        return {"reply": "🔥 Request timeout - the AI model is taking too long to respond"}
    
    except requests.exceptions.RequestException as e:
        print(f"🌐 Network error: {e}")
        return {"reply": f"🔥 Network error: {str(e)}"}
    
    except json.JSONDecodeError as e:
        print(f"📄 JSON decode error: {e}")
        return {"reply": f"🔥 Invalid response format: {str(e)}"}
    
    except Exception as e:
        print(f"🔥 Backend error: {e}")
        return {"reply": f"🔥 Backend error: {str(e)}"}
