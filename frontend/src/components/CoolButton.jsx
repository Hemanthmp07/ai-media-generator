import React, { useRef } from "react";

export default function CoolButton({ children, variant = "primary", onClick, ...rest }) {
  const ref = useRef(null);

  const createRipple = (e) => {
    const button = ref.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleMouseDown = (e) => {
    createRipple(e);
    if (rest.onMouseDown) rest.onMouseDown(e);
  };

  return (
    <button
      ref={ref}
      className={`cool-btn ${variant}`}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      {...rest}
    >
      <span className="btn-inner">{children}</span>
    </button>
  );
}
