import React, { useState, useCallback, createContext, useContext } from "react";
import { CheckIcon, CloseIcon } from "./Icons.jsx";

const ToastContext = createContext({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container floating bottom-right */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
          maxWidth: 380,
          width: "calc(100% - 48px)",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              background: "#0c0c0c",
              border: toast.type === "error" ? "1px solid #7f1d1d" : "1px solid #27272a",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
              borderRadius: 10,
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {toast.type === "success" && (
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#ffffff", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckIcon size={12} />
                </div>
              )}
              {toast.type === "error" && (
                <span style={{ color: "#f87171", fontSize: 14 }}>●</span>
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const Toast = ({ message, type }) => (
  <div
    style={{
      padding: "10px 14px",
      borderRadius: 8,
      background: "#111111",
      border: "1px solid #262626",
      color: "#ffffff",
      fontSize: 13,
    }}
  >
    {message}
  </div>
);
