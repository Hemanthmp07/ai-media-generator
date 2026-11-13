import React from "react";

export const Spinner = ({ size = "md", text = "" }) => {
  const sizePx = {
    sm: 16,
    md: 24,
    lg: 36,
  }[size] || 24;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "spinSlow 0.9s linear infinite" }}
      >
        <circle cx="12" cy="12" r="10" stroke="#262626" strokeWidth="2.5" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {text && (
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
          {text}
        </span>
      )}
    </div>
  );
};

export const ProgressBar = ({ progress = 0, label = "" }) => {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
          <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{Math.round(p)}%</span>
        </div>
      )}
      <div style={{ width: "100%", height: 4, background: "#1c1c1c", borderRadius: 9999, overflow: "hidden" }}>
        <div
          style={{
            width: `${p}%`,
            height: "100%",
            background: "#ffffff",
            borderRadius: 9999,
            transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
};

export const Skeleton = ({ height = 120, width = "100%", borderRadius = 10, style = {} }) => (
  <div
    className="shimmer-box"
    style={{
      height,
      width,
      borderRadius,
      border: "1px solid var(--border-subtle)",
      ...style,
    }}
  />
);
