import { useState } from "react";
import api from "./api.js";
import { LayersIcon, ZapIcon, ExternalLinkIcon } from "./Icons.jsx";
import { ProgressBar } from "./Loading.jsx";

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
      setError("Maximum 10 prompts allowed per batch");
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
      setResults(response.data?.data?.results || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process batch queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vercel-card" style={{ maxWidth: 860, margin: "0 auto", padding: "28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="vercel-badge">
            <LayersIcon size={12} />
            Concurrent Pipeline
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• Up to 10 Parallel Requests</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff", margin: "4px 0" }}>
          Batch Media Processor
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Queue multiple prompts concurrently to generate an entire series of images or asset variations in a single click.
        </p>
      </div>

      {/* Input */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <textarea
          value={prompts}
          onChange={(e) => { setPrompts(e.target.value); setError(""); }}
          rows={6}
          placeholder={"Golden sunset over snowy pine forest\nCandid street photograph of Tokyo in rain\nMajestic Bengal tiger wading in forest river\nFuturistic skyscraper with hanging gardens"}
          disabled={loading}
          className="vercel-textarea"
          style={{ padding: "14px 16px", fontSize: 13, lineHeight: 1.6 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 12 }}>
          <span style={{ color: promptCount > 0 ? "#ffffff" : "var(--text-muted)", fontWeight: 600 }}>
            {promptCount} of 10 prompts queued
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            One prompt per line
          </span>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 8, background: "#180a0a", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: 20 }}>
          <ProgressBar progress={progress} label="Generating concurrent batch media…" />
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={loading || promptCount === 0}
        className="vercel-btn-primary"
        style={{ width: "100%", padding: "12px 20px", fontSize: 14 }}
      >
        {loading ? "Processing Batch Pipeline…" : `Process ${promptCount > 0 ? `${promptCount} Prompts` : "Batch"}`}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Batch Results ({results.length} Generated)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {results.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#080808",
                  border: "1px solid var(--border-default)",
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {item.imageUrl && (
                  <div style={{ aspectRatio: "16/10", width: "100%", borderRadius: 6, overflow: "hidden", background: "#000", marginBottom: 10 }}>
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>#{idx + 1}</div>
                <div style={{ fontSize: 12, color: "#e4e4e7", margin: "4px 0 10px", lineHeight: 1.4, flex: 1 }}>
                  {item.prompt}
                </div>
                {item.imageUrl && (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vercel-btn-secondary"
                    style={{ fontSize: 11, padding: "5px 8px", width: "100%" }}
                  >
                    <ExternalLinkIcon size={12} />
                    <span>View Asset</span>
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
