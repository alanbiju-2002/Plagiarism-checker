import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Force port 5000 for local development as Node backend runs there
const API_BASE_URL = "http://localhost:5000";
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // ✅ FIXED LOGIN
  const login = async (username, password) => {
    try {

      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });

      // Backend returns { token, user }
      const accessToken = response.data?.token;
      if (!accessToken) throw new Error('No access token returned');

      localStorage.setItem("accessToken", accessToken);
      const userObj = response.data.user;
      localStorage.setItem("user", JSON.stringify(userObj));

      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setUser(userObj);

      return {
        success: true,
        user: userObj,
      };
    } catch (error) {
      console.error("LOGIN ERROR:", error.response?.data);
      return {
        success: false,
        message:
          error.response?.data?.message || "Invalid username or password",
      };
    }
  };

  const register = async (userData) => {
    try {
      // Axios automatically handles Content-Type for FormData
      const response = await axios.post("/api/auth/register", userData);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("REGISTER ERROR:", error.response?.data);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          (error.response?.data?.errors && error.response.data.errors.map(e => e.msg).join(', ')) ||
          "Registration failed",
      };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await axios.put("/api/auth/update", formData);

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return { success: true, user: response.data.user, message: response.data.message };
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error.response?.data);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          (error.response?.data?.errors && error.response.data.errors.map(e => e.msg).join(', ')) ||
          "Update failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
