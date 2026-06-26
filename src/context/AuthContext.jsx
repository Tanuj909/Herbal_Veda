"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// Helper to decode JWT token on the client side
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

// Client-side cookie management helpers
const setCookie = (name, value, days) => {
  if (typeof window === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict; Secure`;
};

const getCookie = (name) => {
  if (typeof window === "undefined") return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from cookie on mount
  useEffect(() => {
    const storedToken = getCookie("token");
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        setToken(storedToken);
        setUser(decoded);
      } else {
        eraseCookie("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/login", { phone, password });
      if (response.data && response.data.success) {
        const { token: receivedToken, role } = response.data.data;
        const decoded = decodeToken(receivedToken);

        const days = rememberMe ? 7 : 1; // 7 days if remember me, else 1 day
        setCookie("token", receivedToken, days);

        setToken(receivedToken);
        setUser(decoded);
        return { success: true, role };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to sign in";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        phone,
        password,
      });
      if (response.data && response.data.success) {
        const { token: receivedToken, role } = response.data.data;
        const decoded = decodeToken(receivedToken);

        // Auto login: Set cookie (Expires in 7 days)
        setCookie("token", receivedToken, 7);

        setToken(receivedToken);
        setUser(decoded);
        return { success: true, role };
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to register";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    eraseCookie("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
