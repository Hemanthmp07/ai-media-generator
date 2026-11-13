import { useState } from "react";
import api from "./api.js";

export default function BatchProcessor() {
  const [prompts, setPrompts] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const promptCount = prompts.split("\n").filter((p) => p.trim()).length;

  const handleProcess = async () => {
    const promptList = prompts
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);

    if (promptList.length === 0) {
      setError("Please enter at least one prompt (one per line)");
      return;
    }

    if (promptList.length > 10) {
      setError("Maximum 10 prompts allowed at once");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setProgress(15);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 20, 90));
      }, 500);

      const response = await api.post("/batch/process", {
        prompts: promptList,
      });

      clearInterval(interval);
      setProgress(100);
      setResults(response.data.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 860,
      margin: "20px auto 40px",
      padding: "30px 32px 36px",
      borderRadius: 26,
      background: "linear-gradient(160deg, rgba(8, 14, 32, 0.98), rgba(14, 22, 52, 0.95))",
      border: "1px solid rgba(52, 211, 153, 0.22)",
      boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{
            background: "linear-gradient(135deg, #10b981, #06b6d4)",
            color: "#022c22",
            fontWeight: 800,
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 999,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            Multi-Generation Engine
          </span>
          <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>
            • Up to 10 Prompts Concurrently
          </span>
        </div>

        <h2 style={{
          margin: 0,
          fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
          fontWeight: 900,
          background: "linear-gradient(90deg, #34d399, #38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Batch Media Processor
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(203, 213, 225, 0.75)" }}>
          Queue multiple prompts simultaneously to generate a full collection of images in one click.
        </p>
      </div>

      {/* Textarea */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={prompts}
          onChange={(e) => { setPrompts(e.target.value); setError(""); }}
          rows={6}
          placeholder={"Golden sunset over snowy pine forest\nCandid street photograph of Tokyo in rain\nMajestic Bengal tiger wading in forest river\nFuturistic skyscraper with hanging gardens"}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "16px 18px",
            borderRadius: 18,
            resize: "vertical",
            background: "rgba(12, 19, 44, 0.85)",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            color: "#f1f5f9",
            fontSize: 14,
            lineHeight: 1.7,
            outline: "none",
            fontFamily: "inherit",
            boxShadow: "inset 0 2px 14px rgba(0, 0, 0, 0.4)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
          <span style={{ color: "#34d399", fontWeight: 700 }}>
            {promptCount} of 10 prompts queued
          </span>
          <span style={{ color: "rgba(203, 213, 225, 0.5)" }}>
            Tip: Press Enter for a new line per prompt
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16,
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          color: "#fca5a5",
          fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 6 }}>
            <span>Processing batch queue…</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: "100%", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #38bdf8)", transition: "width 0.4s ease" }} />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleProcess}
        disabled={loading || promptCount === 0}
        style={{
          width: "100%",
          padding: "16px 24px",
          borderRadius: 18,
          border: "none",
          cursor: loading || promptCount === 0 ? "not-allowed" : "pointer",
          fontSize: 15,
          fontWeight: 800,
          background: loading || promptCount === 0
            ? "rgba(100, 116, 139, 0.3)"
            : "linear-gradient(135deg, #10b981, #06b6d4)",
          color: "#022c22",
          boxShadow: loading || promptCount === 0 ? "none" : "0 8px 30px rgba(16, 185, 129, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.2s",
        }}
      >
        {loading ? "⚡ Generating Media Batch…" : `⚡ Process ${promptCount > 0 ? `${promptCount} Prompts` : "Batch"}`}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>
            Batch Results ({results.length} Generated)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {results.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "rgba(12, 19, 44, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: 10,
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}
                  />
                )}
                <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.5)", fontWeight: 700 }}>#{idx + 1}</div>
                <div style={{ fontSize: 12, color: "#e2e8f0", margin: "4px 0 8px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.prompt}
                </div>
                {item.imageUrl && (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#38bdf8", textDecoration: "none", fontWeight: 700 }}
                  >
                    Open Image ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
