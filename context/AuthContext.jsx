"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser as loginAPI, registerUser as registerAPI, logout as logoutAPI } from "@/utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await loginAPI(email, password);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const userData = await registerAPI(name, email, password);
    setUser(userData);
  };

  const logout = () => {
    logoutAPI();
    setUser(null);
  };

  const value = React.useMemo(() => ({
    user, loading, login, register, logout
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
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
