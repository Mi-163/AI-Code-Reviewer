import os
import sys
import asyncio
import tempfile
import json
import traceback
import subprocess
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

system_rules = """
You are an expert Senior Software Engineer and Code Reviewer. 
First, evaluate the provided text. 

IF the text is clearly NOT programming code, script, or technical markup, you must reject it. 
Reply EXACTLY with this phrase and nothing else:
"Error: The provided input does not appear to be valid code."

IF the text IS recognized code, please review it. Focus on:
1. Complex Logic: Are there edge cases not handled?
2. Performance: Are there inefficient loops or memory issues?

Keep your feedback structured, professional, and easy to read. Do NOT focus on minor syntax or standard security flaws, as other tools handle that.
"""

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


#  LAYER 1 - FLAKE8 (STYLE)
async def run_flake8(file_path):
    def execute():
        return subprocess.run(
            [sys.executable, "-m", "flake8", file_path],
            capture_output=True,
            text=True
        )

    process = await asyncio.to_thread(execute)
    stdout = process.stdout

    issues = []
    if stdout:
        for line in stdout.strip().split('\n'):
            # Use regex to find the exact line number pattern (e.g., ":15:62: W291...")
            # This completely ignores Windows drive letter colons
            match = re.search(r':(\d+):\d+:\s+(.*)', line)
            if match:
                issues.append({
                    "line": int(match.group(1)),
                    "severity": "low",
                    "message": match.group(2).strip()
                })
    return issues

#  LAYER 2 - BANDIT (SECURITY)


async def run_bandit(file_path):
    def execute():
        return subprocess.run(
            [sys.executable, "-m", "bandit", "-f", "json", "-q", file_path],
            capture_output=True,
            text=True
        )

    process = await asyncio.to_thread(execute)
    stdout = process.stdout

    try:
        if stdout:
            result = json.loads(stdout)
            issues = []
            for issue in result.get('results', []):
                issues.append({
                    "line": issue['line_number'],
                    "severity": issue['issue_severity'].lower(),
                    "message": issue['issue_text']
                })
            return issues
        return []
    except json.JSONDecodeError:
        return []

# --- LAYER 3 - GEMINI (LOGIC) ---


async def run_gemini(code, language):
    try:
        final_input = f"Review this {language} code:\n```\n{code}\n```"
        response = await model.generate_content_async(
            final_input,
            request_options={"retry": None}
        )
        return response.text
    except Exception as e:
        #  Print the error to your terminal
        print("\n" + "="*30)
        print("GEMINI API ERROR REVEALED")
        print(str(e))
        print("="*30 + "\n")

        return f"⚠️ **AI Review Error**\n\nThe AI encountered an issue. Check your Python terminal for the exact error message."


@app.get("/")
def read_root():
    return {"status": "Backend Engine is Online!"}


@app.post("/analyze")
async def analyze_code(request: CodeRequest):
    if not request.code.strip():
        return {"status": "error", "message": "No code provided."}

    #  Create a temporary file to hold the user's code
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode='w', encoding='utf-8') as temp_file:
        temp_file.write(request.code)
        temp_path = temp_file.name

    try:
        #  Fire all three analysis layers AT THE EXACT SAME TIME
        flake8_task = run_flake8(temp_path)
        bandit_task = run_bandit(temp_path)
        gemini_task = run_gemini(request.code, request.language)

        # Wait for all of them to finish
        style_issues, security_issues, logic_feedback = await asyncio.gather(
            flake8_task, bandit_task, gemini_task
        )

        #  Package it all into Unified JSON Payload
        return {
            "status": "success",
            "message": "Tri-Fold Analysis Complete",
            "data": {
                "style_issues": style_issues,
                "security_issues": security_issues,
                "logic_review": logic_feedback
            }
        }

    except Exception as e:
        # Print the exact error to the Python terminal
        print("====== BACKEND CRASH REPORT ======")
        print(traceback.format_exc())
        print("==================================")

        return {"status": "error", "message": "Backend crashed. Check the Python terminal."}

    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
