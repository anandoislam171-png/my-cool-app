import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLock, FaHourglassHalf, FaFingerprint, 
  FaSkullCrossbones, FaKey, FaShareAlt, FaCopy, FaCheckCircle 
} from 'react-icons/fa';

const LegacySetup = () => {
  const [isSealed, setIsSealed] = useState(false);
  const [inactivityLimit, setInactivityLimit] = useState(12);
  const [inheritorId, setInheritorId] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // অস্তিত্ব সিল করার লজিক (Stable with useCallback)
  const handleSealExistence = useCallback(() => {
    if (!inheritorId) {
      alert("Please enter a valid Inheritor Neural ID");
      return;
    }
    
    const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const key = `ONYX-DRFT-${randomHash}`;
    setRecoveryKey(key);
    setIsSealed(true);
  }, [inheritorId]);

  const copyKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-[#050505] border border-cyan-500/20 p-8 rounded-[40px] shadow-[0_0_80px_rgba(6,182,212,0.05)] relative overflow-hidden max-w-md mx-auto font-sans">
      
      {/* Background Decor - Neural Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 blur-[100px] rounded-full" />

      {/* Header Section */}
      <div className="flex items-center gap-5 mb-8">
        <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]">
          <FaHourglassHalf 
            className={`text-cyan-500 text-xl ${!isSealed ? 'animate-spin' : ''}`} 
            style={{ animationDuration: '3s' }}
          />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">Century Vault</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isSealed ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500 animate-ping'}`} />
            <p className="text-[9px] text-cyan-500/70 font-mono uppercase tracking-widest">
              {isSealed ? 'NEURAL_SEALED_ACTIVE' : 'AWAITING_INPUT_SEQUENCE'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 mb-8">
        {/* Inheritor ID Input */}
        <div className={`p-4 rounded-2xl border transition-all duration-500 ${isSealed ? 'bg-black/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-cyan-500/30'}`}>
          <p className="text-[10px] text-zinc-500 mb-2 uppercase font-black tracking-widest">Inheritor Neural ID</p>
          <input 
            value={inheritorId}
            onChange={(e) => setInheritorId(e.target.value)}
            disabled={isSealed}
            className="bg-transparent w-full text-cyan-400 outline-none font-mono text-sm placeholder:text-zinc-800 tracking-wider" 
            placeholder="NX-ALPHA-789..." 
          />
        </div>
        
        {/* Death-Switch Slider */}
        <div className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl border border-white/5 relative overflow-hidden group">
          {isSealed && <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-10 flex items-center justify-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Switch_Locked</div>}
          
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <FaSkullCrossbones className="text-rose-500 text-xs opacity-70" />
              <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                Death-Switch Timer
              </p>
            </div>
            <span className="text-cyan-500 font-mono font-black text-xs bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {inactivityLimit}M
            </span>
          </div>
          
          <input 
            type="range" min="1" max="24" 
            disabled={isSealed}
            value={inactivityLimit} 
            onChange={(e) => setInactivityLimit(e.target.value)}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-4"
          />
          <p className="text-[8px] text-zinc-600 uppercase leading-relaxed font-mono italic">
            Target Action: If zero neural activity for {inactivityLimit} months, system will trigger full data migration to inheritor.
          </p>
        </div>

        {/* Access Key Display */}
        <AnimatePresence>
          {isSealed && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl border-dashed"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaKey className="text-purple-400 text-[10px]" />
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Generated Legacy Key</p>
              </div>
              <div className="flex items-center justify-between bg-black/80 p-3 rounded-xl border border-white/5 mb-4 group">
                <code className="text-white font-mono text-xs tracking-wider">{recoveryKey}</code>
                <button onClick={copyKey} className="text-zinc-600 hover:text-cyan-400 transition-colors">
                  {isCopied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                </button>
              </div>
              <button className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2 border border-purple-500/30 transition-all">
                <FaShareAlt className="text-xs" /> Deploy Key to Inheritor
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Action Button */}
      <motion.button 
        whileHover={!isSealed ? { scale: 1.02 } : {}}
        whileTap={!isSealed ? { scale: 0.98 } : {}}
        onClick={handleSealExistence}
        disabled={isSealed}
        className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-3 transition-all duration-700 ${
          isSealed 
          ? "bg-zinc-900 text-zinc-700 border border-white/5 cursor-not-allowed shadow-none" 
          : "bg-cyan-500 text-black shadow-[0_20px_40px_rgba(6,182,212,0.2)] hover:shadow-cyan-500/40 active:shadow-none"
        }`}
      >
        {isSealed ? <FaLock size={14} /> : <FaFingerprint size={18} className="animate-pulse" />}
        {isSealed ? "Existence Sealed" : "Seal My Existence"}
      </motion.button>
      
      <div className="mt-8 space-y-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <p className="text-[7px] text-zinc-500 text-center uppercase tracking-[0.3em] font-mono leading-relaxed">
          Manual override protocols disabled by Onyx-Core. <br/>
          Valid for 100 terrestrial years.
        </p>
        <p className="text-[7px] text-cyan-900 text-center font-black tracking-widest">
          ONYXDRIFT MESH NETWORK // EST 2026
        </p>
      </div>
    </div>
  );
};

export default LegacySetup;