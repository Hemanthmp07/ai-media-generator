import React, { useState, useRef, useEffect } from "react";
import api from "./api.js";
import { SparklesIcon, PlayIcon, PauseIcon, DownloadIcon, RefreshIcon, SlidersIcon } from "./Icons.jsx";

const GIF_STYLES = [
  { id: "loop", label: "Seamless Loop", desc: "Smooth continuous ambient motion" },
  { id: "stopmotion", label: "Stop Motion", desc: "Artistic stepped camera movement" },
  { id: "glitch", label: "Cyber Glitch", desc: "Futuristic digital distortion flashes" },
  { id: "vhs", label: "Retro VHS", desc: "90s archival analog tape animation" },
];

const EXAMPLE_GIFS = [
  "neon cat dancing in cyberpunk tokyo alleyway",
  "golden koi fish swimming in dark tranquil pond with ripples",
  "retro rotating 3d metallic chrome wireframe skull",
  "pulsing black hole event horizon with warping accretion disk",
];

export default function GifGenerator({ initialPrompt = "" }) {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [style, setStyle] = useState("loop");
  const [fps, setFps] = useState(6);
  const [frameCount, setFrameCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef(null);
  const playIntervalRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  // Frame animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    playIntervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);

    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, frames, fps]);

  // Render current frame to canvas
  useEffect(() => {
    if (frames.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = frames[currentFrame];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Subtle scanline / film effect for VHS style
      if (style === "vhs") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }
    };
  }, [frames, currentFrame, style]);

  const handleGenerate = async () => {
    const q = prompt.trim();
    if (!q) {
      setError("Please describe the animated GIF you want to create.");
      return;
    }

    setLoading(true);
    setError("");
    setFrames([]);
    setCurrentFrame(0);
    setElapsed(0);

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - start) / 1000));
    }, 1000);

    try {
      const generatedFrames = [];
      const baseSeed = Math.floor(Math.random() * 800000) + 100000;
      const count = parseInt(frameCount) || 4;

      const styleTags = {
        loop: "smooth continuous animation loop, sequential frame motion, high quality",
        stopmotion: "stop motion claymation style, stepped lighting, tactile frame",
        glitch: "glitch art, chromatic aberration, digital noise frame, cyber pulse",
        vhs: "1990s retro VHS recording, tape grain, scanlines, nostalgic motion",
      }[style] || "loop animation";

      for (let i = 0; i < count; i++) {
        const seed = baseSeed + i * 27;
        const framePrompt = encodeURIComponent(`${q}, frame ${i + 1} of ${count}, ${styleTags}`);
        const url = `https://image.pollinations.ai/prompt/${framePrompt}?width=640&height=640&seed=${seed}&nologo=true&model=flux`;
        generatedFrames.push(url);
      }

      setFrames(generatedFrames);
      setIsPlaying(true);

      // Save to history
      api.post("/history/save", {
        type: "gif",
        data: {
          imageUrl: generatedFrames[0],
          prompt: q,
          style,
          fps,
          frameCount: count,
          timestamp: new Date().toISOString(),
        },
      }).catch(() => {});
    } catch (err) {
      setError("Failed to create GIF frames. Please try again.");
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleDownloadFrame = () => {
    if (!frames[currentFrame]) return;
    const a = document.createElement("a");
    a.href = frames[currentFrame];
    a.download = `gif-frame-${currentFrame + 1}-${Date.now()}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="vercel-card" style={{ maxWidth: 860, margin: "0 auto", padding: "28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="vercel-badge">
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
            Animated GIF Lab
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• Multi-Frame Neural Loop Engine</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff", margin: "4px 0" }}>
          GIF &amp; Frame Animation Studio
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Synthesize looping animated media, retro stop-motion clips, and cyberpunk motion loops directly from text prompts.
        </p>
      </div>

      {/* Prompt Area */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
          rows={3}
          placeholder="Describe your looping animation (e.g. golden koi fish swimming in dark pond with ripples)…"
          className="vercel-textarea"
          style={{ padding: "14px 16px", fontSize: 14, lineHeight: 1.5 }}
          disabled={loading}
        />
        <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 11, color: "var(--text-muted)" }}>
          {prompt.length} / 1000
        </div>
      </div>

      {/* Example Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Try:
        </span>
        {EXAMPLE_GIFS.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => { setPrompt(ex); setError(""); }}
            className="vercel-btn-ghost"
            style={{ fontSize: 12, padding: "4px 10px", background: "#111111", border: "1px solid var(--border-default)" }}
          >
            {ex.slice(0, 30)}…
          </button>
        ))}
      </div>

      {/* Controls Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20, padding: 16, background: "#0a0a0a", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
        {/* Style */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Loop Style
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {GIF_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={style === s.id ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ fontSize: 11, padding: "6px 8px" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Count */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Frame Count: <strong style={{ color: "#fff" }}>{frameCount} Frames</strong>
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {[3, 4, 6, 8].map((c) => (
              <button
                key={c}
                onClick={() => setFrameCount(c)}
                className={frameCount === c ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Speed / FPS */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Speed: <strong style={{ color: "#fff" }}>{fps} FPS</strong>
          </label>
          <input
            type="range"
            min="2"
            max="16"
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#ffffff", cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Main Action */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="vercel-btn-primary"
        style={{ width: "100%", padding: "12px 20px", fontSize: 14 }}
      >
        {loading ? (
          <>Synthesizing GIF Keyframes… {elapsed > 0 && `(${elapsed}s)`}</>
        ) : (
          <>Generate Animated GIF Loop</>
        )}
      </button>

      {error && (
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "#1c0b0b", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* GIF Viewer Output */}
      {frames.length > 0 && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              maxWidth: 480,
              aspectRatio: "1/1",
              margin: "0 auto",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid var(--border-default)",
              background: "#050505",
            }}
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={640}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />

            {/* Overlay Frame Badge */}
            <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 8px", background: "rgba(0,0,0,0.8)", border: "1px solid #333", borderRadius: 6, fontSize: 10, color: "#a1a1aa" }}>
              Frame {currentFrame + 1} / {frames.length} • {fps} FPS
            </div>
          </div>

          {/* Player controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="vercel-btn-secondary"
            >
              {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={handleDownloadFrame}
              className="vercel-btn-secondary"
            >
              <DownloadIcon size={14} />
              <span>Save Current Frame</span>
            </button>
            <button
              onClick={handleGenerate}
              className="vercel-btn-ghost"
            >
              <RefreshIcon size={14} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
