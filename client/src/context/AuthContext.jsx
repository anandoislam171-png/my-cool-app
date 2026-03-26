import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// ১. API Configuration (Render Backend URL)
// লোকালহোস্ট বাদ দিয়ে সরাসরি আপনার রেন্ডার ইউআরএল এখানে সেট করা হয়েছে
const API_URL = "https://my-cool-app-cvm7.onrender.com/api";

// Axios Instance তৈরি করা যাতে বারবার URL লিখতে না হয়
const api = axios.create({
  baseURL: API_URL,
});

// ইন্টারসেপ্টর: প্রতি রিকোয়েস্টে অটোমেটিক টোকেন পাঠাবে
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ২. সেশন পারসিস্টেন্স (Session Persistence)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // টোকেন থাকলে সার্ভার থেকে ফ্রেশ ইউজার ডাটা নিয়ে আসবে
        const res = await api.get('/auth/me'); 
        setUser(res.data);
      } catch (err) {
        console.error("❌ Neural Session Expired:", err);
        handleLogoutData();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // ৩. কাস্টম সাইনআপ (Signup)
  const signup = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      
      if (res.data.accessToken) {
        saveTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      // এরর মেসেজ হ্যান্ডলিং
      throw err.response?.data?.message || "Registration Failed";
    }
  };

  // ৪. কাস্টম লগইন (Login)
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      saveTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || "Login Failed";
    }
  };

  // ৫. সোশ্যাল লগইন (OAuth2) - Render ডোমেইন অনুযায়ী
  const loginWithOAuth = (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  // ৬. লগআউট (Logout)
  const logout = () => {
    handleLogoutData();
    window.location.href = '/login';
  };

  // --- হেল্পার ফাংশনস ---
  const saveTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  };

  const handleLogoutData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithOAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};