# AI Code Reviewer 🚀

A professional-grade, full-stack AI Orchestrator that performs deep analysis on Python code. It combines static analysis, security auditing, and Generative AI to provide a 360-degree review of code quality.

**Live Demo:** [https://ai-code-reviewer-five-pearl.vercel.app](https://ai-code-reviewer-five-pearl.vercel.app)

## ✨ Features

- **Multi-Engine Analysis:**
  - **Static Analysis:** Uses Flake8 to identify PEP 8 violations and formatting issues.
  - **Security Auditing:** Uses Bandit to detect common security vulnerabilities.
  - **AI Logic Review:** Integrates Google Gemini 1.5 Pro to explain logic flaws and suggest optimized solutions.
- **Modern Dashboard:** Built with Next.js and Tailwind CSS, featuring severity-based filtering.
- **Export Capabilities:** One-click Copy-to-Clipboard or Download as a Markdown report.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS.
- **Backend:** FastAPI (Python), Flake8, Bandit.
- **AI Model:** Google Gemini 1.5 Pro API.
- **Hosting:** Vercel (Frontend) & Render (Backend).

---

## 💻 Local Setup (Beginner Friendly)

### 1. Prerequisites
- Install Python 3.9+
- Install Node.js

### 2. Backend Setup
1. Open terminal and navigate to backend:
   `cd backend`
2. Create and activate virtual environment:
   - Windows: `python -m venv venv && venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv venv && source venv/bin/activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Create a `.env` file in the `backend/` folder:
   `GEMINI_API_KEY=your_actual_key_here`
5. Start the server:
   `uvicorn main:app --reload`

### 3. Frontend Setup
1. Open a new terminal and navigate to frontend:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. **Configure API URL:**
   Open `src/app/page.js` and find the `fetch` call (around line 39). 
   - **For Local Development:** Change the URL to `http://localhost:8000/analyze`
   - **For Production:** Keep the URL as your `onrender.com` link.
4. Run the app:
   `npm run dev`

Visit **http://localhost:3000** in your browser.

---

## 🌐 How to Host Your Own

### Step 1: Backend (Render)
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:** Add your `GEMINI_API_KEY`.

### Step 2: Frontend (Vercel)
- **Root Directory:** `frontend`
- **Framework Preset:** Next.js
- **Note:** Ensure `page.js` points to your live Render URL before pushing to GitHub for deployment.

---

## 👨‍💻 Creator
**Mi-163** [GitHub Profile](https://github.com/Mi-163)

---
*Developed as a full-stack portfolio project focusing on AI integration and Cloud Architecture.*