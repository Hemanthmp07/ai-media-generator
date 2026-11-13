import { useState, useRef, useEffect } from "react";
import api from "./api.js";

const MODE_OPTIONS = [
  {
    id: "real",
    label: "Real Photos",
    icon: "📸",
    badge: "100% Authentic",
    desc: "Actual camera photos of real people, celebrities, landmarks, animals & scenes from verified archives (Wikipedia & Wikimedia)",
  },
  {
    id: "ai",
    label: "AI Photorealism",
    icon: "🎨",
    badge: "DSLR Generation",
    desc: "Generate new synthetic images using photorealistic raw camera prompts without CGI or cartoonish smoothing",
  },
];

const SIZE_OPTIONS = [
  { value: "1024x1024", label: "Square", icon: "⬛", desc: "1024 × 1024" },
  { value: "1792x1024", label: "Landscape", icon: "🖼️", desc: "1792 × 1024" },
  { value: "1024x1792", label: "Portrait", icon: "📱", desc: "1024 × 1792" },
];

const STYLE_OPTIONS = [
  { value: "natural", label: "Natural DSLR", icon: "🌿", desc: "Raw 35mm camera, natural skin pores & daylight" },
  { value: "vivid",   label: "Commercial",   icon: "🎨", desc: "High dynamic range & crisp studio contrast" },
];

const QUALITY_OPTIONS = [
  { value: "standard", label: "Standard", icon: "⚡", desc: "Fast retrieval / generation" },
  { value: "hd",       label: "Ultra HD", icon: "✨", desc: "Max resolution & archival detail" },
];

const REAL_PHOTO_EXAMPLES = [
  "Virat Kohli",
  "Lionel Messi",
  "Narendra Modi",
  "Shah Rukh Khan",
  "Taj Mahal",
  "Bengal Tiger",
  "Mount Everest",
  "Eiffel Tower",
];

const AI_PHOTO_EXAMPLES = [
  "Candid 35mm photo of an artisan crafting pottery in a sunlit workshop, natural skin texture",
  "National Geographic wildlife photo of a snow leopard on a Himalayan ridge, raw camera shot",
  "Street photo of a rainy evening in Kyoto, authentic reflections, DSLR depth of field",
  "Cinematic portrait of a sea captain on the deck of a trawler at dusk, weather-worn features",
];

