import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  // সরাসরি আমাদের কাস্টম জয়েন পেইজে নিয়ে যাবে
  const handleJoin = () => {
    navigate("/join");
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col md:flex-row items-center justify-center overflow-hidden relative">
      
      {/* ব্যাকগ্রাউন্ড নিওন এফেক্ট */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#06b6d4_0%,_transparent_50%)] z-0" />

      {/* বাম পাশের লোগো অংশ (Neural Identity) */}
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

      {/* ডান পাশের অ্যাকশন অংশ */}
      <div className="flex-1 flex flex-col items-center md:items-start p-10 z-10">
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }}
          className="max-w-[500px]"
        >
          <h1 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tight leading-none">
            Happening <br /> <span className="text-cyan-500">now.</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight">
            Sync with the grid today.
          </h2>
          
          <div className="flex flex-col gap-6 w-full max-w-[320px]">
            {/* Create Account Button */}
            <button 
              onClick={handleJoin} 
              className="group relative w-full py-4 bg-cyan-600 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.4)] text-lg"
            >
              <span className="relative z-10">Create Account</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <div className="pt-8 w-full">
               <p className="text-zinc-400 font-bold text-lg mb-4 text-center md:text-left">Already a member?</p>
               <button 
                onClick={handleJoin} 
                className="w-full py-4 bg-transparent border border-cyan-500/30 text-cyan-500 font-bold rounded-full hover:bg-cyan-500/10 hover:border-cyan-500 transition-all text-lg backdrop-blur-sm"
               >
                 Sign in to Grid
               </button>
            </div>

            <p className="text-[10px] text-zinc-600 font-mono mt-4 leading-relaxed">
               By joining, you agree to our <span className="text-cyan-800">Neural Privacy Protocol</span> and <span className="text-cyan-800">Terms of Connectivity</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;