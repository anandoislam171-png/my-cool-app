import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast";
import axios from "axios";

const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });

  const API_URL = "https://my-cool-app-cvm7.onrender.com";

  // --- Google Login Success Handler ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      // ব্যাকএন্ডে googleToken নামে ডাটা পাঠানো হচ্ছে
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        googleToken: credentialResponse.credential
      });

      if (res.data.token) {
        setAuthData(res.data.user, res.data.token);
        toast.success("Neural Link Established!");
        navigate("/feed");
      }
    } catch (error) {
      // যদি এখানে ৫MD৪ এরর আসে, তবে বুঝতে হবে ব্যাকএন্ডে library ইন্সটল করা নেই
      const errorMsg = error.response?.data?.msg || "Google Sync Failed";
      toast.error(errorMsg);
      console.error("Google Auth Error Details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referralCode", refCode);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { ...formData, referralCode: localStorage.getItem("referralCode") || "" };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      if (response.data.token) {
        setAuthData(response.data.user, response.data.token);
        toast.success(isLogin ? "Neural Sync Complete!" : "Neural Identity Created!");
        navigate("/feed");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || "Grid Connection Failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-mono">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full z-10">
        <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-2">
          {isLogin ? "Sync" : "Join"} the <span className="text-cyan-400">Drift</span>
        </h1>
        <p className="text-gray-500 text-[10px] mb-8 tracking-[0.3em] uppercase opacity-60">
          {searchParams.get("ref") ? `Node Detected: ${searchParams.get("ref")}` : "Direct Neural Access"}
        </p>

        {/* --- Google Login Section --- */}
        <div className="mb-6 flex justify-center w-full">
          <div className="w-full max-w-[320px]"> {/* কন্টেইনার দিয়ে উইডথ কন্ট্রোল করা হয়েছে */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Neural Link Failed")}
              theme="filled_black"
              shape="pill"
              text={isLogin ? "signin_with" : "signup_with"}
              width="320px" // পিক্সেল ভ্যালু ব্যবহার করা হয়েছে ওয়ার্নিং এড়াতে
            />
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#020617] px-4 text-gray-500 tracking-widest">Or Access via Key</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="flex gap-2">
                <input type="text" name="firstName" placeholder="FIRST_NAME" required className="w-full bg-black/40 border border-cyan-900/30 p-4 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all text-sm" onChange={handleChange} />
                <input type="text" name="lastName" placeholder="LAST_NAME" required className="w-full bg-black/40 border border-cyan-900/30 p-4 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all text-sm" onChange={handleChange} />
              </div>
              <input type="text" name="username" placeholder="UNIQUE_USERNAME" required className="w-full bg-black/40 border border-cyan-900/30 p-4 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all text-sm" onChange={handleChange} />
            </>
          )}

          <input type="email" name="email" placeholder="NEURAL_EMAIL" required className="w-full bg-black/40 border border-cyan-900/30 p-4 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all text-sm" onChange={handleChange} />
          <input type="password" name="password" placeholder="ACCESS_KEY" required className="w-full bg-black/40 border border-cyan-900/30 p-4 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all text-sm" onChange={handleChange} />

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-full text-white font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.2)] ${
              loading ? "bg-gray-800 animate-pulse cursor-not-allowed" : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]"
            }`}
          >
            {loading ? "Establishing Link..." : isLogin ? "Initialize Sync" : "Create Identity"}
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            {isLogin ? "New to the grid?" : "Already synced?"}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 text-cyan-500 hover:underline uppercase tracking-widest">
              {isLogin ? "Join_Now" : "Login_Sync"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;