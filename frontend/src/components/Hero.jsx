import React, { useState } from "react";
import { CameraIcon, VideoIcon, GifIcon, LayersIcon, SparklesIcon, ArrowRightIcon, ZapIcon, ShieldIcon } from "./Icons.jsx";

const TRENDING_SEARCHES = [
  { term: "Virat Kohli", type: "real", studio: "Image Studio", label: "Virat Kohli" },
  { term: "Lionel Messi", type: "real", studio: "Image Studio", label: "Lionel Messi" },
  { term: "Taj Mahal Sunset", type: "real", studio: "Image Studio", label: "Taj Mahal" },
  { term: "Cyberpunk Tokyo in Rain", type: "video", studio: "Video Lab", label: "Tokyo Neon Video" },
  { term: "Futuristic Supercar in Desert", type: "video", studio: "Video Lab", label: "Supercar Video" },
  { term: "Candid 35mm street portrait in Kyoto", type: "ai", studio: "Image Studio", label: "DSLR 35mm" },
  { term: "Pulsing neon geometric wireframe skull", type: "gif", studio: "GIF Generator", label: "Animated Loop" },
];

const INSPIRATION_SHOWCASE = [
  {
    title: "Virat Kohli Match Photography",
    tag: "Authentic Photo",
    type: "real",
    studio: "Image Studio",
    prompt: "Virat Kohli",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/800px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg",
    desc: "Verified high-resolution archival match photography from Wikimedia Commons with complete metadata",
  },
  {
    title: "Cyberpunk Tokyo Rain Drive",
    tag: "4K 60FPS Video",
    type: "video",
    studio: "Video Lab",
    prompt: "Futuristic hypercar speeding across a rainy neon Tokyo street at night, cinematic reflections",
    img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    desc: "Multi-angle cinematic camera tracking sequence with 60 FPS motion blur and volumetric fog",
  },
  {
    title: "Taj Mahal Archival Sunrise",
    tag: "Authentic Photo",
    type: "real",
    studio: "Image Studio",
    prompt: "Taj Mahal",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg",
    desc: "Archival architectural capture in natural golden morning daylight with verified provenance",
  },
  {
    title: "Candid 35mm Film Portrait",
    tag: "DSLR Photorealism",
    type: "ai",
    studio: "Image Studio",
    prompt: "Candid 35mm photo of an artisan crafting pottery in sunlit workshop, natural skin pores, daylight",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    desc: "Optical raytracing simulation with authentic skin pore textures, daylight and zero plastic smoothing",
  },
];

