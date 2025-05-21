// src/components/ui/Input.jsx
import React from "react";

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-gray-300 rounded-xl px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}