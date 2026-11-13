import { useState, useRef, useEffect } from "react";
import api from "./api.js";
import { CameraIcon, SparklesIcon, DownloadIcon, RefreshIcon, ExternalLinkIcon, CheckIcon } from "./Icons.jsx";

const MODE_OPTIONS = [
  {
    id: "real",
    label: "Real Archive Photos",
    badge: "Verified Archives",
    desc: "Actual camera photographs of celebrities, athletes, leaders, and landmarks from verified Wikipedia & Wikimedia archives",
  },
  {
    id: "ai",
    label: "AI Photorealism",
    badge: "35mm DSLR",
    desc: "Synthesize photorealistic images using raw camera optics, natural lighting, and true skin texture without CGI or cartoon smoothing",
  },
];

const SIZE_OPTIONS = [
  { value: "1024x1024", label: "Square (1:1)" },
  { value: "1792x1024", label: "Landscape (16:9)" },
  { value: "1024x1792", label: "Portrait (9:16)" },
];

const STYLE_OPTIONS = [
  { value: "natural", label: "Natural DSLR" },
  { value: "vivid",   label: "Commercial Studio" },
];

const QUALITY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "hd",       label: "Ultra HD" },
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
  "Candid 35mm photo of an artisan crafting pottery in sunlit workshop, natural skin texture",
  "National Geographic wildlife photo of snow leopard on Himalayan ridge, raw camera shot",
  "Street photo of rainy evening in Kyoto, authentic reflections, DSLR depth of field",
  "Cinematic portrait of sea captain on deck of trawler at dusk, weather-worn features",
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
  const [enhancing, setEnhancing]               = useState(false);
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

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt.trim());
      const m = initialMode || "real";
      setMode(m);
      handleGenerate(m, initialPrompt.trim());
    }
  }, [initialPrompt, initialMode]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const res = await api.post("/prompt/enhance", { prompt: prompt.trim() });
      if (res.data?.data?.enhancedPrompt) {
        setPrompt(res.data.data.enhancedPrompt);
      }
    } catch {
      // Fallback local enhancement if endpoint busy
      setPrompt(`${prompt.trim()}, raw photograph, 35mm lens, natural daylight, highly detailed, authentic optical depth`);
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async (forcedMode, customPrompt) => {
    const activeMode = forcedMode || mode;
    const query = (customPrompt !== undefined ? customPrompt : prompt).trim();
    if (!query) {
      setError(activeMode === "real" ? "Please enter a subject name to search authentic archives." : "Please describe the image to synthesize.");
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
      setProvider(data?.provider || (activeMode === "real" ? "Wikimedia Commons Archive" : "FLUX Photorealism"));
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
          author: data.author || "Archival Source",
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
            prompt: query,
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
        (activeMode === "real" ? "Could not find authentic photographs. Check spelling or try another prominent name." : "Image generation failed. Please try again.");
      setError(msg);
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  };

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

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = `${isRealPhoto ? "real-photo" : "image"}-${Date.now()}.png`;
        a.click();
        return;
      }
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${isRealPhoto ? "real-photo" : "image"}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="vercel-card" style={{ maxWidth: 880, margin: "0 auto", padding: "28px" }}>
      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: 4,
          background: "#080808",
          borderRadius: 10,
          border: "1px solid var(--border-default)",
          marginBottom: 24,
        }}
      >
        {MODE_OPTIONS.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => { setMode(opt.id); setError(""); }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "12px 16px",
                borderRadius: 8,
                border: active ? "1px solid #3f3f46" : "1px solid transparent",
                background: active ? "#141414" : "transparent",
                color: active ? "#ffffff" : "var(--text-secondary)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#ffffff" : "#a1a1aa", display: "flex", alignItems: "center", gap: 6 }}>
                  {opt.id === "real" ? <CameraIcon size={14} /> : <SparklesIcon size={14} />}
                  {opt.label}
                </span>
                <span className="vercel-badge" style={{ fontSize: 10, padding: "2px 7px" }}>
                  {opt.badge}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Subheader */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff", margin: "0 0 4px" }}>
          {mode === "real" ? "Verified Archival Photography" : "AI Photorealistic DSLR Studio"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          {mode === "real"
            ? "Retrieve verified camera photos of famous personalities, sports icons, and world landmarks from archival repositories."
            : "Generate authentic, high-resolution photographic media using optics simulation with zero synthetic smoothing."}
        </p>
      </div>

      {/* Prompt Textarea */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
          rows={3}
          placeholder={
            mode === "real"
              ? "Enter personality, athlete, or monument name (e.g. Virat Kohli, Lionel Messi, Taj Mahal, Narendra Modi)…"
              : "Describe the photographic scene in detail (e.g. Candid 35mm photo of an artisan in a sunlit workshop)…"
          }
          className="vercel-textarea"
          style={{ padding: "14px 16px", fontSize: 14, lineHeight: 1.5 }}
          disabled={loading}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          {mode === "ai" ? (
            <button
              onClick={handleEnhancePrompt}
              disabled={enhancing || !prompt.trim()}
              className="vercel-btn-ghost"
              style={{ fontSize: 11, padding: "4px 8px" }}
            >
              <SparklesIcon size={12} />
              <span>{enhancing ? "Enhancing prompt…" : "Enhance with AI"}</span>
            </button>
          ) : (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Tip: Uses verified Wikipedia &amp; Wikimedia Commons archives
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
            {prompt.length} / 4000
          </span>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>
          {mode === "real" ? "Trending:" : "Inspiration:"}
        </span>
        {(mode === "real" ? REAL_PHOTO_EXAMPLES : AI_PHOTO_EXAMPLES).map((ex, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(ex); setError(""); }}
            className="vercel-btn-ghost"
            style={{
              fontSize: 11,
              padding: "4px 9px",
              background: "#0d0d0d",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
            }}
          >
            {mode === "real" ? ex : `${ex.slice(0, 32)}…`}
          </button>
        ))}
      </div>

      {/* Configuration Strip (Size, Quality, Style) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          padding: 14,
          background: "#080808",
          borderRadius: 10,
          border: "1px solid var(--border-subtle)",
          marginBottom: 20,
        }}
      >
        {/* Size */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Aspect Ratio
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSize(opt.value)}
                className={size === opt.value ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "5px 6px" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Quality Profile
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuality(opt.value)}
                className={quality === opt.value ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "5px 6px" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Camera Lens Profile
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStyle(opt.value)}
                className={style === opt.value ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "5px 6px" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Execute Button */}
      <button
        onClick={() => handleGenerate()}
        disabled={loading || !prompt.trim()}
        className="vercel-btn-primary"
        style={{ width: "100%", padding: "12px 20px", fontSize: 14 }}
      >
        {loading ? (
          <>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#000000" }} />
            {mode === "real" ? "Querying Archival Repositories…" : "Synthesizing DSLR Camera Frame…"} {elapsed > 0 && `(${elapsed}s)`}
          </>
        ) : (
          <>
            {mode === "real" ? "Search Archival Photography" : "Synthesize Photographic Image"}
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: "#180a0a", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Alternative suggestion banner */}
      {realAlternative && !loading && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: "#0f0f0f", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Authentic verified photo of <strong style={{ color: "#fff" }}>"{realAlternative.title}"</strong> is available from {realAlternative.source}.
          </div>
          <button
            onClick={() => { setMode("real"); handleGenerate("real"); }}
            className="vercel-btn-secondary"
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            Switch to Authentic Photo →
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ marginTop: 20 }}>
          <div
            className="shimmer-box"
            style={{
              width: "100%",
              aspectRatio: size === "1792x1024" ? "16/9" : size === "1024x1792" ? "9/16" : "1/1",
              maxHeight: 460,
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
              {mode === "real" ? "Scanning high-resolution archival photographs…" : "Computing optical raytracing & daylight physics…"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {elapsed}s elapsed
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {imageUrl && !loading && (
        <div style={{ marginTop: 24 }}>
          {/* Main Photo Canvas View */}
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--border-default)",
              background: "#080808",
              aspectRatio: size === "1792x1024" ? "16/9" : size === "1024x1792" ? "9/16" : "1/1",
              maxHeight: 520,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            {!imageLoaded && !imageError && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "var(--text-secondary)", padding: 20 }}>
                <span style={{ fontSize: 13 }}>Loading media preview…</span>
              </div>
            )}

            {imageError && (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 13, marginBottom: 8 }}>Direct preview prevented by archive CORS</div>
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="vercel-btn-secondary" style={{ fontSize: 12 }}>
                  <ExternalLinkIcon size={12} />
                  <span>Open Full Resolution Photo</span>
                </a>
              </div>
            )}

            <img
              src={imageUrl}
              alt={photoMeta?.title || prompt}
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageError(true); setImageLoaded(false); }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: imageLoaded ? "block" : "none",
              }}
            />

            {imageLoaded && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  padding: "4px 10px",
                  borderRadius: 9999,
                  background: "rgba(0, 0, 0, 0.85)",
                  border: "1px solid #333333",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#ffffff",
                  backdropFilter: "blur(8px)",
                }}
              >
                {isRealPhoto ? "● Verified Archival Photo" : `● ${provider}`}
              </div>
            )}
          </div>

          {/* Metadata Card for Real Archival Photos */}
          {isRealPhoto && photoMeta && (
            <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 10, background: "#0a0a0a", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                    {photoMeta.title}
                  </div>
                  {photoMeta.description && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
                      {photoMeta.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    Source: {photoMeta.source} {photoMeta.author && `• Credit: ${photoMeta.author}`}
                  </div>
                </div>
                {photoMeta.sourceUrl && (
                  <a
                    href={photoMeta.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vercel-btn-ghost"
                    style={{ fontSize: 11, padding: "4px 8px" }}
                  >
                    <ExternalLinkIcon size={12} />
                    <span>Archive Entry</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Photo Candidates Strip */}
          {photoList.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Archival Shots Found ({photoList.length}):
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(photoList.length, 6)}, 1fr)`, gap: 8 }}>
                {photoList.map((p, idx) => {
                  const isActive = idx === selectedPhotoIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectPhotoCandidate(idx)}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: isActive ? "2px solid #ffffff" : "1px solid var(--border-default)",
                        background: "#080808",
                        position: "relative",
                      }}
                    >
                      <img
                        src={p.thumbnail || p.url}
                        alt={p.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {isActive && (
                        <div style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#ffffff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckIcon size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={handleDownload}
              className="vercel-btn-primary"
              style={{ flex: 1, padding: "10px 16px" }}
            >
              <DownloadIcon size={14} />
              <span>Download {isRealPhoto ? "Photograph" : "Image"}</span>
            </button>
            <button
              onClick={() => { setImageUrl(""); setPhotoList([]); setPhotoMeta(null); }}
              className="vercel-btn-secondary"
              style={{ padding: "10px 16px" }}
            >
              New Search
            </button>
            <button
              onClick={() => handleGenerate()}
              className="vercel-btn-ghost"
              style={{ padding: "10px 16px" }}
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
