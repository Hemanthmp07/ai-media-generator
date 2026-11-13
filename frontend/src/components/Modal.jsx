import React, { useEffect } from "react";
import { CloseIcon } from "./Icons.jsx";

export const Modal = ({ isOpen, title, children, onClose, actions, maxWidth = 560 }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "#0c0c0c",
          border: "1px solid var(--border-default)",
          borderRadius: 14,
          padding: "24px",
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.9)",
          color: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "#ffffff", margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="vercel-btn-ghost"
            style={{ padding: 6 }}
            aria-label="Close modal"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div style={{ marginBottom: actions ? 20 : 0 }}>
          {children}
        </div>

        {actions && (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={action.primary ? "vercel-btn-primary" : "vercel-btn-secondary"}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
