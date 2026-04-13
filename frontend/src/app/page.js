"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  //  Tab State for the Tri-Fold Dashboard 
  const [activeTab, setActiveTab] = useState("all");

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
    setIsCopied(false);
    setActiveTab("all"); // Reset to the main dashboard view on new analysis

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

  //  NEW: Helper function to generate Context-Aware export text 
  const getExportContent = () => {
    if (!results || !results.data) return "";

    let content = "";
    if (activeTab === "all" || activeTab === "style") {
      content += "## 🎨 Style & Formatting\n";
      if (results.data.style_issues?.length === 0) {
        content += "No style issues found.\n\n";
      } else {
        results.data.style_issues.forEach(issue => {
          content += `- **Line ${issue.line}**: ${issue.message}\n`;
        });
        content += "\n";
      }
    }

    if (activeTab === "all" || activeTab === "security") {
      content += "## 🛡️ Security Vulnerabilities\n";
      if (results.data.security_issues?.length === 0) {
        content += "No security vulnerabilities detected.\n\n";
      } else {
        results.data.security_issues.forEach(issue => {
          content += `- **Line ${issue.line}** [${issue.severity.toUpperCase()}]: ${issue.message}\n`;
        });
        content += "\n";
      }
    }

    if (activeTab === "all" || activeTab === "logic") {
      content += "## 🧠 AI Logic Analysis\n";
      content += results.data.logic_review + "\n";
    }

    return content;
  };

  const handleCopy = () => {
    const content = getExportContent();
    if (content) {
      navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = getExportContent();
    if (content) {
      let filename = activeTab === "all" ? "code-review.md" : `${activeTab}-review.md`;
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
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
          Paste your code below or upload a file for a complete style, security, and logic analysis.
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

        {/*  The Tri-Fold Results Dashboard  */}
        {results && (
          <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-blue-500/30 shadow-2xl">

            {/* Header & Buttons */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400">
                {results.status === "success" ? "Analysis Complete" : "Analysis Error"}
              </h2>

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

            {/* Dashboard Content */}
            {results.status === "success" && results.data && (
              <>
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2 overflow-x-auto">
                  {['all', 'style', 'security', 'logic'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* LAYER 1: STYLE ISSUES (FLAKE8) */}
                {(activeTab === "all" || activeTab === "style") && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-3">🎨 Style & Formatting</h3>
                    {results.data.style_issues?.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">No style issues found. Your code is perfectly formatted!</p>
                    ) : (
                      <div className="space-y-2">
                        {results.data.style_issues?.map((issue, idx) => (
                          <div key={idx} className="bg-emerald-900/20 border border-emerald-700/50 p-3 rounded flex gap-3 items-start">
                            <span className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono mt-0.5 whitespace-nowrap">Line {issue.line}</span>
                            <span className="text-emerald-100 text-sm">{issue.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LAYER 2: SECURITY ISSUES (BANDIT) */}
                {(activeTab === "all" || activeTab === "security") && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">🛡️ Security Vulnerabilities</h3>
                    {results.data.security_issues?.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">No security vulnerabilities detected.</p>
                    ) : (
                      <div className="space-y-2">
                        {results.data.security_issues?.map((issue, idx) => (
                          <div key={idx} className={`border p-3 rounded flex gap-3 items-start ${issue.severity === 'high' ? 'bg-red-900/20 border-red-700/50' : 'bg-yellow-900/20 border-yellow-700/50'
                            }`}>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono mt-0.5 whitespace-nowrap ${issue.severity === 'high' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                              }`}>Line {issue.line}</span>
                            <span className="text-slate-200 text-sm">{issue.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LAYER 3: LOGIC REVIEW (GEMINI) */}
                {(activeTab === "all" || activeTab === "logic") && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">🧠 AI Logic Analysis</h3>
                    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 overflow-x-auto space-y-4">
                      <ReactMarkdown
                        components={{
                          h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-blue-300 mt-6 mb-2 border-b border-slate-700 pb-2" {...props} />,
                          p: ({ node, ...props }) => <p className="text-slate-300 leading-relaxed mb-3" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 text-slate-300 space-y-1 mb-4" {...props} />,
                          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-blue-100" {...props} />,
                          pre: ({ node, ...props }) => (
                            <div className="bg-black p-4 rounded-md overflow-x-auto my-4 border border-slate-700 shadow-inner">
                              <pre {...props} />
                            </div>
                          ),
                          code: ({ node, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || "");
                            const isBlock = match || String(children).includes("\n");
                            return isBlock ? (
                              <code className={`text-slate-300 font-mono text-sm ${className || ""}`} {...props}>{children}</code>
                            ) : (
                              <code className="bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono mx-1" {...props}>{children}</code>
                            );
                          }
                        }}
                      >
                        {results.data.logic_review}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}