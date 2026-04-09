import axios from 'axios';

// ১. এক্সিওস ইনস্ট্যান্স তৈরি
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:10000/api' 
    : 'https://onyx-drift.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// ২. রিকোয়েস্ট ইন্টারসেপ্টর: প্রতিটি রিকোয়েস্টে টোকেন যোগ করা
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ৩. রেসপন্স ইন্টারসেপ্টর: টোকেন এক্সপায়ার বা এরর হ্যান্ডেল করা
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // যদি ৪MDE (Unauthorized) এরর আসে এবং এটি আগে ট্রাই করা না হয়ে থাকে
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // যদি রিফ্রেশ টোকেন না থাকে, তবে লুপ না বাড়িয়ে সরাসরি লগআউট
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // রিফ্রেশ এপিআই কল (লুপ এড়াতে সরাসরি 'axios' ব্যবহার করা হয়েছে)
        // নোট: ব্যাকএন্ডে '/auth/refresh' রাউটটি থাকতে হবে
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        // যদি নতুন টোকেন পাওয়া যায় (আপনার ব্যাকএন্ড অনুযায়ী 'token' বা 'accessToken' মিলিয়ে নিন)
        const newToken = res.data.token || res.data.accessToken;

        if (newToken) {
          localStorage.setItem('token', newToken); // নতুন টোকেন সেভ
          
          // হেডার আপডেট করে অরিজিনাল রিকোয়েস্ট আবার পাঠানো
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Token refresh failed - No token in response");
        }
      } catch (refreshError) {
        // যদি রিফ্রেশ টোকেনও কাজ না করে বা এক্সপায়ার হয়
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // অন্য কোনো এরর হলে সরাসরি রিজেক্ট
    return Promise.reject(error);
  }
);

/**
 * 🔒 সেশন ক্লিয়ার করার হেল্পার ফাংশন
 * এটি ইউজারকে লগআউট করাবে এবং লগইন পেজে পাঠাবে
 */
function handleLogout() {
  console.warn("🛡️ Neural Link Severed: Clearing session and redirecting...");
  
  // লুপ এড়াতে আগে চেক করুন আপনি অলরেডি লগইন পেজে আছেন কি না
  if (window.location.pathname === '/login' || window.location.pathname === '/') {
    localStorage.clear(); // শুধু ডাটা ক্লিয়ার করুন, রিডাইরেক্ট দরকার নেই
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  
  // লগইন পেজে রিডাইরেক্ট
  window.location.href = '/login'; 
}

export default api;