import { useState, useEffect } from "react";
import api from "./api.js";
import { GalleryIcon, TrashIcon, DownloadIcon, ExternalLinkIcon, SearchIcon, PlayIcon, CloseIcon } from "./Icons.jsx";
import { Modal } from "./Modal.jsx";
import { Spinner } from "./Loading.jsx";

export default function GalleryHistory() {
  const [history, setHistory] = useState([]);
  const [type, setType]       = useState("all");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [type]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/history", { params: { type, limit: 50 } });
      setHistory(response.data?.data?.items || []);
    } catch {
      setError("Failed to load creations history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter((item) => item.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
    } catch {
      setError("Failed to delete creation");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your creations history?")) return;
    try {
      await api.post("/history/clear", { type });
      setHistory([]);
    } catch {
      setError("Failed to clear history");
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!search.trim()) return true;
    const p = (item.data?.prompt || item.data?.title || "").toLowerCase();
    return p.includes(search.trim().toLowerCase());
  });

  return (
    <div className="vercel-card" style={{ maxWidth: 1040, margin: "0 auto", padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="vercel-badge">
              <GalleryIcon size={12} />
              Creations Vault
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• {history.length} Assets Stored</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff", margin: 0 }}>
            Media Gallery &amp; Archive
          </h2>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="vercel-btn-ghost"
            style={{ fontSize: 12, color: "#f87171" }}
          >
            <TrashIcon size={13} />
            <span>Clear Vault</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#080808", padding: 3, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
          {[
            { id: "all", label: "All Media" },
            { id: "image", label: "Photos & Images" },
            { id: "video", label: "Videos" },
            { id: "gif", label: "GIFs" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                fontSize: 12,
                fontWeight: type === t.id ? 600 : 500,
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: type === t.id ? "#262626" : "transparent",
                color: type === t.id ? "#ffffff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: 240, flex: 1, maxWidth: 360 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt keywords…"
            className="vercel-input"
            style={{ padding: "8px 12px 8px 32px", fontSize: 12 }}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 8, background: "#180a0a", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <Spinner size="md" text="Loading creations vault…" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            borderRadius: 12,
            background: "#080808",
            border: "1px dashed var(--border-default)",
          }}
        >
          <div style={{ color: "var(--text-muted)", marginBottom: 12 }}>
            <GalleryIcon size={32} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff" }}>
            {search ? "No matching creations found" : "No media creations yet"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, maxWidth: 360, margin: "4px auto 0" }}>
            {search ? "Try searching for a different keyword or reset the search." : "Photos and videos you synthesize in the studio will automatically appear here."}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {filteredHistory.map((item) => {
            const mediaSrc = item.data?.imageUrl || item.data?.videoUrl;
            const isVideo = item.type === "video" || Boolean(item.data?.videoUrl);
            const isReal = item.data?.isRealPhoto;

            return (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#0a0a0a",
                  border: "1px solid var(--border-default)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.18s ease, transform 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3f3f46";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Media Preview Box */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", background: "#000000" }}>
                  {mediaSrc ? (
                    <img
                      src={mediaSrc}
                      alt={item.data?.prompt || "Creation"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
                      Media Asset
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{ position: "absolute", top: 8, left: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(0,0,0,0.85)", border: "1px solid #333", fontSize: 10, color: "#fff", fontWeight: 600 }}>
                    {isReal ? "Archive Photo" : isVideo ? "Video" : "AI Image"}
                  </div>

                  {isVideo && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ffffff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 2 }}>
                        <PlayIcon size={14} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Meta */}
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 4 }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#ffffff",
                      lineHeight: 1.4,
                      marginBottom: 12,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {item.data?.prompt || item.data?.title || "Generative Creation"}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
                      Preview ↗
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="vercel-btn-ghost"
                      style={{ padding: 4, color: "var(--text-muted)" }}
                      title="Delete creation"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          title={previewItem.data?.isRealPhoto ? "Archival Photograph Preview" : previewItem.type === "video" ? "Video Asset Preview" : "Media Preview"}
          onClose={() => setPreviewItem(null)}
          maxWidth={760}
          actions={[
            {
              label: "Open Source ↗",
              onClick: () => window.open(previewItem.data?.imageUrl || previewItem.data?.videoUrl, "_blank"),
            },
            {
              label: "Delete Asset",
              onClick: () => handleDelete(previewItem.id),
            },
          ]}
        >
          <div>
            <div style={{ borderRadius: 10, overflow: "hidden", background: "#000", border: "1px solid var(--border-default)", marginBottom: 16 }}>
              {previewItem.data?.imageUrl && (
                <img
                  src={previewItem.data.imageUrl}
                  alt={previewItem.data?.prompt}
                  style={{ width: "100%", maxHeight: 460, objectFit: "contain", display: "block" }}
                />
              )}
            </div>

            <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600, marginBottom: 8 }}>
              "{previewItem.data?.prompt || previewItem.data?.title}"
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: "var(--text-secondary)", padding: 12, background: "#0a0a0a", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
              <div>Type: <strong style={{ color: "#fff" }}>{previewItem.type || "Image"}</strong></div>
              <div>Created: <strong style={{ color: "#fff" }}>{new Date(previewItem.timestamp).toLocaleString()}</strong></div>
              {previewItem.data?.provider && <div>Provider: <strong style={{ color: "#fff" }}>{previewItem.data.provider}</strong></div>}
              {previewItem.data?.size && <div>Resolution: <strong style={{ color: "#fff" }}>{previewItem.data.size}</strong></div>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
