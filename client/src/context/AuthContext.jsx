import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

// OnyxDrift API Configuration
const API_URL = "https://my-cool-app-cvm7.onrender.com/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛰️ 1. Neural API Instance (With X-Style Interceptors)
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Request Interceptor: প্রতিটি কল-এ অটো টোকেন যোগ করবে
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response Interceptor: ৪০১ এরর (Unauthorized) পেলে সেশন টার্মিনেট করবে
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          // লুপ ঠেকানোর জন্য শুধু ল্যান্ডিং পেজে না থাকলে রিডাইরেক্ট করবে
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // 🛠️ 2. internal Helper: Session Cleanup
  const handleLogoutData = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // 🛠️ 3. Neural Session Recovery (App Booting)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // ইউজার ডাটা রিকভারি
        const res = await api.get('/auth/me'); 
        if (isMounted) {
          setUser(res.data.user || res.data);
        }
      } catch (err) {
        console.error("❌ Session Sync Failed");
        if (isMounted) handleLogoutData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();
    return () => { isMounted = false; };
  }, [api, handleLogoutData]);

  // 🛠️ 4. Auth Methods (Login, Signup, Google)
  const googleLogin = useCallback(async (googleCredential) => {
    try {
      const res = await api.post('/auth/google', { token: googleCredential });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
      }
    } catch (err) {
      throw err.response?.data?.message || "Google Authentication Failed";
    }
  }, [api]);

  const signup = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || "Registration Failed";
    }
  }, [api]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || "Login Failed";
    }
  }, [api]);

  // 🛠️ 5. Manual Context Updates (Profile Edit এর জন্য)
  const setAuthData = useCallback((userData, token) => {
    if (token) localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  // 🛠️ 6. Termination (Logout)
  const logout = useCallback(() => {
    handleLogoutData();
    window.location.href = '/'; 
  }, [handleLogoutData]);

  // 🚀 Final Memoized Value (X-Performance Optimized)
  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    setAuthData,
    isAuthenticated: !!user,
    api 
  }), [user, loading, api, login, signup, googleLogin, logout, setAuthData]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook: useAuth() দিয়ে সব পেজে ডাটা এক্সেস করুন
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};