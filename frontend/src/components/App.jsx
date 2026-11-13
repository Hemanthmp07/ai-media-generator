import { useState } from "react";
import Hero from "./Hero.jsx";
import ImageGenerator from "./ImageGenerator.jsx";
import VideoGenerator from "./VideoGenerator.jsx";
import BatchProcessor from "./BatchProcessor.jsx";
import GalleryHistory from "./GalleryHistory.jsx";
import Settings from "./Settings.jsx";

const NAV_ITEMS = [
  { id: null,           label: "Home",            icon: "🏠", color: "#a78bfa" },
  { id: "Image Studio", label: "Real Photos & AI", icon: "📸", color: "#34d399" },
  { id: "Video Lab",    label: "Video Generator",  icon: "🎬", color: "#38bdf8" },
  { id: "Gallery",      label: "Gallery",          icon: "🖼️", color: "#f472b6" },
  { id: "Batch Tools",  label: "Batch",            icon: "⚡", color: "#34d399" },
  { id: "Settings",     label: "Settings",         icon: "🛠️", color: "#fb923c" },
];

const NavBar = ({ active, setActive }) => (
  <nav style={{
    position: "relative",
    top: 0,
    zIndex: 100,
    width: "100%",
    backdropFilter: "blur(18px) saturate(180%)",
    WebkitBackdropFilter: "blur(18px) saturate(180%)",
    background: "linear-gradient(90deg, rgba(7,10,24,0.96) 0%, rgba(15,18,40,0.94) 100%)",
    borderBottom: "1px solid rgba(139,92,246,0.18)",
    boxShadow: "0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
  }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: 12 }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setActive(null)}>
        <span style={{
          fontSize: 26,
          filter: "drop-shadow(0 0 10px rgba(167,139,250,0.8))",
          lineHeight: 1,
        }}>🎨</span>
        <span style={{
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: "-0.02em",
          background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>AI Media Generator</span>
      </div>

      {/* Nav Pills */}
      <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "nowrap", flexShrink: 0 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={String(item.id)}
              onClick={() => setActive(item.id)}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 999,
                border: isActive
                  ? `1px solid ${item.color}55`
                  : "1px solid transparent",
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}22, ${item.color}11)`
                  : "transparent",
                color: isActive ? item.color : "rgba(203,213,225,0.7)",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: isActive ? `0 0 18px ${item.color}33, inset 0 1px 0 ${item.color}22` : "none",
                textShadow: isActive ? `0 0 12px ${item.color}88` : "none",
                letterSpacing: "0.01em",
                outline: "none",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "#f1f5f9";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(203,213,225,0.7)";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.border = "1px solid transparent";
                }
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span style={{
                  position: "absolute",
                  bottom: -1,
                  left: "20%",
                  width: "60%",
                  height: 2,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                  boxShadow: `0 0 8px ${item.color}`,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

export default function App() {
  const [active, setActive] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialMode, setInitialMode] = useState("real");

  const launchStudio = (studioId, prompt = "", mode = "real") => {
    setInitialPrompt(prompt || "");
    setInitialMode(mode || "real");
    setActive(studioId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar active={active} setActive={setActive} />

      <main className="app-root" style={{ flex: 1, width: "100%", margin: "0 auto", padding: "16px 20px 40px" }}>
        {!active && (
          <Hero onLaunch={launchStudio} />
        )}

        {active === "Image Studio" && (
          <div style={{ marginTop: 14 }}>
            <ImageGenerator initialPrompt={initialPrompt} initialMode={initialMode} />
          </div>
        )}

        {active === "Video Lab" && (
          <div style={{ marginTop: 14 }}>
            <VideoGenerator initialPrompt={initialPrompt} />
          </div>
        )}

        {active === "Batch Tools" && (
          <div style={{ marginTop: 14 }}>
            <BatchProcessor />
          </div>
        )}

        {active === "Gallery" && (
          <div style={{ marginTop: 14 }}>
            <GalleryHistory />
          </div>
        )}

        {active === "Settings" && (
          <div style={{ marginTop: 14 }}>
            <Settings />
          </div>
        )}

        {!active && (
          <footer className="footer" style={{ marginTop: 30, opacity: 0.6, textAlign: "center", fontSize: 13 }}>
            Crafted with ✨ for creators • Authentic Archival Photography &amp; 4K Cinematic Video Suite
          </footer>
        )}
      </main>
    </div>
  );
}
