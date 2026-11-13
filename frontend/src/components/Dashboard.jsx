import React, { useState, useEffect } from "react";
import api from "./api.js";
import { CameraIcon, VideoIcon, GifIcon, LayersIcon, GalleryIcon, SettingsIcon, ArrowRightIcon, SparklesIcon, ExternalLinkIcon } from "./Icons.jsx";

export default function Dashboard({ onNavigate = () => {}, onLaunchPrompt = () => {} }) {
  const [quickPrompt, setQuickPrompt] = useState("");
  const [quickType, setQuickType] = useState("image");
  const [recentItems, setRecentItems] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await api.get("/history", { params: { limit: 4 } });
      setRecentItems(res.data?.data?.items || []);
    } catch {
      // Ignore
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleQuickSubmit = (e) => {
    if (e) e.preventDefault();
    if (!quickPrompt.trim()) {
      onNavigate(quickType === "video" ? "Video Lab" : quickType === "gif" ? "GIF Generator" : "Image Studio");
      return;
    }

    if (quickType === "video") {
      onLaunchPrompt("Video Lab", quickPrompt.trim());
    } else if (quickType === "gif") {
      onLaunchPrompt("GIF Generator", quickPrompt.trim());
    } else {
      onLaunchPrompt("Image Studio", quickPrompt.trim(), "real");
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingBottom: 40 }}>
      {/* Welcome Banner */}
      <div
        className="vercel-card"
        style={{
          padding: "28px",
          background: "linear-gradient(180deg, #121212 0%, #080808 100%)",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="vercel-badge">
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
                System Operational
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                FLUX &amp; Wikimedia Archives Active
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 6px" }}>
              Welcome to AI Media Studio
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, maxWidth: 600 }}>
              Generate archival real photography, 60 FPS multi-angle cinematic video, or animated loops from one unified monochrome control center.
            </p>
          </div>

          <button
            onClick={() => onNavigate("Workspace")}
            className="vercel-btn-primary"
            style={{ padding: "10px 18px" }}
          >
            <span>Open Studio Workspace</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { id: "Image Studio", title: "Real Photos & AI", desc: "Verified archival photography & 35mm DSLR", icon: CameraIcon },
          { id: "GIF Generator", title: "GIF Loops", desc: "Multi-frame animation & stop motion", icon: GifIcon },
          { id: "Video Lab", title: "4K Cinematic Video", desc: "60 FPS drone sweeps & camera dolly", icon: VideoIcon },
          { id: "Batch Tools", title: "Batch Processing", desc: "Queue up to 10 parallel prompts", icon: LayersIcon },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="vercel-card"
              style={{
                padding: "20px",
                background: "#0a0a0a",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#161616", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Launch ↗</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick-Access Generation Workspace Box */}
      <div
        className="vercel-card"
        style={{
          padding: "22px",
          background: "#080808",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <SparklesIcon size={14} />
            <span>Instant Prompt Launcher</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "image", label: "Image / Real" },
              { id: "gif", label: "GIF" },
              { id: "video", label: "Video" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setQuickType(t.id)}
                className={quickType === t.id ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ fontSize: 11, padding: "4px 8px" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleQuickSubmit} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder={
              quickType === "video"
                ? "Enter video prompt (e.g. futuristic supercar on rainy neon tokyo street)…"
                : quickType === "gif"
                  ? "Enter GIF loop prompt (e.g. golden koi fish swimming with ripples)…"
                  : "Enter person, landmark, or scene (e.g. Virat Kohli, Taj Mahal, candid 35mm photo)…"
            }
            className="vercel-input"
            style={{ flex: 1, padding: "10px 14px", fontSize: 13 }}
          />
          <button
            type="submit"
            className="vercel-btn-primary"
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            Generate
          </button>
        </form>
      </div>

      {/* Recent Creations Strip */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Recent Creations
          </h2>
          <button
            onClick={() => onNavigate("Gallery")}
            className="vercel-btn-ghost"
            style={{ fontSize: 12 }}
          >
            View All in Vault →
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              borderRadius: 10,
              background: "#080808",
              border: "1px dashed var(--border-default)",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            No creations yet — generate your first image or video above to populate your vault.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate("Gallery")}
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#0a0a0a",
                  border: "1px solid var(--border-default)",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: "100%", aspectRatio: "16/10", background: "#000", position: "relative" }}>
                  {item.data?.imageUrl && (
                    <img
                      src={item.data.imageUrl}
                      alt={item.data?.prompt}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  <div style={{ position: "absolute", top: 6, left: 6, padding: "2px 6px", background: "rgba(0,0,0,0.8)", border: "1px solid #333", borderRadius: 4, fontSize: 9, color: "#fff" }}>
                    {item.data?.isRealPhoto ? "Archive" : item.type === "video" ? "Video" : "AI"}
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, color: "#ffffff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.data?.prompt || "Media Asset"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
