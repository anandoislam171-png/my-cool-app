import axios from 'axios';

// ১. এক্সিওস ইনস্ট্যান্স তৈরি
const api = axios.create({
  // প্রোডাকশনে আপনার রেন্ডার ইউআরএল ব্যবহার করুন
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ২. রিকোয়েস্ট ইন্টারসেপ্টর: প্রতিটি রিকোয়েস্টে টোকেন যোগ করা
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Neural Authorization Header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ৩. রেসপন্স ইন্টারসেপ্টর: টোকেন এক্সপায়ার হলে অটো-রিফ্রেশ করা
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // যদি ৪০১ (Unauthorized) এরর আসে এবং আগে ট্রাই করা না হয়ে থাকে
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // রিফ্রেশ টোকেন না থাকলে সরাসরি লগআউট
          throw new Error("No refresh token available");
        }

        // নতুন এক্সেস টোকেন নেওয়ার জন্য রিকোয়েস্ট (সরাসরি axios ব্যবহার করা হয়েছে লুপ এড়াতে)
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;

        // নতুন টোকেন সেভ করা
        localStorage.setItem('accessToken', accessToken);

        // অরিজিনাল রিকোয়েস্টের হেডার আপডেট করে আবার পাঠানো
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // যদি রিফ্রেশ টোকেনও কাজ না করে, তবে সেশন ক্লিয়ার করে লগইন পেজে পাঠান
        console.error("Neural Link Broken: Session Expired");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;