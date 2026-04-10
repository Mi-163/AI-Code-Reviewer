"use client";


import { useState, useRef } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isRequestInFlight = useRef(false); // declare lock
  //  File Reader Function
  const handleFileUpload = (e) => {
    // Grab the actual file the user selected
    const file = e.target.files[0];
    if (!file) return;

    // browser FileReader
    const reader = new FileReader();

    // Tell the reader what to do once it finishes opening the file
    reader.onload = (event) => {
      // Dump the text from the file into our main text box memory
      setCode(event.target.result);
    };

    // Tell the reader to read the file as plain text
    reader.readAsText(file);
  };

  // The API Bridge Function
  // add guard and lock 
  const handleAnalyze = async () => {
    if (!code.trim() || isRequestInFlight.current) return;

    isRequestInFlight.current = true; // lock


    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code, language: "auto" }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the backend engine.");
    } finally {
      setIsAnalyzing(false);
      isRequestInFlight.current = false; // unlock door when finished
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-4xl font-bold text-center">AI Code Reviewer</h1>
        <p className="text-center text-slate-400">
          Paste your code below or upload a file for a complete syntax, security, and logic analysis.
        </p>

        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
          <textarea
            className="w-full h-96 p-4 bg-slate-900 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            {/*  Wired the onChange event to handleFileUpload function*/}
            <input
              type="file"
              //accept=".js,.py,.c,.cpp,.java,.html,.css,.txt"
              onChange={handleFileUpload}
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-blue-400 hover:file:bg-slate-600 transition-all cursor-pointer"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/30"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>

        {/* The Results Dashboard */}
        {results && (
          <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-blue-500/30 shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              {results.status === "success" ? "Analysis Complete" : "Analysis Error"}
            </h2>

            {results.status === "error" && (
              <p className="text-red-400 bg-red-900/20 p-4 rounded border border-red-800">
                {results.message}
              </p>
            )}

            {results.ai_feedback && (
              <div className="whitespace-pre-wrap text-slate-300 bg-slate-900 p-6 rounded-lg border border-slate-700 font-mono text-sm leading-relaxed overflow-x-auto">
                {results.ai_feedback}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}