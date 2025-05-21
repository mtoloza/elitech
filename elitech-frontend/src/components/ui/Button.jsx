// src/components/ui/Button.jsx
import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const base = "px-4 py-2 rounded-xl font-medium transition-colors";
  const variants = {
    primary: "bg-primary text-white hover:bg-[#1f224d]",
    accent: "bg-accent text-white hover:bg-[#2f3eb2]",
    danger: "bg-danger text-white hover:bg-red-700",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}