// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import logo from "../assets/logo_elite_group_b.png";
import { API_URL } from "@/config";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!res.ok) throw new Error(t("login.error"));
      const data = await res.json();
      await login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left section (logo + branding) */}
      <div className="w-full md:w-1/2 bg-[#545386] flex flex-col justify-center items-center p-8 text-white">
        <img src={logo} alt="Elite Group Logo" className="w-40 md:w-48 mb-6" />
        <h1 className="text-2xl md:text-3xl font-bold text-center tracking-wide">INFORMATION TECHNOLOGY</h1>
      </div>

      {/* Right section (form) */}
      <div className="w-full md:w-1/2 bg-[#C8E0EB] flex justify-center items-center p-8">
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Welcome to EliTech!
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4"
            />
            <Input
              type="password"
              placeholder={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-6"
            />
            <Button type="submit" variant="primary" className="w-full">
              {t("login.button")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}