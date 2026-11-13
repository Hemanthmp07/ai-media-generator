import React, { useState } from "react";

const TRENDING_SEARCHES = [
  { term: "Virat Kohli", type: "real", icon: "🏏", studio: "Image Studio", label: "Virat Kohli" },
  { term: "Lionel Messi", type: "real", icon: "⚽", studio: "Image Studio", label: "Lionel Messi" },
  { term: "Narendra Modi", type: "real", icon: "🇮🇳", studio: "Image Studio", label: "PM Modi" },
  { term: "Taj Mahal Sunset", type: "real", icon: "🕌", studio: "Image Studio", label: "Taj Mahal" },
  { term: "Cyberpunk Tokyo in Rain", type: "video", icon: "🎬", studio: "Video Lab", label: "Tokyo Neon" },
  { term: "Futuristic Supercar in Desert", type: "video", icon: "🏎️", studio: "Video Lab", label: "Supercar Video" },
  { term: "Candid 35mm street portrait in Kyoto", type: "ai", icon: "📸", studio: "Image Studio", label: "DSLR Portrait" },
];

const INSPIRATION_SHOWCASE = [
  {
    title: "Virat Kohli Match Photography",
    tag: "100% Real Photo",
    badgeColor: "#10b981",
    type: "real",
    studio: "Image Studio",
    prompt: "Virat Kohli",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/800px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg",
    desc: "Verified archival photography from Wikipedia & Wikimedia Commons with match details",
  },
  {
    title: "Cyberpunk Tokyo Rain Drive",
    tag: "4K 60FPS Video",
    badgeColor: "#06b6d4",
    type: "video",
    studio: "Video Lab",
    prompt: "Futuristic hypercar speeding across a rainy neon Tokyo street at night, cinematic reflections",
    img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    desc: "Cinematic camera tracking shot with realistic neon puddles & volumetric smoke",
  },
  {
    title: "Taj Mahal Archival Sunrise",
    tag: "100% Real Photo",
    badgeColor: "#10b981",
    type: "real",
    studio: "Image Studio",
    prompt: "Taj Mahal",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg",
    desc: "High-resolution architectural marvel capture in natural morning light",
  },
  {
    title: "Candid 35mm Film Portrait",
    tag: "DSLR Photorealism",
    badgeColor: "#8b5cf6",
    type: "ai",
    studio: "Image Studio",
    prompt: "Candid 35mm photo of an artisan crafting pottery in sunlit workshop, natural skin pores, daylight",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    desc: "Raw camera optics with natural skin textures, daylight & zero plastic smoothing",
  },
];

