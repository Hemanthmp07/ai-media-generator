import React, { useState } from "react";
import ImageGenerator from "./ImageGenerator.jsx";
import VideoGenerator from "./VideoGenerator.jsx";
import GifGenerator from "./GifGenerator.jsx";
import { CameraIcon, VideoIcon, GifIcon, SparklesIcon } from "./Icons.jsx";

const TABS = [
  { id: "image", label: "Image & Real Photos", icon: CameraIcon, desc: "High-resolution archival photography & 35mm DSLR synthesis" },
  { id: "gif",   label: "Animated GIF",        icon: GifIcon,    desc: "Multi-frame looping animations & cyber glitch effects" },
  { id: "video", label: "4K Cinematic Video",  icon: VideoIcon,  desc: "Multi-angle 60 FPS camera motion & drone kinematics" },
];

export default function Workspace({ initialType = "image", initialPrompt = "", initialMode = "real" }) {
  const [activeTab, setActiveTab] = useState(initialType || "image");

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingBottom: 40 }}>
      {/* Top Workspace Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          padding: "12px 18px",
          background: "#0c0c0c",
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff" }} className="pulse-dot" />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", color: "#ffffff" }}>
            AI Media Workspace
          </span>
          <span className="vercel-badge" style={{ fontSize: 10, padding: "2px 6px" }}>
            v2.4 Pro
          </span>
        </div>

        {/* Studio Type Selector Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#050505", padding: 3, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: isActive ? "#262626" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
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
      </div>

      {/* Active Studio View */}
      <div className="animate-fade-in">
        {activeTab === "image" && (
          <ImageGenerator initialPrompt={initialPrompt} initialMode={initialMode} />
        )}

        {activeTab === "gif" && (
          <GifGenerator initialPrompt={initialPrompt} />
        )}

        {activeTab === "video" && (
          <VideoGenerator initialPrompt={initialPrompt} />
        )}
      </div>
    </div>
  );
}
