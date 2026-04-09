import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams(); // URL থেকে টোকেন নিচ্ছে
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not match!");

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("Neural Key Updated! Re-syncing...");
      setTimeout(() => navigate("/join"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#06b6d4_0%,_transparent_70%)] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">NEW <span className="text-cyan-500">KEY.</span></h2>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">Updating Encryption Protocol</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-[10px] font-mono text-cyan-500/50 uppercase mb-2 ml-2">New Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-cyan-500/50 uppercase mb-2 ml-2">Confirm Key</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "UPDATING CORE..." : "RE-ESTABLISH ACCESS"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;