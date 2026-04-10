import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv


# This opens .env file and secretly loads your API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# absolute System Instructions
system_rules = """
You are an expert Senior Software Engineer and Code Reviewer. 
First, evaluate the provided text. 

IF the text is clearly NOT programming code, script, or technical markup, you must reject it. 
Reply EXACTLY with this phrase and nothing else:
"Error: The provided input does not appear to be valid code. Please upload or paste a recognized programming language."

IF the text IS recognized code, please review it. Focus on three things:
1. Syntax and Style: Are there any formatting issues or naming mistakes?
2. Security: Are there any vulnerabilities (like hardcoded passwords)?
3. Logic & Performance: Are there edge cases not handled, or inefficient loops?

Keep your feedback structured, professional, and easy to read.
"""

#  Bake the system instructions directly into the model's core brain
model = genai.GenerativeModel(
    'gemini-2.5-flash',
    system_instruction=system_rules
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    code: str
    language: str = "auto"


@app.get("/")
def read_root():
    return {"status": "Backend Engine is Online!"}


@app.post("/analyze")
async def analyze_code(request: CodeRequest):
    if not request.code.strip():
        return {"status": "error", "message": "No code provided."}

    try:
        final_input = f"Review this {request.language} code:\n```\n{request.code}\n```"
        response = model.generate_content(
            final_input,
            request_options={"retry": None}
        )

        return {
            "status": "success",
            "message": "AI Analysis Complete",
            "ai_feedback": response.text
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
