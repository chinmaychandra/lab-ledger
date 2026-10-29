"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, Terminal } from "lucide-react";

export function AiAdvisor({ equipmentName }: { equipmentName?: string }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, equipmentName }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setResponse("[ERROR] Failed to establish communication with LabBot AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-md p-4 space-y-4 font-mono shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            LabBot AI // Safety & SOP Advisor
          </span>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
  <Sparkles className="h-3 w-3" />
  <span>Gemini Powered</span>
</span>
      </div>

      {/* Response Box */}
      {response && (
        <div className="bg-slate-950 border-2 border-slate-800 p-3 rounded text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] uppercase font-bold">
            <Terminal className="h-3.5 w-3.5" />
            <span>Advisory Output:</span>
          </div>
          <p className="text-slate-200 leading-relaxed font-sans">{response}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            equipmentName
              ? `Ask about ${equipmentName} operating procedures or hazards...`
              : "Ask about lab safety procedures, PPE, or equipment hazards..."
          }
          className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded p-2 focus:border-amber-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 text-slate-950 font-black px-4 py-2 rounded text-xs uppercase tracking-wider border-2 border-slate-950 flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
        >
          {loading ? "Analyzing..." : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}