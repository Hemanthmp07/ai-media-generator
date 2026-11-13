import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem("theme") || "dark",
    autoSave: localStorage.getItem("autoSave") === "true",
    defaultQuality: localStorage.getItem("defaultQuality") || "high",
    notifications: localStorage.getItem("notifications") !== "false",
  });

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (key === "theme") localStorage.setItem("theme", value);
    if (key === "autoSave") localStorage.setItem("autoSave", value);
    if (key === "defaultQuality") localStorage.setItem("defaultQuality", value);
    if (key === "notifications") localStorage.setItem("notifications", value);
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px",
      borderRadius: 16,
      background: "rgba(12, 19, 44, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      marginBottom: 12,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{label}</div>
        <div style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.6)", marginTop: 3 }}>{desc}</div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          background: checked ? "linear-gradient(90deg, #38bdf8, #818cf8)" : "rgba(255, 255, 255, 0.12)",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s",
          boxShadow: checked ? "0 0 14px rgba(56, 189, 248, 0.4)" : "none",
        }}
      >
        <div style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: "#ffffff",
          transition: "left 0.2s ease",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: 860,
      margin: "20px auto 40px",
      padding: "30px 32px 36px",
      borderRadius: 26,
      background: "linear-gradient(160deg, rgba(8, 14, 32, 0.98), rgba(14, 22, 52, 0.95))",
      border: "1px solid rgba(251, 146, 60, 0.22)",
      boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{
            background: "linear-gradient(135deg, #fb923c, #f97316)",
            color: "#431407",
            fontWeight: 800,
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 999,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            Preferences &amp; Engine
          </span>
        </div>

        <h2 style={{
          margin: 0,
          fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
          fontWeight: 900,
          background: "linear-gradient(90deg, #fb923c, #f43f5e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Studio Settings
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(203, 213, 225, 0.75)" }}>
          Customize default rendering qualities, auto-saving preferences, and platform configurations.
        </p>
      </div>

      {/* Toggles */}
      <Toggle
        label="Auto-Save Generations"
        desc="Automatically store newly created real photos, AI images, and videos into your gallery history"
        checked={settings.autoSave}
        onChange={(val) => handleChange("autoSave", val)}
      />

      <Toggle
        label="Generation Sound & Status Signals"
        desc="Play subtle audio cues and highlight when complex video/photo generations finish"
        checked={settings.notifications}
        onChange={(val) => handleChange("notifications", val)}
      />

      {/* Quality Picker */}
      <div style={{
        padding: "16px 18px",
        borderRadius: 16,
        background: "rgba(12, 19, 44, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
          Default Quality Preset
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { id: "low", label: "⚡ Fast (Standard Resolution)" },
            { id: "medium", label: "⚖️ Balanced (Optimal)" },
            { id: "high", label: "✨ Ultra HD (Archival Grade)" },
          ].map((q) => (
            <button
              key={q.id}
              onClick={() => handleChange("defaultQuality", q.id)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                border: settings.defaultQuality === q.id ? "1px solid #fb923c" : "1px solid rgba(255,255,255,0.08)",
                background: settings.defaultQuality === q.id ? "rgba(251, 146, 60, 0.2)" : "rgba(255,255,255,0.03)",
                color: settings.defaultQuality === q.id ? "#ffffff" : "rgba(203,213,225,0.7)",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Architecture Info */}
      <div style={{
        padding: "18px 20px",
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          ℹ️ System Information
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "rgba(203, 213, 225, 0.6)" }}>
          <div>Core UI: <span style={{ color: "#38bdf8", fontWeight: 600 }}>React 18 &amp; Vite</span></div>
          <div>Photo Archives: <span style={{ color: "#34d399", fontWeight: 600 }}>Wikipedia &amp; Wikimedia Commons</span></div>
          <div>AI Camera Engine: <span style={{ color: "#c084fc", fontWeight: 600 }}>FLUX Photorealism &amp; DALL·E</span></div>
          <div>Status: <span style={{ color: "#10b981", fontWeight: 700 }}>● Online &amp; Connected</span></div>
        </div>
      </div>

    </div>
  );
}
