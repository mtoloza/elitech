// src/components/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("lang", e.target.value);
  };

  return (
    <select
      value={i18n.language}
      onChange={changeLanguage}
      className="border border-gray-300 rounded px-2 py-1 text-sm"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}