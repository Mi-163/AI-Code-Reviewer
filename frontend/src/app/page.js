"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  // --- NEW: Severity Filter State ---
  const [severityFilter, setSeverityFilter] = useState("all");

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
    setActiveTab("all");
    setSeverityFilter("all"); // Reset filter on new analysis

    try {
      const response = await fetch("https://ai-code-reviewer-backend-i5x2.onrender.com/analyze", {
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

  // Dynamically Filtered Data Arrays 
  const filteredStyleIssues = results?.data?.style_issues?.filter(issue =>
    severityFilter === "all" || severityFilter === "low"
  ) || [];

  const filteredSecurityIssues = results?.data?.security_issues?.filter(issue =>
    severityFilter === "all" || issue.severity === severityFilter
  ) || [];

  //  Export content now respects the active severity filter 
  const getExportContent = () => {
    if (!results || !results.data) return "";

    let content = "";
    if (activeTab === "all" || activeTab === "style") {
      content += "## 🎨 Style & Formatting\n";
      if (filteredStyleIssues.length === 0) {
        content += "No style issues matching the current filter.\n\n";
      } else {
        filteredStyleIssues.forEach(issue => {
          content += `- **Line ${issue.line}**: ${issue.message}\n`;
        });
        content += "\n";
      }
    }

    if (activeTab === "all" || activeTab === "security") {
      content += "## 🛡️ Security Vulnerabilities\n";
      if (filteredSecurityIssues.length === 0) {
        content += "No security vulnerabilities matching the current filter.\n\n";
      } else {
        filteredSecurityIssues.forEach(issue => {
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
      //  Dynamic filename based on Tab and Severity Filter 
      let tabName = activeTab === "all" ? "all" : activeTab;
      let filterName = severityFilter !== "all" ? `-${severityFilter}` : "";

      let filename = `${tabName}${filterName}-review.md`;

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
    <main className="min-h-screen bg-slate-900 text-white p-8 relative">
      {/* Creator Tag  */}
      <div className="absolute top-6 right-8 flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 hover:border-blue-500 transition-all group shadow-lg">
        <span className="text-xs text-slate-400 font-medium">Creator:</span>
        <a
          href="https://github.com/Mi-163"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors"
        >
          Mi-163
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>

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

        {results && (
          <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-blue-500/30 shadow-2xl">

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

            {results.status === "success" && results.data && (
              <>
                {/* Main Filter Tabs */}
                <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2 overflow-x-auto">
                  {['all', 'style', 'security', 'logic'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSeverityFilter("all"); // Reset severity when changing main tabs
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Context-Aware Severity Filter  */}
                {(activeTab === "all" || activeTab === "security") && (
                  <div className="flex gap-2 mb-6">
                    <span className="text-slate-400 text-sm py-1 mr-2 font-medium">Filter:</span>
                    {['all', 'high', 'medium', 'low'].map(level => (
                      <button
                        key={level}
                        onClick={() => setSeverityFilter(level)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${severityFilter === level
                          ? level === 'high' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50'
                            : level === 'medium' ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-900/50'
                              : level === 'low' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                                : 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                          }`}
                      >
                        {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                )}

                {/* LAYER 1: STYLE ISSUES (FLAKE8) */}
                {(activeTab === "all" || activeTab === "style") && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-3">🎨 Style & Formatting</h3>
                    {filteredStyleIssues.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">
                        {results.data.style_issues?.length === 0
                          ? "No style issues found. Your code is perfectly formatted!"
                          : "No style issues matching the current filter."}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredStyleIssues.map((issue, idx) => (
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
                    {filteredSecurityIssues.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">
                        {results.data.security_issues?.length === 0
                          ? "No security vulnerabilities detected."
                          : "No vulnerabilities matching the current filter."}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredSecurityIssues.map((issue, idx) => (
                          <div key={idx} className={`border p-3 rounded flex gap-3 items-start ${issue.severity === 'high' ? 'bg-red-900/20 border-red-700/50' :
                            issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-700/50' :
                              'bg-emerald-900/20 border-emerald-700/50'
                            }`}>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono mt-0.5 whitespace-nowrap ${issue.severity === 'high' ? 'bg-red-900 text-red-300' :
                              issue.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-emerald-900 text-emerald-300'
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