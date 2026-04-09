import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // কাস্টম হুক ব্যবহার করা হয়েছে
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, loading: authLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });

  // রেফারেল কোড হ্যান্ডলিং
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

    try {
      if (isLogin) {
        // ১. কাস্টম লগইন লজিক
        await login(formData.email, formData.password);
        toast.success("Neural Sync Complete!");
      } else {
        // ২. কাস্টম সাইনআপ লজিক
        const signupData = {
          ...formData,
          referralCode: localStorage.getItem("referralCode") || "",
        };
        await signup(signupData);
        toast.success("Neural Identity Created!");
      }
      navigate("/feed");
    } catch (error) {
      // AuthContext থেকে আসা এরর মেসেজ দেখানো
      toast.error(error || "Grid Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-mono selection:bg-cyan-500/30">
      
      {/* 🌌 নিওন ডেকোরেশন */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        {/* 🏷️ টাইটেল */}
        <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-2">
          {isLogin ? "Sync" : "Join"} the <span className="text-cyan-400">Drift</span>
        </h1>
        <p className="text-gray-500 text-[10px] mb-8 tracking-[0.3em] uppercase opacity-60">
          {searchParams.get("ref") ? `Node Detected: ${searchParams.get("ref")}` : "Direct Neural Access"}
        </p>

        {/* 📝 ফর্ম সেকশন */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input type="text" name="firstName" placeholder="FIRST_NAME" required className="auth-input" onChange={handleChange} />
                  <input type="text" name="lastName" placeholder="LAST_NAME" required className="auth-input" onChange={handleChange} />
                </div>
                <input type="text" name="username" placeholder="UNIQUE_USERNAME" required className="auth-input" onChange={handleChange} />
              </motion.div>
            )}
          </AnimatePresence>

          <input type="email" name="email" placeholder="NEURAL_EMAIL" required className="auth-input" onChange={handleChange} />
          <input type="password" name="password" placeholder="ACCESS_KEY" required className="auth-input" onChange={handleChange} />

          {/* 🔘 সাবমিট বাটন */}
          <button 
            type="submit"
            disabled={loading || authLoading}
            className={`w-full py-5 rounded-full text-white font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.1)] mt-4 ${
              loading ? "bg-zinc-800 animate-pulse cursor-not-allowed" : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]"
            }`}
          >
            {loading ? "Establishing Link..." : isLogin ? "Initialize Sync" : "Create Identity"}
          </button>
        </form>

        {/* 🔄 মোড সুইচ (Login <-> Signup) */}
        <div className="mt-8 text-sm text-gray-500">
          <p className="font-sans">
            {isLogin ? "New to the grid?" : "Already synced?"}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-cyan-500 hover:text-cyan-300 transition-colors uppercase tracking-widest text-[11px] font-bold"
            >
              {isLogin ? "[ Join_Now ]" : "[ Login_Sync ]"}
            </button>
          </p>
        </div>

        {/* 🔗 ফরগট পাসওয়ার্ড লিঙ্ক (শুধুমাত্র লগইন মোডে) */}
        {isLogin && (
          <button 
            onClick={() => navigate('/forgot-password')}
            className="mt-6 text-[10px] text-zinc-700 hover:text-cyan-900 transition-colors uppercase tracking-widest"
          >
            // Recover_Forgotten_Key
          </button>
        )}
      </motion.div>

      {/* 🎨 Tailwind Custom CSS (আপনার global.css এ রাখতে পারেন অথবা এখানে স্টাইল ট্যাগ হিসেবে) */}
      <style>{`
        .auth-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.1);
          padding: 1rem;
          border-radius: 0.75rem;
          color: #22d3ee;
          outline: none;
          transition: all 0.3s;
          font-size: 0.875rem;
        }
        .auth-input::placeholder {
          color: #27272a;
        }
        .auth-input:focus {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
          background: rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  );
};

export default JoinPage;