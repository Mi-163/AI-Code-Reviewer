"use client";

import { useState } from "react";

export default function Home() {
  // React 'memory'
  const [code, setCode] = useState("");

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Section */}
        <h1 className="text-4xl font-bold text-center">AI Code Reviewer</h1>
        <p className="text-center text-slate-400">
          Paste your code below for a complete syntax, security, and logic analysis.
        </p>

        {/* The Text Area (Input) */}
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
          <textarea
            className="w-full h-96 p-4 bg-slate-900 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {/* Action Bar: File Upload and Submit Button */}
        <div className="flex justify-between items-center">

          {/* File Upload Input */}
          <div>
            <input
              type="file"
              className="text-sm text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-slate-700 file:text-blue-400
                hover:file:bg-slate-600 transition-all cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/30">
            Analyze Code
          </button>

        </div>

      </div>
    </main>
  );
}