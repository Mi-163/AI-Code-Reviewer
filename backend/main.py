import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv


# This opens .env file and secretly loads your API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Configure the AI engine
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# Initialize the application
app = FastAPI(title="AI Code Reviewer API")

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# structure


class CodeRequest(BaseModel):
    code: str
    language: str = "auto"

# engine


@app.get("/")
def read_root():
    return {"status": "Backend Engine is Online!"}


@app.post("/analyze")
async def analyze_code(request: CodeRequest):
    # Don't analyze empty code
    if not request.code.strip():
        return {"status": "error", "message": "No code provided."}

    try:
        # construct a highly specific set of instructions for the AI

        prompt = f"""
        You are an expert Senior Software Engineer and Code Reviewer. 
        First, evaluate the following text. 

        IF the text is clearly NOT programming code, script, or technical markup (e.g., it is a recipe, a poem, random letters, or a normal conversational paragraph), you must reject it. 
        Reply EXACTLY with this phrase and nothing else:
        "Error: The provided input does not appear to be valid code. Please upload or paste a recognized programming language."

        IF the text IS recognized code, please review it. Focus on three things:
        1. Syntax and Style: Are there any formatting issues or naming mistakes?
        2. Security: Are there any vulnerabilities (like hardcoded passwords)?
        3. Logic & Performance: Are there edge cases not handled, or inefficient loops?

        Keep your feedback structured, professional, and easy to read.

        Text to evaluate:
        {request.code}
        """

        # send the package to Google's servers
        response = model.generate_content(prompt)

        # 3.  send the AI's answer back to your frontend
        return {
            "status": "success",
            "message": "AI Analysis Complete",
            "ai_feedback": response.text
        }

    except Exception as e:
        # If the API fails, catch the error so the server doesn't crash
        return {"status": "error", "message": str(e)}
