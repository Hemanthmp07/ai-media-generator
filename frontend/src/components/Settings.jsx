import { useState } from "react";
import { SettingsIcon, UserIcon, ShieldIcon, CheckIcon } from "./Icons.jsx";

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem("theme") || "dark",
    autoSave: localStorage.getItem("autoSave") !== "false",
    defaultQuality: localStorage.getItem("defaultQuality") || "high",
    notifications: localStorage.getItem("notifications") !== "false",
  });

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(key, value);
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: 10,
        background: "#0a0a0a",
        border: "1px solid var(--border-subtle)",
        marginBottom: 10,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{desc}</div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 9999,
          background: checked ? "#ffffff" : "#262626",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: checked ? "#000000" : "#71717a",
            transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="vercel-card" style={{ maxWidth: 860, margin: "0 auto", padding: "28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="vercel-badge">
            <SettingsIcon size={12} />
            Preferences &amp; Engine
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff", margin: "4px 0" }}>
          Platform Settings &amp; Profile
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Manage rendering quality presets, automation preferences, and platform architecture diagnostics.
        </p>
      </div>

      {/* Account / Profile Card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "#080808",
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#1c1c1c", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <UserIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>Studio Creator</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Pro Plan • Unlimited Generations</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="vercel-badge" style={{ background: "#18181b", color: "#fff" }}>
            ● Active Studio Session
          </span>
        </div>
      </div>

      {/* Toggles */}
      <Toggle
        label="Auto-Save to Gallery History"
        desc="Automatically archive all synthesized photos, videos, and batch assets into your creations vault"
        checked={settings.autoSave}
        onChange={(val) => handleChange("autoSave", val)}
      />

      <Toggle
        label="Generation Audio &amp; Haptic Cues"
        desc="Subtle status signals when long video or batch generation completes"
        checked={settings.notifications}
        onChange={(val) => handleChange("notifications", val)}
      />

      {/* Quality Picker */}
      <div
        style={{
          padding: "16px",
          borderRadius: 10,
          background: "#0a0a0a",
          border: "1px solid var(--border-subtle)",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
          Default Quality Preset
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
          Controls the baseline detail level for newly initiated media syntheses
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "low", label: "Fast (Standard 1024px)" },
            { id: "medium", label: "Balanced (Optimal Precision)" },
            { id: "high", label: "Ultra HD (Archival Grade)" },
          ].map((q) => (
            <button
              key={q.id}
              onClick={() => handleChange("defaultQuality", q.id)}
              className={settings.defaultQuality === q.id ? "vercel-btn-primary" : "vercel-btn-secondary"}
              style={{ flex: 1, minWidth: 140, fontSize: 12, padding: "8px 12px" }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Diagnostics */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 10,
          background: "#080808",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          System Architecture Status
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, fontSize: 12 }}>
          <div>Frontend: <strong style={{ color: "#fff" }}>React 18 + Vite 5</strong></div>
          <div>Photo Archives: <strong style={{ color: "#fff" }}>Wikimedia Commons API</strong></div>
          <div>Neural Video: <strong style={{ color: "#fff" }}>60 FPS Kinematic Engine</strong></div>
          <div>Server Status: <strong style={{ color: "#4ade80" }}>● Operational</strong></div>
        </div>
      </div>
    </div>
  );
}
