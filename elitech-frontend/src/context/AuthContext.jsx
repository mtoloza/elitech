// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { API_URL } from "@/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Función para manejar el refresh del token
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to refresh token");
      
      const data = await response.json();
      setAccessToken(data.access_token);
      return data.access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return null;
    }
  };

  // Función para hacer peticiones con manejo automático de refresh token
  const fetchWithAuth = async (url, options = {}) => {
    if (!accessToken) return fetch(url, options);

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        // Token expirado, intentar refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Reintentar la petición con el nuevo token
          headers.Authorization = `Bearer ${newToken}`;
          return fetch(url, { ...options, headers });
        }
      }
      
      return response;
    } catch (error) {
      console.error("Error in fetchWithAuth:", error);
      throw error;
    }
  };

  // Inicialización: cargar tokens del storage
  useEffect(() => {
    const storedAccessToken = sessionStorage.getItem("accessToken");
    const storedRefreshToken = sessionStorage.getItem("refreshToken");
    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
    }
    setIsLoading(false);
  }, []);

  // Obtener datos del usuario cuando accessToken cambie
  useEffect(() => {
    const fetchUser = async () => {
      if (accessToken) {
        try {
          const response = await fetchWithAuth(`${API_URL}/auth/me`);
          if (!response.ok) throw new Error("Failed to get user data");
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          setUser(null);
          console.error("Error fetching user:", error);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [accessToken]);

  const login = async (tokens) => {
    try {
      const { access_token, refresh_token } = tokens;
      sessionStorage.setItem("accessToken", access_token);
      sessionStorage.setItem("refreshToken", refresh_token);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      toast.success(t("login.success"));
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(t("login.error"));
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    toast.success(t("logout.success"));
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        fetchWithAuth,
        isAuthenticated: !!accessToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}