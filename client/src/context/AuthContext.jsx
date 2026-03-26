import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = "https://my-cool-app-cvm7.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// ইন্টারসেপ্টর: প্রতি রিকোয়েস্টে টোকেন পাঠানো
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // 'accessToken' থেকে 'token' এ পরিবর্তন
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // টোকেন ভ্যালিড কি না চেক করা এবং ইউজার প্রোফাইল আনা
        const res = await api.get('/auth/me'); 
        setUser(res.data.user || res.data); // ব্যাকএন্ড স্ট্রাকচার অনুযায়ী
      } catch (err) {
        console.error("❌ Neural Session Expired:", err);
        handleLogoutData();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // কাস্টম সাইনআপ
  const signup = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.token) {
        saveTokens(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || "Registration Failed";
    }
  };

  // কাস্টম লগইন
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) {
        saveTokens(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || "Login Failed";
    }
  };

  // সরাসরি ডাটা সেভ করার জন্য (JoinPage-এর সুবিধার্থে)
  const setAuthData = (userData, token) => {
    saveTokens(token);
    setUser(userData);
  };

  const loginWithOAuth = (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const logout = () => {
    handleLogoutData();
    window.location.href = '/'; // ল্যান্ডিং পেজে পাঠিয়ে দেওয়া
  };

  const saveTokens = (token) => {
    localStorage.setItem('token', token);
  };

  const handleLogoutData = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    setAuthData, // এটি JoinPage-এ ব্যবহার করবেন
    loginWithOAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);