export default function ImageGenerator({ initialPrompt = "", initialMode = "real" } = {}) {
  const [mode, setMode]                         = useState(initialMode || "real");
  const [prompt, setPrompt]                     = useState(initialPrompt || "");
  const [size, setSize]                         = useState("1024x1024");
  const [quality, setQuality]                   = useState("standard");
  const [style, setStyle]                       = useState("natural");
  const [imageUrl, setImageUrl]                 = useState("");
  const [revisedPrompt, setRevisedPrompt]       = useState("");
  const [provider, setProvider]                 = useState("");
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [elapsed, setElapsed]                   = useState(0);
  const [imageLoaded, setImageLoaded]           = useState(false);
  const [imageError, setImageError]             = useState(false);
  const [isRealPhoto, setIsRealPhoto]           = useState(false);
  const [photoList, setPhotoList]               = useState([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [photoMeta, setPhotoMeta]               = useState(null);
  const [realAlternative, setRealAlternative]   = useState(null);
  const timerRef                                = useRef(null);

  // ── Auto-search if launched with a prompt ─────────────────────────────────
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt.trim());
      const m = initialMode || "real";
      setMode(m);
      handleGenerate(m, initialPrompt.trim());
    }
  }, [initialPrompt, initialMode]);

  // ── Generate or Search Photos ─────────────────────────────────────────────
  const handleGenerate = async (forcedMode, customPrompt) => {
    const activeMode = forcedMode || mode;
    const query = (customPrompt !== undefined ? customPrompt : prompt).trim();
    if (!query) {
      setError(activeMode === "real" ? "Please enter a person, place, or object to find real photos." : "Please enter a description to generate.");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrl("");
    setRevisedPrompt("");
    setProvider("");
    setImageLoaded(false);
    setImageError(false);
    setPhotoList([]);
    setSelectedPhotoIdx(0);
    setPhotoMeta(null);
    setRealAlternative(null);
    setElapsed(0);

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - start) / 1000));
    }, 1000);

    try {
      const res = await api.post("/image", {
        prompt: query,
        size,
        quality,
        style,
        mode: activeMode,
      });

      const data = res.data?.data;
      const url = data?.image || data?.imageUrl || "";
      setImageUrl(url);
      setRevisedPrompt(data?.revisedPrompt || "");
      setProvider(data?.provider || (activeMode === "real" ? "Verified Real Photo Archive" : "AI Photorealism Engine"));
      setIsRealPhoto(Boolean(data?.isRealPhoto));

      if (data?.photos && data.photos.length > 0) {
        setPhotoList(data.photos);
        setPhotoMeta({
          title: data.title || data.photos[0].title,
          description: data.description || data.photos[0].description,
          author: data.author || data.photos[0].author,
          source: data.source || data.photos[0].source,
          sourceUrl: data.sourceUrl || data.photos[0].sourceUrl,
        });
      } else if (data?.isRealPhoto) {
        setPhotoMeta({
          title: data.title || prompt.trim(),
          description: data.description || "",
          author: data.author || "Archive",
          source: data.source || "Wikimedia Commons",
          sourceUrl: data.sourceUrl || "",
        });
      }

      if (data?.realAlternative) {
        setRealAlternative(data.realAlternative);
      }

      // Auto-save to gallery history
      if (url) {
        api.post("/history/save", {
          type: "image",
          data: {
            imageUrl: url,
            prompt: prompt.trim(),
            size,
            quality,
            style,
            isRealPhoto: Boolean(data?.isRealPhoto),
            provider: data?.provider || (activeMode === "real" ? "Real Photo Archive" : "AI Engine"),
            timestamp: new Date().toISOString(),
          },
        }).catch(() => {});
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === "ECONNABORTED" ? "Request timed out — please try again." : null) ||
        (activeMode === "real" ? "Could not find authentic photos. Please check spelling or try another name." : "Image generation failed. Please try again.");
      setError(msg);
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  // ── Switch active photo from candidate gallery ────────────────────────────
  const selectPhotoCandidate = (idx) => {
    if (!photoList[idx]) return;
    setSelectedPhotoIdx(idx);
    const photo = photoList[idx];
    setImageUrl(photo.url);
    setImageLoaded(false);
    setImageError(false);
    setPhotoMeta({
      title: photo.title,
      description: photo.description,
      author: photo.author,
      source: photo.source,
      sourceUrl: photo.sourceUrl,
    });
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = `${isRealPhoto ? "real-photo" : "photo"}-${Date.now()}.png`;
        a.click();
        return;
      }
      const res  = await fetch(imageUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${isRealPhoto ? "real-photo" : "photo"}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div style={{
      maxWidth: 860,
      margin: "20px auto 40px",
      padding: "28px 30px 34px",
      borderRadius: 26,
      background: "linear-gradient(160deg, rgba(8, 12, 28, 0.98), rgba(13, 20, 48, 0.95))",
      border: "1px solid rgba(139, 92, 246, 0.22)",
      boxShadow: "0 28px 70px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>

      {/* ── Top Mode Switcher Bar ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        padding: "6px",
        background: "rgba(12, 17, 38, 0.9)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 24,
      }}>
        {MODE_OPTIONS.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                setMode(opt.id);
                setError("");
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "12px 18px",
                borderRadius: 14,
                border: active
                  ? "1px solid rgba(56, 189, 248, 0.6)"
                  : "1px solid transparent",
                cursor: "pointer",
                background: active
                  ? opt.id === "real"
                    ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(14, 165, 233, 0.2))"
                    : "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.2))"
                  : "transparent",
                boxShadow: active
                  ? opt.id === "real"
                    ? "0 4px 20px rgba(16, 185, 129, 0.25)"
                    : "0 4px 20px rgba(139, 92, 246, 0.25)"
                  : "none",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: active ? "#ffffff" : "rgba(203, 213, 225, 0.8)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{opt.icon}</span> {opt.label}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: active
                    ? opt.id === "real" ? "rgba(16, 185, 129, 0.3)" : "rgba(139, 92, 246, 0.3)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: active
                    ? opt.id === "real" ? "#34d399" : "#c4b5fd"
                    : "rgba(203, 213, 225, 0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  {opt.badge}
                </span>
              </div>
              <span style={{ fontSize: 11, color: active ? "#cbd5e1" : "rgba(203, 213, 225, 0.5)", marginTop: 5, lineHeight: 1.35 }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        {mode === "real" ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                color: "#022c22",
                fontWeight: 800,
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 999,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                100% Genuine Photography
              </span>
              <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>
                • Wikipedia & Wikimedia Commons Verified Archive
              </span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
              fontWeight: 900,
              background: "linear-gradient(90deg, #34d399, #38bdf8, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Real Photo Finder
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(203, 213, 225, 0.7)" }}>
              Get authentic, real-life camera photographs of real people, athletes, celebrities, leaders, and places — no artificial AI renders or cartoon faces.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ margin: "0 0 5px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a78bfa", fontWeight: 700 }}>
              Ultra-Realistic DSLR Engine
            </p>
            <h2 style={{
              margin: 0,
              fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
              fontWeight: 900,
              background: "linear-gradient(90deg, #c4b5fd, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              AI Photorealistic Studio
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(203, 213, 225, 0.7)" }}>
              Creates synthetic camera photography using raw DSLR lens optics and natural lighting, without plastic smoothing or 3D art artifacts.
            </p>
          </div>
        )}
      </div>

      {/* ── Prompt / Search Input ── */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
          rows={mode === "real" ? 3 : 4}
          placeholder={
            mode === "real"
              ? "Enter the name of any person, celebrity, athlete, monument, or animal (e.g. Virat Kohli, Lionel Messi, Narendra Modi, Taj Mahal)…"
              : "Describe the photograph you want to generate in detail (e.g. Candid 35mm photo of an artisan in natural daylight)…"
          }
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "16px 18px",
            borderRadius: 16,
            resize: "vertical",
            background: "rgba(15, 23, 50, 0.85)",
            border: mode === "real" ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(139, 92, 246, 0.35)",
            color: "#e2e8f0",
            fontSize: 15,
            lineHeight: 1.6,
            outline: "none",
            fontFamily: "inherit",
            boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = mode === "real" ? "rgba(16, 185, 129, 0.8)" : "rgba(139, 92, 246, 0.8)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = mode === "real" ? "rgba(16, 185, 129, 0.35)" : "rgba(139, 92, 246, 0.35)";
          }}
        />
        <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 11, color: "rgba(203,213,225,0.35)" }}>
          {prompt.length} / 4000
        </div>
      </div>

      {/* ── Example Suggestions ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(203,213,225,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
          {mode === "real" ? "⭐ Try finding real photos of:" : "✨ Try photographic prompt:"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(mode === "real" ? REAL_PHOTO_EXAMPLES : AI_PHOTO_EXAMPLES).map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(ex);
                setError("");
              }}
              style={{
                padding: "6px 13px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: mode === "real" ? "rgba(16, 185, 129, 0.12)" : "rgba(139, 92, 246, 0.12)",
                border: mode === "real" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(139, 92, 246, 0.3)",
                color: mode === "real" ? "#6ee7b7" : "#c4b5fd",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = mode === "real" ? "rgba(16, 185, 129, 0.25)" : "rgba(139, 92, 246, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = mode === "real" ? "rgba(16, 185, 129, 0.12)" : "rgba(139, 92, 246, 0.12)";
              }}
            >
              {mode === "real" ? `📸 ${ex}` : `${ex.slice(0, 32)}…`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Settings Row (Size, Quality, Style) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
        marginBottom: 22,
        padding: "16px 18px",
        borderRadius: 16,
        background: "rgba(15,23,50,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Size */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(203,213,225,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Resolution Aspect
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSize(opt.value)}
                style={{
                  padding: "6px 11px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: size === opt.value ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
                  background: size === opt.value ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.04)",
                  color: size === opt.value ? "#fff" : "rgba(203,213,225,0.7)",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(203,213,225,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Quality
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuality(opt.value)}
                style={{
                  padding: "6px 11px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: quality === opt.value ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.08)",
                  background: quality === opt.value ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.04)",
                  color: quality === opt.value ? "#fff" : "rgba(203,213,225,0.7)",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(203,213,225,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Camera Lens Feel
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStyle(opt.value)}
                style={{
                  padding: "6px 11px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: style === opt.value ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                  background: style === opt.value ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.04)",
                  color: style === opt.value ? "#fff" : "rgba(203,213,225,0.7)",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Action Button ── */}
      <button
        onClick={() => handleGenerate()}
        disabled={loading || !prompt.trim()}
        style={{
          width: "100%",
          padding: "16px 24px",
          borderRadius: 16,
          border: "none",
          cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.02em",
          background: loading || !prompt.trim()
            ? "rgba(100, 116, 139, 0.3)"
            : mode === "real"
              ? "linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)"
              : "linear-gradient(135deg, #8b5cf6, #6366f1, #38bdf8)",
          color: "#fff",
          boxShadow: loading || !prompt.trim()
            ? "none"
            : mode === "real"
              ? "0 8px 32px rgba(16, 185, 129, 0.45)"
              : "0 8px 32px rgba(139, 92, 246, 0.45)",
          transition: "all 0.25s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
            {mode === "real" ? "Fetching Authentic Real Photos…" : "Generating Photorealistic Image…"} {elapsed > 0 && `(${elapsed}s)`}
          </>
        ) : (
          <>
            {mode === "real" ? "🔍 Find Real Photos" : "✨ Generate Real Photo with AI"}
          </>
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Error Notification ── */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          color: "#fca5a5",
          fontSize: 14,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Search Notification</div>
            <div>{error}</div>
            {mode === "real" && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#cbd5e1" }}>
                Tip: Enter the specific name of a celebrity, public figure, landmark, or animal (e.g. &quot;Virat Kohli&quot; or &quot;Taj Mahal&quot;).
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Alternative Real Photo Suggestion Banner (If in AI mode but real person detected) ── */}
      {realAlternative && !loading && (
        <div style={{
          marginTop: 16,
          padding: "14px 18px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>📸</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6ee7b7" }}>
                Authentic real photo of &quot;{realAlternative.title}&quot; is available!
              </div>
              <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.7)" }}>
                Verified archival photograph from {realAlternative.source}.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setMode("real");
              handleGenerate("real");
            }}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: "none",
              background: "#10b981",
              color: "#022c22",
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            👉 View Authentic Photo
          </button>
        </div>
      )}

      {/* ── Loading Shimmer ── */}
      {loading && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            width: "100%",
            aspectRatio: size === "1792x1024" ? "16/9" : size === "1024x1792" ? "9/16" : "1/1",
            borderRadius: 18,
            background: mode === "real"
              ? "linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(16, 185, 129, 0.08) 100%)"
              : "linear-gradient(90deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(139, 92, 246, 0.08) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.8s infinite",
            border: mode === "real" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(139, 92, 246, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}>
            <div style={{ fontSize: 42 }}>{mode === "real" ? "📷" : "🎨"}</div>
            <div style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700 }}>
              {mode === "real" ? "Searching verified photographic archives…" : "Rendering raw camera photo…"}
            </div>
            <div style={{ color: "rgba(203, 213, 225, 0.6)", fontSize: 12 }}>
              {mode === "real" ? "Scanning high-resolution match photography & portraits" : "Applying natural skin tones and optics"}
            </div>
          </div>
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      )}

      {/* ── Result Display ── */}
      {imageUrl && !loading && (
        <div style={{ marginTop: 24 }}>
          {/* Main Photo Container */}
          <div style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            border: isRealPhoto ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid rgba(139, 92, 246, 0.4)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            background: "rgba(10, 15, 35, 0.9)",
            minHeight: 380,
            aspectRatio: size === "1792x1024" ? "16/9" : size === "1024x1792" ? "9/16" : "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Loading placeholder while image loads */}
            {!imageLoaded && !imageError && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                color: isRealPhoto ? "#6ee7b7" : "#c4b5fd",
                padding: 24,
                textAlign: "center",
              }}>
                <span style={{ fontSize: 36, display: "inline-block", animation: "spin 1.2s linear infinite" }}>⏳</span>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {isRealPhoto ? "Loading high-resolution photograph…" : "Rendering image…"}
                </div>
              </div>
            )}

            {/* Error Fallback */}
            {imageError && (
              <div style={{
                padding: 24,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                color: "#fca5a5",
              }}>
                <span style={{ fontSize: 32 }}>⚠️</span>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Direct Preview Blocked</div>
                <div style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.6)", maxWidth: 360 }}>
                  Click below to open and view the high-resolution photo:
                </div>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.3)",
                    border: "1px solid rgba(16, 185, 129, 0.5)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  🔗 Open High-Res Photo
                </a>
              </div>
            )}

            {/* Image Element */}
            <img
              src={imageUrl}
              alt={photoMeta?.title || prompt}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: imageLoaded ? "block" : "none",
                borderRadius: 20,
              }}
            />

            {/* Authenticity Badge Overlay */}
            {imageLoaded && (
              <div style={{
                position: "absolute",
                top: 14,
                right: 14,
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                background: isRealPhoto
                  ? "rgba(6, 78, 59, 0.85)"
                  : "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(10px)",
                border: isRealPhoto ? "1px solid rgba(52, 211, 153, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                color: isRealPhoto ? "#6ee7b7" : "#e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}>
                {isRealPhoto ? "📸 Authentic Real Photo" : `✨ ${provider || "AI Engine"}`}
              </div>
            )}
          </div>

          {/* Photo Metadata Card (For Real Photos) */}
          {isRealPhoto && photoMeta && (
            <div style={{
              marginTop: 14,
              padding: "16px 20px",
              borderRadius: 16,
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>
                    {photoMeta.title}
                  </div>
                  {photoMeta.description && (
                    <div style={{ fontSize: 13, color: "rgba(203, 213, 225, 0.8)", marginTop: 4, lineHeight: 1.4 }}>
                      {photoMeta.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#34d399", marginTop: 6, fontWeight: 600 }}>
                    Source: {photoMeta.source} {photoMeta.author && `· Credit: ${photoMeta.author}`}
                  </div>
                </div>

                {photoMeta.sourceUrl && (
                  <a
                    href={photoMeta.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#93c5fd",
                      fontSize: 12,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    🔗 View Archive Source
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Gallery Candidate Strip (If multiple real photos exist for this person/place) */}
          {photoList.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                📸 All Available Real Photographs ({photoList.length} shots found):
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(photoList.length, 6)}, 1fr)`,
                gap: 10,
              }}>
                {photoList.map((p, idx) => {
                  const isActive = idx === selectedPhotoIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectPhotoCandidate(idx)}
                      title={p.title}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: isActive ? "2px solid #34d399" : "1px solid rgba(255,255,255,0.1)",
                        transform: isActive ? "scale(1.04)" : "scale(1)",
                        transition: "all 0.2s ease",
                        position: "relative",
                        background: "#0d1326",
                      }}
                    >
                      <img
                        src={p.thumbnail || p.url}
                        alt={p.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {isActive && (
                        <div style={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          background: "#10b981",
                          color: "#fff",
                          borderRadius: 999,
                          width: 16,
                          height: 16,
                          fontSize: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1,
                padding: "13px 20px",
                borderRadius: 14,
                border: "none",
                background: isRealPhoto
                  ? "linear-gradient(135deg, #10b981, #34d399)"
                  : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                color: isRealPhoto ? "#022c22" : "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: isRealPhoto ? "0 6px 24px rgba(16, 185, 129, 0.35)" : "0 6px 24px rgba(139, 92, 246, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              💾 Download {isRealPhoto ? "Real Photo" : "Image"}
            </button>
            <button
              onClick={() => {
                setImageUrl("");
                setPhotoList([]);
                setPhotoMeta(null);
              }}
              style={{
                padding: "13px 20px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#cbd5e1",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🔄 New Search
            </button>
            <button
              onClick={() => handleGenerate()}
              style={{
                padding: "13px 20px",
                borderRadius: 14,
                border: isRealPhoto ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(139, 92, 246, 0.3)",
                background: isRealPhoto ? "rgba(16, 185, 129, 0.1)" : "rgba(139, 92, 246, 0.1)",
                color: isRealPhoto ? "#6ee7b7" : "#c4b5fd",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚡ Search Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}