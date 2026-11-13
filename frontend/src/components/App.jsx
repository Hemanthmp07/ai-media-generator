import { useState } from "react";
import Hero from "./Hero.jsx";
import Dashboard from "./Dashboard.jsx";
import Workspace from "./Workspace.jsx";
import ImageGenerator from "./ImageGenerator.jsx";
import GifGenerator from "./GifGenerator.jsx";
import VideoGenerator from "./VideoGenerator.jsx";
import BatchProcessor from "./BatchProcessor.jsx";
import GalleryHistory from "./GalleryHistory.jsx";
import Settings from "./Settings.jsx";
import { ToastProvider } from "./Toast.jsx";
import {
  LogoIcon,
  SparklesIcon,
  CameraIcon,
  VideoIcon,
  GifIcon,
  LayersIcon,
  GalleryIcon,
  SettingsIcon,
  GridIcon,
  CloseIcon,
} from "./Icons.jsx";

const NAV_ITEMS = [
  { id: null,            label: "Home",        icon: null },
  { id: "Dashboard",     label: "Dashboard",   icon: GridIcon },
  { id: "Workspace",     label: "Workspace",   icon: SparklesIcon },
  { id: "Image Studio",  label: "Images & Real",icon: CameraIcon },
  { id: "GIF Generator", label: "GIFs",        icon: GifIcon },
  { id: "Video Lab",     label: "4K Video",    icon: VideoIcon },
  { id: "Batch Tools",   label: "Batch",       icon: LayersIcon },
  { id: "Gallery",       label: "Creations",   icon: GalleryIcon },
  { id: "Settings",      label: "Settings",    icon: SettingsIcon },
];

const NavBar = ({ active, setActive }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="app-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          gap: 16,
        }}
      >
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => setActive(null)}
        >
          <div style={{ color: "#ffffff", display: "flex", alignItems: "center" }}>
            <LogoIcon size={18} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.02em", color: "#ffffff" }}>
            AI MEDIA GENERATOR
          </span>
          <span className="vercel-badge" style={{ fontSize: 10, padding: "2px 6px" }}>
            v2.4
          </span>
        </div>

        {/* Desktop Nav Items */}
        <div
          style={{
            display: "none",
            gap: 2,
            alignItems: "center",
          }}
          className="desktop-nav-group"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={String(item.id)}
                onClick={() => setActive(item.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: isActive ? "#1c1c1c" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.background = "#121212";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {Icon && <Icon size={13} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="vercel-badge"
            style={{
              padding: "4px 10px",
              background: "#0c0c0c",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Operational</span>
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle vercel-btn-ghost"
            style={{ padding: 6, display: "none" }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <CloseIcon size={16} /> : <GridIcon size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: "#080808",
            borderBottom: "1px solid var(--border-default)",
            padding: "12px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={String(item.id)}
                onClick={() => { setActive(item.id); setMobileMenuOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? "#1c1c1c" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {Icon && <Icon size={15} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav-group { display: flex !important; }
          .mobile-menu-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-menu-toggle { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default function App() {
  const [active, setActive] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialMode, setInitialMode] = useState("real");
  const [initialWorkspaceType, setInitialWorkspaceType] = useState("image");

  const launchStudio = (studioId, prompt = "", mode = "real") => {
    setInitialPrompt(prompt || "");
    setInitialMode(mode || "real");

    if (studioId === "Workspace") {
      setInitialWorkspaceType(mode === "video" ? "video" : mode === "gif" ? "gif" : "image");
      setActive("Workspace");
    } else {
      setActive(studioId);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ToastProvider>
      <div className="vercel-grid-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <NavBar active={active} setActive={setActive} />

        <main style={{ flex: 1, width: "100%", margin: "0 auto", padding: "20px 20px 48px" }}>
          {/* View: Landing Page (Hero) */}
          {!active && (
            <Hero onLaunch={launchStudio} />
          )}

          {/* View: SaaS Dashboard */}
          {active === "Dashboard" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <Dashboard onNavigate={setActive} onLaunchPrompt={launchStudio} />
            </div>
          )}

          {/* View: Unified AI Generation Workspace */}
          {active === "Workspace" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <Workspace
                initialType={initialWorkspaceType}
                initialPrompt={initialPrompt}
                initialMode={initialMode}
              />
            </div>
          )}

          {/* View: Direct Image Studio */}
          {active === "Image Studio" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <ImageGenerator initialPrompt={initialPrompt} initialMode={initialMode} />
            </div>
          )}

          {/* View: Direct GIF Generator */}
          {active === "GIF Generator" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <GifGenerator initialPrompt={initialPrompt} />
            </div>
          )}

          {/* View: Direct Video Lab */}
          {active === "Video Lab" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <VideoGenerator initialPrompt={initialPrompt} />
            </div>
          )}

          {/* View: Batch Tools */}
          {active === "Batch Tools" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <BatchProcessor />
            </div>
          )}

          {/* View: Gallery & Creations */}
          {active === "Gallery" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <GalleryHistory />
            </div>
          )}

          {/* View: Settings & Profile */}
          {active === "Settings" && (
            <div className="animate-fade-in" style={{ marginTop: 10 }}>
              <Settings />
            </div>
          )}

          {/* Vercel-Style Monochrome Footer */}
          <footer
            style={{
              marginTop: 60,
              paddingTop: 24,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              fontSize: 12,
              color: "var(--text-muted)",
              maxWidth: 1140,
              margin: "60px auto 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LogoIcon size={14} />
              <span>AI Media Generator © {new Date().getFullYear()}</span>
              <span>•</span>
              <span style={{ color: "var(--text-secondary)" }}>Vercel Monochrome Edition</span>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setActive(null)} className="vercel-btn-ghost" style={{ fontSize: 12, padding: "2px 6px" }}>
                Home
              </button>
              <button onClick={() => setActive("Workspace")} className="vercel-btn-ghost" style={{ fontSize: 12, padding: "2px 6px" }}>
                Workspace
              </button>
              <button onClick={() => setActive("Gallery")} className="vercel-btn-ghost" style={{ fontSize: 12, padding: "2px 6px" }}>
                Vault
              </button>
              <button onClick={() => setActive("Settings")} className="vercel-btn-ghost" style={{ fontSize: 12, padding: "2px 6px" }}>
                Settings
              </button>
            </div>
          </footer>
        </main>
      </div>
    </ToastProvider>
  );
}
