import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

// আপনার নিজস্ব প্রাইভেট সার্ভার এপিআই ইউআরএল
const API_URL = "https://onyx-drift.com/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ ১. স্ট্যাবল এপিআই ইনস্ট্যান্স (Axios Interceptors সহ)
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // রিকোয়েস্ট ইন্টারসেপ্টর: প্রতিবার টোকেন পাঠাবে
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    // রেসপন্স ইন্টারসেপ্টর: ৪০১ (Unauthorized) আসলে অটো লগআউট
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("🔒 Neural Link Severed! Clearing session...");
          localStorage.removeItem('accessToken');
          setUser(null);
          // সেশন নষ্ট হলে অটো হোমপেজে পাঠিয়ে দেবে
          if (window.location.pathname !== '/') {
             window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // 🛠️ ২. ইন্টারনাল হেল্পার: ডাটা ক্লিনআপ
  const handleLogoutData = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  // 🛠️ ৩. ইনিশিয়াল অথ চেক (Neural Session Recovery)
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // ব্যাকএন্ডের getMe এন্ডপয়েন্ট কল করা
        const res = await api.get('/auth/me'); 
        if (isMounted) {
          setUser(res.data.user || res.data);
        }
      } catch (err) {
        console.error("❌ Neural Session Recovery Failed");
        if (isMounted) handleLogoutData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();
    return () => { isMounted = false; };
  }, [api, handleLogoutData]);

  // 🛠️ ৪. গুগল লগইন মেথড (কাস্টম টোকেন সিস্টেমের সাথে সিঙ্ক)
  const googleLogin = useCallback(async (googleCredential) => {
    try {
      const res = await api.post('/auth/google', { googleToken: googleCredential });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('accessToken', token);
        setUser(user);
        return res.data;
      }
    } catch (err) {
      throw err.response?.data?.msg || "Google Authentication Failed";
    }
  }, [api]);

  // 🛠️ ৫. কাস্টম সাইনআপ ও লগইন মেথড
  const signup = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('accessToken', token);
        setUser(user);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.msg || "Registration Failed";
    }
  }, [api]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('accessToken', token);
        setUser(user);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.msg || "Login Failed";
    }
  }, [api]);

  // 🛠️ ৬. প্রোফাইল আপডেট (Neural Profile Sync)
  const updateProfile = useCallback(async (updateData) => {
    try {
      const res = await api.put('/auth/profile', updateData);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw err.response?.data?.msg || "Update Failed";
    }
  }, [api]);

  // 🛠️ ৭. লগআউট (Neural Session Termination)
  const logout = useCallback(() => {
    handleLogoutData();
    window.location.href = '/'; 
  }, [handleLogoutData]);

  // 🛠️ কনটেক্সট ভ্যালু মেমোইজেশন
  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    googleLogin,
    updateProfile,
    logout,
    isAuthenticated: !!user,
    api 
  }), [user, loading, api, login, signup, googleLogin, updateProfile, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// কাস্টম হুক
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};