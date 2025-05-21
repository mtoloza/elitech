import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRedirect = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/dashboard" : "/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-gray-700 text-lg mb-6">
        {t("notfound.message")}
      </p>
      <button
        onClick={handleRedirect}
        className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
      >
        {t("notfound.button")}
      </button>
    </div>
  );
}