import React, { useRef } from "react";

export default function CoolButton({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  style = {},
  ...rest
}) {
  const ref = useRef(null);

  const getButtonClass = () => {
    if (variant === "secondary") return "vercel-btn-secondary";
    if (variant === "ghost") return "vercel-btn-ghost";
    return "vercel-btn-primary";
  };

  return (
    <button
      ref={ref}
      className={`${getButtonClass()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
