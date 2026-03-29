import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

// Render এর Environment Variables থেকে URL নেওয়ার চেষ্টা করুন, না থাকলে হার্ডকোড।
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://my-cool-app-cvm7.onrender.com/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ ১. স্ট্যাবল এপিআই ইনস্ট্যান্স
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, []);

  // 🛠️ ২. ইমেজ/ভিডিও ইউআরএল জেনারেটর (নতুন ফাংশন যা আপনি পুরো অ্যাপে পাবেন)
  const getFullAssetUrl = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // যদি অলরেডি ফুল ইউআরএল থাকে (Cloudinary/Google)
    
    // API_URL থেকে /api বাদ দিয়ে মেইন সার্ভার ইউআরএল বের করা
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}/${path.replace(/\\/g, '/')}`;
  }, []);

  const handleLogoutData = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // 🛠️ ৩. ইনিশিয়াল অথ চেক
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me'); 
        if (isMounted) {
          setUser(res.data.user || res.data);
        }
      } catch (err) {
        if (isMounted) handleLogoutData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, [api, handleLogoutData]);

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
    logout,
    isAuthenticated: !!user,
    api,
    getFullAssetUrl // 👈 এটি এখন যেকোনো কম্পোনেন্ট থেকে ব্যবহার করতে পারবেন
  }), [user, loading, api, login, signup, googleLogin, logout, getFullAssetUrl]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};