export default function Hero({ onLaunch = () => {} } = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode]   = useState("real"); // "real" | "ai" | "video"

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchMode === "video") {
      onLaunch("Video Lab", searchQuery.trim());
    } else {
      onLaunch("Image Studio", searchQuery.trim(), searchMode);
    }
  };

  const handleQuickChip = (item) => {
    if (item.type === "video") {
      onLaunch("Video Lab", item.term);
    } else {
      onLaunch("Image Studio", item.term, item.type);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto", paddingBottom: 40 }}>

      {/* ── Ambient Glow Backdrop ── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: "48px 24px 56px", marginBottom: 36 }}>
        {/* Glow orbs */}
        <div style={{
          position: "absolute",
          top: "-20%",
          left: "20%",
          width: 500,
          height: 380,
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 80%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: 420,
          height: 320,
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.12) 60%, transparent 80%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }} />

        {/* ── Hero Center Content ── */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 840, margin: "0 auto" }}>

          {/* Floating Pill Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            marginBottom: 20,
            backdropFilter: "blur(12px)",
          }}>
            <span style={{ fontSize: 13, animation: "pulse 2s infinite" }}>⚡</span>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "linear-gradient(90deg, #34d399, #38bdf8, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Authentic Real Photography + 4K AI Video
            </span>
          </div>

          {/* Massive Aesthetic Headline */}
          <h1 style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
            fontWeight: 950,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            margin: "0 0 18px",
            color: "#ffffff",
          }}>
            Real Camera Photos.{" "}
            <span style={{
              background: "linear-gradient(90deg, #38bdf8, #818cf8, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Cinematic Motion.
            </span>
          </h1>

          {/* Catchy Subtitle */}
          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "rgba(203, 213, 225, 0.85)",
            lineHeight: 1.6,
            maxWidth: 680,
            margin: "0 auto 32px",
            fontWeight: 400,
          }}>
            Search 100% genuine photographs of celebrities, athletes, and world landmarks from verified archives — or generate hyper-realistic camera scenes and 60fps videos.
          </p>

          {/* ── Interactive Command Search Bar ── */}
          <div style={{
            background: "linear-gradient(180deg, rgba(16, 23, 50, 0.92), rgba(11, 16, 38, 0.95))",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: "8px 10px 10px",
            maxWidth: 740,
            margin: "0 auto 20px",
            backdropFilter: "blur(20px)",
          }}>

            {/* Mode Switcher Tabs inside the Search Bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8, padding: "4px 6px" }}>
              {[
                { id: "real", label: "Real Photos", icon: "📸", color: "#34d399", desc: "Authentic Wikipedia & Commons Archives" },
                { id: "ai", label: "AI Photorealism", icon: "🎨", color: "#c084fc", desc: "Raw 35mm DSLR Generation" },
                { id: "video", label: "Cinematic Video", icon: "🎬", color: "#38bdf8", desc: "4K Motion Sequences" },
              ].map((tab) => {
                const active = searchMode === tab.id;
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
                      padding: "7px 12px",
                      borderRadius: 12,
                      border: active ? `1px solid ${tab.color}66` : "1px solid transparent",
                      background: active ? `${tab.color}1f` : "transparent",
                      color: active ? tab.color : "rgba(203, 213, 225, 0.65)",
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Input & Action Button */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchMode === "real"
                    ? "Enter any celebrity, athlete, or landmark (e.g. Virat Kohli, Lionel Messi, Taj Mahal)…"
                    : searchMode === "video"
                      ? "Describe the video scene (e.g. Cyberpunk supercar racing through neon Tokyo at night)…"
                      : "Describe raw DSLR camera photo (e.g. Candid 35mm street portrait in Kyoto)…"
                }
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "#f8fafc",
                  fontSize: 15,
                  outline: "none",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "14px 24px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  background: searchMode === "real"
                    ? "linear-gradient(135deg, #10b981, #06b6d4)"
                    : searchMode === "video"
                      ? "linear-gradient(135deg, #06b6d4, #3b82f6)"
                      : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  color: searchMode === "real" ? "#022c22" : "#ffffff",
                  boxShadow: searchMode === "real"
                    ? "0 6px 20px rgba(16, 185, 129, 0.4)"
                    : "0 6px 20px rgba(56, 189, 248, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                {searchMode === "real" ? "🔍 Find Real Photos" : searchMode === "video" ? "🎬 Generate Video" : "✨ Create Photo"}
              </button>
            </form>

          </div>

          {/* Quick Trending Chips */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(203, 213, 225, 0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🔥 Trending Searches:
            </span>
            {TRENDING_SEARCHES.map((t, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickChip(t)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(56, 189, 248, 0.15)";
                  e.currentTarget.style.color = "#38bdf8";
                  e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Key Proof Highlights (Trust Bar) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        marginBottom: 44,
      }}>
        {[
          { icon: "📸", title: "100M+ Real Archive Photos", desc: "Verified Wikimedia & Wikipedia archives", color: "#34d399" },
          { icon: "🎬", title: "4K 60FPS Video Engine", desc: "Fluid motion, aerial drone & tracking", color: "#38bdf8" },
          { icon: "⚡", title: "0.8s Ultra-Fast Retrieval", desc: "Instant high-resolution photo loading", color: "#fb923c" },
          { icon: "🛡️", title: "No Cartoonish Smoothing", desc: "Natural skin pores, optics & real lighting", color: "#c084fc" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: "16px 20px",
              borderRadius: 18,
              background: "rgba(12, 19, 44, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${stat.color}1a`,
              border: `1px solid ${stat.color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{stat.title}</div>
              <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.6)", marginTop: 2 }}>{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Feature Bento Grid (The Creative Suites) ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              CREATIVE STUDIOS
            </span>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 900, color: "#ffffff", margin: "4px 0 0" }}>
              Choose Your Generation Powerhouse
            </h2>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 16,
        }}>

          {/* Card 1: Real Photos Studio (Big Hero Card - 7 cols) */}
          <div
            onClick={() => onLaunch("Image Studio", "", "real")}
            style={{
              gridColumn: "span 7",
              borderRadius: 24,
              padding: "28px 30px",
              background: "linear-gradient(150deg, rgba(16, 185, 129, 0.12), rgba(12, 19, 44, 0.95))",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.1)",
              cursor: "pointer",
              transition: "transform 0.22s ease, border-color 0.22s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.35)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.25)",
                color: "#6ee7b7",
                border: "1px solid rgba(16, 185, 129, 0.4)",
              }}>
                ⭐ Verified Archive Engine
              </span>
              <span style={{ fontSize: 28 }}>📸</span>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: "0 0 8px" }}>
              Real Photos Studio
            </h3>
            <p style={{ fontSize: 13, color: "rgba(203, 213, 225, 0.8)", lineHeight: 1.5, margin: "0 0 20px" }}>
              Get authentic, genuine camera photographs of real people, sports stars (Virat Kohli, Messi), world leaders, monuments, and wildlife. No artificial AI drawings.
            </p>

            {/* Mini preview chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {["Virat Kohli", "Lionel Messi", "Taj Mahal", "Bengal Tiger"].map((name, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.06)",
                    color: "#a7f3d0",
                  }}
                >
                  ✓ {name}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#34d399", fontWeight: 800, fontSize: 14 }}>
              Search Real Archive Photos →
            </div>
          </div>

          {/* Card 2: AI Video Generator (5 cols) */}
          <div
            onClick={() => onLaunch("Video Lab")}
            style={{
              gridColumn: "span 5",
              borderRadius: 24,
              padding: "28px 28px",
              background: "linear-gradient(150deg, rgba(6, 182, 212, 0.12), rgba(12, 19, 44, 0.95))",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.5), 0 0 25px rgba(6, 182, 212, 0.1)",
              cursor: "pointer",
              transition: "transform 0.22s ease, border-color 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(6, 182, 212, 0.2)",
                color: "#7dd3fc",
                border: "1px solid rgba(6, 182, 212, 0.35)",
              }}>
                🎬 60 FPS Cinematic
              </span>
              <span style={{ fontSize: 28 }}>🎥</span>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 8px" }}>
              Video Generator Lab
            </h3>
            <p style={{ fontSize: 13, color: "rgba(203, 213, 225, 0.8)", lineHeight: 1.5, margin: "0 0 20px" }}>
              Produce fluid motion video clips with drone aerial sweeps, slow push-in zoom, and 4K anamorphic grading.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#38bdf8", fontWeight: 800, fontSize: 14 }}>
              Open Video Studio →
            </div>
          </div>

          {/* Card 3: AI Photorealism Studio (4 cols) */}
          <div
            onClick={() => onLaunch("Image Studio", "", "ai")}
            style={{
              gridColumn: "span 4",
              borderRadius: 24,
              padding: "24px",
              background: "linear-gradient(150deg, rgba(139, 92, 246, 0.12), rgba(12, 19, 44, 0.95))",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              cursor: "pointer",
              transition: "transform 0.22s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <span style={{ fontSize: 26, display: "block", marginBottom: 10 }}>🎨</span>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: "0 0 6px" }}>
              DSLR Photorealism AI
            </h4>
            <p style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.7)", lineHeight: 1.4, margin: "0 0 16px" }}>
              Canon EOS R5 &amp; 35mm optical simulation. Natural skin pores &amp; daylight with zero cartoon smoothing.
            </p>
            <div style={{ color: "#c084fc", fontWeight: 800, fontSize: 13 }}>Launch DSLR Studio →</div>
          </div>

          {/* Card 4: Batch Studio (4 cols) */}
          <div
            onClick={() => onLaunch("Batch Tools")}
            style={{
              gridColumn: "span 4",
              borderRadius: 24,
              padding: "24px",
              background: "linear-gradient(150deg, rgba(245, 158, 11, 0.12), rgba(12, 19, 44, 0.95))",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              cursor: "pointer",
              transition: "transform 0.22s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <span style={{ fontSize: 26, display: "block", marginBottom: 10 }}>⚡</span>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: "0 0 6px" }}>
              Batch Media Processor
            </h4>
            <p style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.7)", lineHeight: 1.4, margin: "0 0 16px" }}>
              Queue and render up to 10 prompts concurrently. Instant high-speed parallel production.
            </p>
            <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: 13 }}>Run Batch Tools →</div>
          </div>

          {/* Card 5: Gallery & Creations Vault (4 cols) */}
          <div
            onClick={() => onLaunch("Gallery")}
            style={{
              gridColumn: "span 4",
              borderRadius: 24,
              padding: "24px",
              background: "linear-gradient(150deg, rgba(244, 114, 182, 0.12), rgba(12, 19, 44, 0.95))",
              border: "1px solid rgba(244, 114, 182, 0.3)",
              cursor: "pointer",
              transition: "transform 0.22s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <span style={{ fontSize: 26, display: "block", marginBottom: 10 }}>🖼️</span>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: "0 0 6px" }}>
              Media Vault &amp; History
            </h4>
            <p style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.7)", lineHeight: 1.4, margin: "0 0 16px" }}>
              Access, review, and download every photo and video you searched or created in high resolution.
            </p>
            <div style={{ color: "#f472b6", fontWeight: 800, fontSize: 13 }}>Open Gallery Vault →</div>
          </div>

        </div>
      </div>

      {/* ── Trending Inspiration Showcase (Visual Wall) ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              DISCOVER &amp; OBSESS
            </span>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 900, color: "#ffffff", margin: "4px 0 0" }}>
              Trending Visual Inspiration
            </h2>
          </div>
          <span style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.6)" }}>
            Click any inspiration card to explore instantly
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {INSPIRATION_SHOWCASE.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.type === "video") onLaunch("Video Lab", item.prompt);
                else onLaunch("Image Studio", item.prompt, item.type);
              }}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "rgba(12, 19, 44, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                transition: "all 0.22s ease",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = item.badgeColor;
                e.currentTarget.style.boxShadow = `0 14px 35px rgba(0,0,0,0.6), 0 0 20px ${item.badgeColor}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image Preview */}
              <div style={{ position: "relative", width: "100%", height: 180, background: "#050814" }}>
                <img
                  src={item.img}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  background: "rgba(0,0,0,0.75)",
                  color: item.badgeColor,
                  border: `1px solid ${item.badgeColor}66`,
                  backdropFilter: "blur(6px)",
                }}>
                  {item.tag}
                </div>
              </div>

              {/* Card Meta */}
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", margin: "0 0 6px" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.7)", margin: "0 0 14px", lineHeight: 1.4, flex: 1 }}>
                  {item.desc}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: item.badgeColor }}>
                    Explore Prompt →
                  </span>
                  <span style={{ fontSize: 14 }}>⚡</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
