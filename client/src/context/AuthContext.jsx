import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';

const API_URL = "https://my-cool-app-cvm7.onrender.com/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ১. এপিআই ইনস্ট্যান্সকে useMemo দিয়ে মেমোরিতে রাখা (যাতে বারবার ক্রিয়েট না হয়)
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

  // ২. লগআউট লজিক (এক জায়গায় রাখা ভালো)
  const handleLogoutData = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // প্রোফাইল ডাটা ফেচ করা
        const res = await api.get('/auth/me'); 
        setUser(res.data.user || res.data);
      } catch (err) {
        console.error("❌ Neural Session Expired:", err);
        handleLogoutData();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [api]); // api এখানে ডিপেন্ডেন্সি হিসেবে নিরাপদ কারণ এটি useMemo-তে আছে

  // ৩. সাইনআপ ও লগইন মেথড
  const signup = async (formData) => {
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
  };

  const login = async (email, password) => {
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
  };

  const setAuthData = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    handleLogoutData();
    window.location.href = '/'; 
  };

  // context value-কে memoize করা যাতে অপ্রয়োজনীয় রি-রেন্ডার না হয়
  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    logout,
    setAuthData,
    isAuthenticated: !!user,
    api // আপনার পেজগুলোতে এই api ব্যবহার করতে পারবেন সরাসরি
  }), [user, loading, api]);

  return (
    <AuthContext.Provider value={value}>
      {/* এখানে {!loading && children} এর বদলে সরাসরি {children} দেওয়া ভালো 
         কারণ App.jsx নিজেই loading হ্যান্ডেল করছে। 
      */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);