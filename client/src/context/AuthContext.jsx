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
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // রিকোয়েস্ট ইন্টারসেপ্টর: টোকেন হেডার সেট করবে
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // রেসপন্স ইন্টারসেপ্টর: ৪০১ (Unauthorized) আসলে অটো লগআউট
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // যদি ৪০১ এরর আসে এবং টোকেন থেকে থাকে, তবেই ক্লিনআপ করবে
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized! Clearing session...");
          localStorage.removeItem('token');
          setUser(null);
          // ৪৩১ এরর এড়াতে এখানে উইন্ডো রিলোড দেওয়া হয়নি
        }
        return Promise.reject(error);
      }
    );

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
          // সার্ভার রেসপন্স চেক: res.data.user অথবা res.data
          const userData = res.data.user || res.data;
          setUser(userData);
        }
      } catch (err) {
        console.error("❌ Neural Session Expired or Network Error");
        if (isMounted) handleLogoutData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();
    return () => { isMounted = false; };
  }, [api, handleLogoutData]);

  // 🛠️ ৪. গুগল লগইন মেথড
  const googleLogin = useCallback(async (googleCredential) => {
    try {
      const res = await api.post('/auth/google', { token: googleCredential });
      const data = res.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user || data);
        return data;
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
        setUser(res.data.user || res.data);
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
        setUser(res.data.user || res.data);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || "Login Failed";
    }
  }, [api]);

  // 🛠️ ৬. ম্যানুয়াল অথ ডাটা সেট
  const setAuthData = useCallback((userData, token) => {
    if (token) localStorage.setItem('token', token);
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

// কাস্টম হুক
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};