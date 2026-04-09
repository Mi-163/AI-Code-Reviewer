"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");

  // memory block to store the response from Python
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  //  Bridge Function
  const handleAnalyze = async () => {
    // Don't send empty requests
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      // Throw the data over to the Python server
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code, language: "auto" }),
      });

      // Wait for Python to send a message back
      const data = await response.json();
      setResults(data); // Save Python's response to our memory
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the backend engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-4xl font-bold text-center">AI Code Reviewer</h1>
        <p className="text-center text-slate-400">
          Paste your code below for a complete syntax, security, and logic analysis.
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
            <input
              type="file"
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-blue-400 hover:file:bg-slate-600 transition-all cursor-pointer"
            />
          </div>

          {/*  wired our function to the onClick event of this button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/30"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>

        {/* The Results Dashboard  */}
        {/* If 'results' exists in  memory, draw this box on the screen */}
        {results && (
          <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-green-500/30">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Analysis Complete</h2>
            <p className="text-slate-300">Status: {results.status}</p>
            <p className="text-slate-300">{results.message}</p>
            <p className="text-slate-300 font-mono mt-2 bg-slate-900 p-2 rounded">
              Characters processed: {results.characters_received}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}