import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  // সরাসরি আমাদের কাস্টম জয়েন (Email/Password) পেইজে নিয়ে যাবে
  const handleJoin = () => {
    navigate("/join");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col md:flex-row items-center justify-center overflow-hidden relative">
      
      {/* 🌌 ব্যাকগ্রাউন্ড নিওন এফেক্ট */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#06b6d4_0%,_transparent_50%)] z-0" />

      {/* 🧠 বাম পাশের লোগো অংশ (Neural Identity) */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[150px] md:text-[250px] font-black italic tracking-tighter leading-none text-white select-none drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            OX<span className="text-cyan-500">.</span>
          </motion.div>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-cyan-500/50 font-mono tracking-[1.5em] text-[10px] md:text-xs uppercase -mt-4 md:-mt-8"
          >
            ONYXDRIFT // NEURAL_LINK_v2.0
          </motion.p>
      </div>

      {/* 🛰️ ডান পাশের অ্যাকশন অংশ (Facebook/X Style Layout) */}
      <div className="flex-1 flex flex-col items-center md:items-start p-10 z-10">
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }}
          className="max-w-[500px] w-full"
        >
          <h1 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tight leading-none text-center md:text-left">
            Happening <br /> <span className="text-cyan-500">now.</span>
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight text-center md:text-left">
            Sync with the grid today.
          </h2>
          
          <div className="flex flex-col gap-4 w-full max-w-[320px] mx-auto md:mx-0">
            
            {/* --- PRIMARY ACTION: CREATE ACCOUNT --- */}
            <button 
              onClick={handleJoin} 
              className="w-full py-3.5 bg-cyan-600 text-white font-bold rounded-full transition-all hover:bg-cyan-500 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-base"
            >
              Create Account
            </button>

            {/* Terms text similar to X/Facebook style */}
            <p className="text-[11px] text-zinc-500 font-sans px-2 leading-tight">
                By signing up, you agree to the <span className="text-cyan-700 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-cyan-700 hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            {/* --- SECONDARY ACTION: LOGIN --- */}
            <div className="mt-10">
                <p className="text-white font-bold text-lg mb-4">Already have an account?</p>
                <button 
                  onClick={handleJoin} 
                  className="w-full py-3.5 bg-transparent border border-zinc-700 text-cyan-500 font-bold rounded-full hover:bg-cyan-500/5 hover:border-cyan-500/50 transition-all text-base backdrop-blur-sm"
                >
                  Sign in
                </button>
            </div>

            {/* --- RECOVERY LINK --- */}
            <button 
              onClick={handleForgotPassword}
              className="mt-4 text-sm text-zinc-500 hover:text-cyan-400 transition-colors font-mono uppercase tracking-widest text-center md:text-left"
            >
              [ Recover Neural Key? ]
            </button>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;