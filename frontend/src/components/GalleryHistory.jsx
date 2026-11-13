import { useState, useEffect } from "react";
import api from "./api.js";

export default function GalleryHistory() {
  const [history, setHistory] = useState([]);
  const [type, setType]       = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetchHistory();
  }, [type]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/history", { params: { type, limit: 30 } });
      setHistory(response.data.data.items || []);
    } catch (err) {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to delete item");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all media history?")) return;

    try {
      await api.post("/history/clear", { type });
      setHistory([]);
    } catch (err) {
      setError("Failed to clear history");
    }
  };

  return (
    <div style={{
      maxWidth: 920,
      margin: "20px auto 40px",
      padding: "30px 32px 36px",
      borderRadius: 26,
      background: "linear-gradient(160deg, rgba(8, 14, 32, 0.98), rgba(14, 22, 52, 0.95))",
      border: "1px solid rgba(244, 114, 182, 0.25)",
      boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <span style={{
            background: "linear-gradient(135deg, #f472b6, #fb7185)",
            color: "#4c0519",
            fontWeight: 800,
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 999,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            Archive &amp; Creations
          </span>
          <h2 style={{
            margin: "6px 0 0",
            fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
            fontWeight: 900,
            background: "linear-gradient(90deg, #f472b6, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Media Gallery &amp; History
          </h2>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(239, 68, 68, 0.4)",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[
          { id: "all", label: "All Media", icon: "📁" },
          { id: "image", label: "Photos & Images", icon: "📸" },
          { id: "video", label: "Videos", icon: "🎬" },
        ].map((t) => {
          const active = type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 12,
                border: active ? "1px solid #f472b6" : "1px solid rgba(255, 255, 255, 0.08)",
                background: active ? "rgba(244, 114, 182, 0.2)" : "rgba(255, 255, 255, 0.04)",
                color: active ? "#ffffff" : "rgba(203, 213, 225, 0.7)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          );
        })}
      </div>

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

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#f472b6" }}>
          <div style={{ fontSize: 36, animation: "spin 1.2s linear infinite", display: "inline-block" }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>Loading archival history…</div>
        </div>
      ) : history.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: 18,
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px dashed rgba(255, 255, 255, 0.1)",
        }}>
          <div style={{ fontSize: 36, opacity: 0.5, marginBottom: 10 }}>🖼️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#cbd5e1" }}>No creations saved yet</div>
          <div style={{ fontSize: 13, color: "rgba(203, 213, 225, 0.5)", marginTop: 4 }}>
            Photos and videos you search or generate will appear here automatically.
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {history.map((item) => {
            const isPhoto = item.type === "image" || Boolean(item.data?.imageUrl);
            const mediaSrc = item.data?.imageUrl || item.data?.videoUrl;
            return (
              <div
                key={item.id}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "rgba(12, 19, 44, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                {/* Media Preview */}
                <div style={{ position: "relative", width: "100%", height: 160, background: "#050814" }}>
                  {item.data?.videoUrl && (item.data.videoUrl.startsWith("blob:") || item.data.videoUrl.startsWith("data:")) ? (
                    <video
                      src={item.data.videoUrl}
                      muted
                      playsInline
                      loop
                      autoPlay
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : item.data?.imageUrl ? (
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <img
                        src={item.data.imageUrl}
                        alt={item.data?.prompt}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {item.type === "video" && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.25)",
                        }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "rgba(6, 182, 212, 0.85)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            color: "#03172e",
                            paddingLeft: 2,
                            boxShadow: "0 0 15px rgba(6, 182, 212, 0.6)",
                          }}>
                            ▶
                          </div>
                        </div>
                      )}
                    </div>
                  ) : item.data?.videoUrl ? (
                    <video
                      src={item.data.videoUrl}
                      muted
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      🎬 Video Creation
                    </div>
                  )}

                  {/* Badge */}
                  <div style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 800,
                    background: item.data?.isRealPhoto ? "rgba(6, 78, 59, 0.85)" : "rgba(0, 0, 0, 0.7)",
                    color: item.data?.isRealPhoto ? "#34d399" : "#e2e8f0",
                    border: item.data?.isRealPhoto ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(6px)",
                  }}>
                    {item.data?.isRealPhoto ? "📸 Real Photo" : item.type === "video" ? "🎬 Video" : "🎨 AI Art"}
                  </div>
                </div>

                {/* Info & Actions */}
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.5)", marginBottom: 4 }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#f1f5f9",
                    fontWeight: 600,
                    lineHeight: 1.4,
                    marginBottom: 12,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    flex: 1,
                  }}>
                    {item.data?.prompt || "Media Creation"}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    {mediaSrc && (
                      <a
                        href={mediaSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          borderRadius: 8,
                          background: "rgba(56, 189, 248, 0.15)",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          color: "#38bdf8",
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: "center",
                          textDecoration: "none",
                        }}
                      >
                        Open ↗
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#fca5a5",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
