// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        apiService.setToken(token);
        const response = await apiService.getProfile();
        setUser(response.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        apiService.clearToken();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await apiService.login(email, password);
      apiService.setToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed");
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await apiService.register(userData);
      apiService.setToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      console.error("Register failed:", err);
      setError(err.message || "Registration failed");
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