export default function Hero({ onLaunch = () => {} } = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode]   = useState("real"); // "real" | "ai" | "video" | "gif"

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      onLaunch("Workspace");
      return;
    }

    if (searchMode === "video") {
      onLaunch("Video Lab", q);
    } else if (searchMode === "gif") {
      onLaunch("GIF Generator", q);
    } else {
      onLaunch("Image Studio", q, searchMode);
    }
  };

  const handleQuickChip = (item) => {
    if (item.type === "video") {
      onLaunch("Video Lab", item.term);
    } else if (item.type === "gif") {
      onLaunch("GIF Generator", item.term);
    } else {
      onLaunch("Image Studio", item.term, item.type);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 1140, margin: "0 auto", paddingBottom: 60 }}>
      {/* ── Minimal Hero Section ── */}
      <section style={{ textAlign: "center", padding: "64px 20px 48px", position: "relative" }}>
        {/* Floating pill badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div className="vercel-badge" style={{ padding: "4px 12px", background: "#0a0a0a" }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
            <span>Next-Gen Media Synthesis Platform</span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>v2.4 Pro</span>
          </div>
        </div>

        {/* Hero Heading */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5.8vw, 4.8rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            maxWidth: 900,
            margin: "0 auto 20px",
          }}
        >
          Create Anything. Imagine Everything.
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            maxWidth: 680,
            margin: "0 auto 36px",
            fontWeight: 400,
          }}
        >
          Synthesize verified authentic photographs, 60 FPS multi-angle cinematic video, and animated loops with precision prompt intelligence.
        </p>

        {/* ── Interactive Command Center Search Bar ── */}
        <div
          className="vercel-card"
          style={{
            maxWidth: 740,
            margin: "0 auto 20px",
            padding: "8px 10px 10px",
            background: "#080808",
            border: "1px solid var(--border-default)",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9)",
          }}
        >
          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8, padding: "2px" }}>
            {[
              { id: "real", label: "Real Photos", icon: CameraIcon },
              { id: "ai", label: "AI Photorealism", icon: SparklesIcon },
              { id: "video", label: "4K Video", icon: VideoIcon },
              { id: "gif", label: "Animated GIF", icon: GifIcon },
            ].map((tab) => {
              const active = searchMode === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchMode(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: active ? "1px solid #3f3f46" : "1px solid transparent",
                    background: active ? "#171717" : "transparent",
                    color: active ? "#ffffff" : "var(--text-secondary)",
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input & Action */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === "real"
                  ? "Enter any celebrity, athlete, or landmark (e.g. Virat Kohli, Lionel Messi, Taj Mahal)…"
                  : searchMode === "video"
                    ? "Describe cinematic video (e.g. Futuristic supercar speeding on neon highway at night)…"
                    : searchMode === "gif"
                      ? "Describe animated loop (e.g. golden koi fish swimming in dark pond with ripples)…"
                      : "Describe raw DSLR camera photo (e.g. Candid 35mm street portrait in Kyoto)…"
              }
              className="vercel-input"
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              className="vercel-btn-primary"
              style={{ padding: "12px 20px", fontSize: 13 }}
            >
              <span>Start Creating</span>
              <ArrowRightIcon size={14} />
            </button>
          </form>
        </div>

        {/* Trending Chips */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>
            Trending:
          </span>
          {TRENDING_SEARCHES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChip(t)}
              className="vercel-btn-ghost"
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 9999,
                background: "#0c0c0c",
                border: "1px solid var(--border-default)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Action CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button
            onClick={() => onLaunch("Workspace")}
            className="vercel-btn-primary"
            style={{ padding: "10px 22px", fontSize: 13 }}
          >
            Launch Unified Workspace
          </button>
          <button
            onClick={() => onLaunch("Gallery")}
            className="vercel-btn-secondary"
            style={{ padding: "10px 22px", fontSize: 13 }}
          >
            Explore Creations Vault
          </button>
        </div>
      </section>

      {/* ── Proof / Trust Bar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 48,
        }}
      >
        {[
          { title: "100M+ Archival Assets", desc: "Verified Wikimedia & Wikipedia repositories", stat: "100% Real" },
          { title: "60 FPS Neural Kinematics", desc: "Smooth multi-angle camera tracking shots", stat: "4K Motion" },
          { title: "0.8s Retrieval Latency", desc: "Instant high-resolution photo loading", stat: "Ultra Fast" },
          { title: "Zero Plastic Smoothing", desc: "Natural skin pores, optics & real lighting", stat: "Raw 35mm" },
        ].map((item, i) => (
          <div
            key={i}
            className="vercel-card"
            style={{ padding: "18px 20px", background: "#080808" }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              {item.stat}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── Feature Bento Grid ── */}
      <div style={{ marginBottom: 54 }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Generation Powerhouse
          </span>
          <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", margin: "4px 0 0" }}>
            The Generative Media Suite
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {/* Card 1: Real Camera Photos (7 cols) */}
          <div
            onClick={() => onLaunch("Image Studio", "", "real")}
            className="vercel-card"
            style={{
              gridColumn: "span 7",
              padding: "28px",
              cursor: "pointer",
              background: "#080808",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span className="vercel-badge">
                <CameraIcon size={12} />
                Verified Archive Engine
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>● 100% Genuine</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
              Authentic Archival Photography
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px" }}>
              Get verified, genuine camera photographs of real athletes (Virat Kohli, Messi), world leaders, historic monuments, and wildlife.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {["Virat Kohli", "Lionel Messi", "Taj Mahal", "Eiffel Tower"].map((name, i) => (
                <span key={i} className="vercel-badge" style={{ fontSize: 11, background: "#111" }}>
                  ✓ {name}
                </span>
              ))}
            </div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: "#ffffff", fontSize: 13, fontWeight: 600 }}>
              <span>Search Archival Photos</span>
              <ArrowRightIcon size={14} />
            </div>
          </div>

          {/* Card 2: 4K Cinematic Video (5 cols) */}
          <div
            onClick={() => onLaunch("Video Lab")}
            className="vercel-card"
            style={{
              gridColumn: "span 5",
              padding: "28px",
              cursor: "pointer",
              background: "#080808",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span className="vercel-badge">
                <VideoIcon size={12} />
                60 FPS Kinematics
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>● Multi-Angle</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
              Cinematic Video Lab
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px" }}>
              Synthesize continuous motion sequences with drone aerial sweeps, slow push-in zoom, and 4K anamorphic grading.
            </p>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: "#ffffff", fontSize: 13, fontWeight: 600 }}>
              <span>Open Video Studio</span>
              <ArrowRightIcon size={14} />
            </div>
          </div>

          {/* Card 3: AI Photorealism (4 cols) */}
          <div
            onClick={() => onLaunch("Image Studio", "", "ai")}
            className="vercel-card"
            style={{ gridColumn: "span 4", padding: "24px", cursor: "pointer", background: "#080808" }}
          >
            <div className="vercel-badge" style={{ marginBottom: 14 }}>
              <SparklesIcon size={12} />
              DSLR Optics
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>
              AI Photorealism Studio
            </h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Canon EOS R5 &amp; 35mm optical simulation with natural skin pores and daylight.
            </p>
            <div style={{ color: "#ffffff", fontSize: 12, fontWeight: 600 }}>Launch DSLR Studio →</div>
          </div>

          {/* Card 4: GIF Generator (4 cols) */}
          <div
            onClick={() => onLaunch("GIF Generator")}
            className="vercel-card"
            style={{ gridColumn: "span 4", padding: "24px", cursor: "pointer", background: "#080808" }}
          >
            <div className="vercel-badge" style={{ marginBottom: 14 }}>
              <GifIcon size={12} />
              Animation Loops
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>
              Animated GIF Studio
            </h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Synthesize multi-frame looping sequences, stop motion, and retro VHS motion clips.
            </p>
            <div style={{ color: "#ffffff", fontSize: 12, fontWeight: 600 }}>Launch GIF Studio →</div>
          </div>

          {/* Card 5: Batch Tools (4 cols) */}
          <div
            onClick={() => onLaunch("Batch Tools")}
            className="vercel-card"
            style={{ gridColumn: "span 4", padding: "24px", cursor: "pointer", background: "#080808" }}
          >
            <div className="vercel-badge" style={{ marginBottom: 14 }}>
              <LayersIcon size={12} />
              Parallel Queue
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>
              Batch Queue Processor
            </h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Queue up to 10 prompts concurrently for high-speed parallel production.
            </p>
            <div style={{ color: "#ffffff", fontSize: 12, fontWeight: 600 }}>Run Batch Tools →</div>
          </div>
        </div>
      </div>

      {/* ── Curated Inspiration Showcase Wall ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Curated Showcase
            </span>
            <h2 style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.8rem)", fontWeight: 800, color: "#ffffff", margin: "4px 0 0" }}>
              Trending Visual Inspiration
            </h2>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Click any inspiration card to launch
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {INSPIRATION_SHOWCASE.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.type === "video") onLaunch("Video Lab", item.prompt);
                else onLaunch("Image Studio", item.prompt, item.type);
              }}
              className="vercel-card"
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#080808",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 170, background: "#000" }}>
                <img
                  src={item.img}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,0.85)", border: "1px solid #333", fontSize: 10, color: "#fff", fontWeight: 600 }}>
                  {item.tag}
                </div>
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4, margin: "0 0 14px", flex: 1 }}>
                  {item.desc}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#ffffff" }}>
                    Explore Prompt
                  </span>
                  <ArrowRightIcon size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
