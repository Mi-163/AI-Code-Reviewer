from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize the application
app = FastAPI(title="AI Code Reviewer API")

# cors- Allow the frontend (port 3000) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all actions (GET, POST, etc.)
    allow_headers=["*"],
)

# structure
# Define exactly what data is expected to receive from the frontend


class CodeRequest(BaseModel):
    code: str
    language: str = "auto"

# endpoints


@app.get("/")
def read_root():
    return {"status": "Backend Engine is Online!"}

# bridge connection


@app.post("/analyze")
def analyze_code(request: CodeRequest):
    # For now, we will just measure the length of the code to prove it arrived
    character_count = len(request.code)

    return {
        "status": "success",
        "message": "Code successfully received by the Python engine!",
        "characters_received": character_count
    }
