"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // State for the Copy button

  const isRequestInFlight = useRef(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!code.trim() || isRequestInFlight.current) return;

    isRequestInFlight.current = true;
    setIsAnalyzing(true);
    setResults(null);
    setIsCopied(false); // Reset copy state on new analysis

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
      isRequestInFlight.current = false;
    }
  };

  // Copy Function
  const handleCopy = () => {
    if (results && results.ai_feedback) {
      navigator.clipboard.writeText(results.ai_feedback);
      setIsCopied(true);
      // Change the button text back to "Copy" after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // The Download Function 
  const handleDownload = () => {
    if (results && results.ai_feedback) {
      //  Create a "Blob" (a file-like object) containing the markdown text
      const blob = new Blob([results.ai_feedback], { type: "text/markdown" });
      //  Create a temporary, invisible link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      //  Name the file
      link.download = "ai-code-review.md";
      //  Fake a click on the link to trigger the download, then clean it up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
            <input
              type="file"
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                {results.status === "success" ? "Analysis Complete" : "Analysis Error"}
              </h2>

              {/* --- UPDATED: The Action Buttons --- */}
              {results.status === "success" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    {isCopied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    💾 Download .md
                  </button>
                </div>
              )}
            </div>

            {results.status === "error" && (
              <p className="text-red-400 bg-red-900/20 p-4 rounded border border-red-800">
                {results.message}
              </p>
            )}

            {results.ai_feedback && (
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 overflow-x-auto space-y-4">
                {/* The Markdown Renderer with Custom Tailwind Styling  */}
                <ReactMarkdown
                  components={{
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-blue-300 mt-6 mb-2 border-b border-slate-700 pb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="text-slate-300 leading-relaxed mb-3" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 text-slate-300 space-y-1 mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-blue-100" {...props} />,

                    /* Fixed Code Block Styling */
                    pre: ({ node, ...props }) => (
                      <div className="bg-black p-4 rounded-md overflow-x-auto my-4 border border-slate-700 shadow-inner">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, className, children, ...props }) => {
                      // Check if it's a block of code by looking for a language tag or newlines
                      const match = /language-(\w+)/.exec(className || "");
                      const isBlock = match || String(children).includes("\n");

                      return isBlock ? (
                        <code className={`text-slate-300 font-mono text-sm ${className || ""}`} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono mx-1" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {results.ai_feedback}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}