import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api"; // আপনার তৈরি করা axios instance
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Recovery link sent to your neural mail!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Link transmission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#06b6d4_0%,_transparent_70%)] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">RECOVER <span className="text-cyan-500">ACCESS.</span></h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Enter email to sync recovery key</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono text-cyan-500/50 uppercase mb-2 ml-2">Neural Identity (Email)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
              placeholder="name@onyx.drift"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95 disabled:opacity-50"
          >
            {loading ? "TRANSMITTING..." : "SEND RECOVERY LINK"}
          </button>
        </form>

        <button 
          onClick={() => navigate("/")}
          className="w-full mt-6 text-zinc-600 hover:text-zinc-400 font-mono text-[10px] uppercase transition-colors"
        >
          [ Abort and Return ]
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;