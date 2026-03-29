import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaRegBell, FaSignOutAlt, FaUserCircle, FaUserCheck, 
  FaPlus, FaFileAlt, FaCamera, FaVideo, FaBroadcastTower,
  FaVolumeUp, FaVolumeMute, FaShareAlt, FaEye 
} from 'react-icons/fa'; 
import { HiOutlineMenuAlt4 } from "react-icons/hi"; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Navbar = ({ setIsPostModalOpen, toggleSidebar, socket }) => { 
  const navigate = useNavigate();
  const { user, logout, api, isAuthenticated } = useAuth(); 
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);

  // সার্চ লজিক
  useEffect(() => {
    const fetchResults = async () => {
      if (localSearch.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/users/search', { params: { q: localSearch } });
        setSearchResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("🔍 Search failed:", err.message);
      } finally {
        setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(fetchResults, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, api]);

  return (
    // 'sticky top-0' এবং 'z-[1000]' নিশ্চিত করে এটি সবার উপরে থাকবে
    <nav className="w-full h-[64px] bg-[#020617]/80 backdrop-blur-2xl border-b border-white/[0.05] z-[1000] flex items-center justify-between px-4 lg:px-8 sticky top-0 font-sans shadow-2xl">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-xl lg:hidden transition-all">
          <HiOutlineMenuAlt4 size={20} className="text-cyan-400" />
        </button>
        
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/feed')}>
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
            <span className="text-black font-black text-xs italic">OX</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">
              ONYX<span className="text-cyan-500">DRIFT</span>
            </h1>
            <span className="text-[7px] text-cyan-500/50 font-mono tracking-[0.3em]">NEURAL_INTERFACE</span>
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-[460px] mx-6 relative">
        <div className="relative group">
          <FaSearch size={11} className={`absolute left-4 top-1/2 -translate-y-1/2 ${loading ? 'animate-spin text-cyan-500' : 'text-zinc-500'}`} />
          <input 
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="SCAN NEURAL ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[10px] text-white font-bold uppercase tracking-widest outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)}></div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div key={result._id} onClick={() => { navigate(`/profile/${result.username}`); setShowResults(false); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/[0.03] last:border-0"
                    >
                      <img src={result.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.username}`} className="w-8 h-8 rounded-lg border border-white/10" alt="" />
                      <div className="flex flex-col">
                        <span className="text-white text-[10px] font-black uppercase tracking-tight flex items-center gap-1">
                          {result.displayName || result.name} {result.isVerified && <FaUserCheck className="text-cyan-500" size={9} />}
                        </span>
                        <span className="text-cyan-500/50 text-[8px]">@{result.username}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-600 text-[9px] uppercase font-black tracking-widest">NO_SIGNALS_FOUND</div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Create Button */}
        <div className="relative">
          <button onClick={() => setShowPlusMenu(!showPlusMenu)}
            className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all"
          >
            <FaPlus size={14} className={`${showPlusMenu ? 'rotate-45' : ''} transition-transform`} />
          </button>
          
          <AnimatePresence>
            {showPlusMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 mt-3 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl"
              >
                {['Neural Post', 'Visual Log', 'Drift Reel'].map((label, i) => (
                  <button key={i} onClick={() => { setIsPostModalOpen(true); setShowPlusMenu(false); }}
                    className="w-full text-left px-4 py-3 text-[9px] font-black text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl uppercase transition-all"
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-1 pr-3 rounded-xl hover:bg-white/[0.08] transition-all">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} className="w-8 h-8 rounded-lg object-cover" alt="" />
            <span className="hidden md:block text-[9px] font-black text-white uppercase tracking-tighter">
              {user?.username || 'DRIFTER'}
            </span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-44 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl"
              >
                <button onClick={() => { navigate(`/profile/${user?.username}`); setShowDropdown(false); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-black text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl uppercase transition-all"
                >
                  <FaUserCircle className="text-cyan-500" /> Profile
                </button>
                <button onClick={logout} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-black text-rose-500 hover:bg-rose-500/10 rounded-xl uppercase transition-all"
                >
                  <FaSignOutAlt /> Terminate
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;