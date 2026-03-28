import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

const API_URL = "https://my-cool-app-cvm7.onrender.com/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ ১. স্ট্যাবল এপিআই ইনস্ট্যান্স (Axios Interceptors সহ)
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
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

  // 🛠️ ২. ইন্টারনাল হেল্পার: ডাটা ক্লিনআপ (useCallback জরুরি)
  const handleLogoutData = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // 🛠️ ৩. ইনিশিয়াল অথ চেক (Neural Session Recovery)
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
        console.error("❌ Neural Session Expired");
        // সেশন ফেইল করলে শুধু ডাটা ক্লিন করুন, setLoading(false) finally ব্লকে হবে
        if (isMounted) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();
    return () => { isMounted = false; };
  }, [api]); // handleLogoutData এখানে দেওয়ার দরকার নেই, লুপ হতে পারে

  // 🛠️ ৪. গুগল লগইন মেথড
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

  // 🛠️ ৫. সাইনআপ ও লগইন মেথড
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

  // 🛠️ ৬. ম্যানুয়াল অথ ডাটা সেট
  const setAuthData = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

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

// কাস্টম হুক এক্সপোর্ট
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};