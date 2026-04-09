import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Send,
  Music,
  ArrowLeft,
  Mic,
  MicOff,
  Zap,
  MoreVertical,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

// রেন্ডার ডিলিট করা হয়েছে, এখন আপনার নিজস্ব প্রাইভেট সার্ভার ডোমেইন
const API_URL = "https://onyx-drift.com"; 

/* =========================
   GEN-Z NEURAL RESOLVER
========================= */
const resolveDrifter = (reel) => {
  const author = reel?.author || {};
  const name = author?.fullName || author?.username || "Onyx Drifter";
  return {
    name,
    avatar: author?.profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
    id: author?._id || "0000",
    rank: author?.rank || "NEURAL_NODE_01"
  };
};

/* =========================
   SINGLE REEL ITEM
========================= */
const ReelItem = ({ reel, isActive, isMuted, toggleMute }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel?.likes?.length || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const drifter = resolveDrifter(reel);

  useEffect(() => {
    if (isActive && videoLoaded) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, videoLoaded]);

  useEffect(() => {
    if (user && reel?.likes) setIsLiked(reel.likes.includes(user._id));
  }, [user, reel]);

  const handleLike = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("Connect Neural Link (Login)");
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      await axios.post(`${API_URL}/api/posts/${reel._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  return (
    <div className="h-[100dvh] w-full snap-start relative bg-black flex items-center justify-center overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />

      <video
        ref={videoRef}
        src={reel?.mediaUrl || reel?.media}
        loop
        muted={isMuted}
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        onDoubleClick={() => {
          handleLike();
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 800);
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1.5, rotate: 0, filter: "drop-shadow(0 0 20px #06b6d4)" }}
            exit={{ scale: 3, opacity: 0 }}
            className="absolute z-50 text-cyan-400"
          >
            <Zap size={100} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 w-full p-6 pb-12 flex items-end justify-between z-40">
        
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={isActive ? { x: 0, opacity: 1 } : {}}
          className="max-w-[75%] space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative p-[2px] bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-full">
               <img 
                src={drifter.avatar} 
                className="w-12 h-12 rounded-full border-2 border-black object-cover cursor-pointer"
                onClick={() => navigate(`/profile/${drifter.id}`)}
               />
               <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1 border-2 border-black">
                 <Zap size={10} className="text-black" />
               </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2 uppercase">
                {drifter.name}
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/20">VERIFIED</span>
              </h3>
              <p className="text-cyan-400 text-xs font-mono">{drifter.rank}</p>
            </div>
          </div>

          <p className="text-white/90 text-sm leading-relaxed line-clamp-2 drop-shadow-lg">
            {reel?.text}
          </p>

          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/10 text-cyan-300 text-[10px] tracking-widest">
            <Music size={12} className="animate-spin-slow" />
            ONYX_CORE_AUDIO.mp3
          </div>
        </motion.div>

        <div className="flex flex-col items-center gap-6 mb-4">
          <ActionButton 
            icon={<Zap size={28} fill={isLiked ? "currentColor" : "none"} />} 
            label={likesCount} 
            active={isLiked}
            color="text-cyan-400"
            onClick={handleLike}
          />
          <ActionButton icon={<MessageSquare size={28} />} label={reel?.comments?.length || 0} />
          <ActionButton icon={<Send size={28} />} />
          <ActionButton 
            icon={isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />} 
            onClick={toggleMute}
          />
          <ActionButton icon={<MoreVertical size={24} />} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
        <motion.div 
           initial={{ width: 0 }}
           animate={isActive ? { width: "100%" } : { width: 0 }}
           transition={{ duration: 15, ease: "linear" }}
           className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
        />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color = "text-white", active = false }) => (
  <motion.button 
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-1 ${active ? color : "text-white/80"} hover:text-cyan-400 transition-colors drop-shadow-xl`}
  >
    <div className="p-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10">
      {icon}
    </div>
    {label !== undefined && <span className="text-xs font-bold font-mono">{label}</span>}
  </motion.button>
);

/* =========================
   MAIN NEURAL FEED
========================= */
const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const navigate = useNavigate();

  const fetchFeed = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      // এখন আপনার নিজস্ব প্রাইভেট এপিআই থেকে ডেটা আসবে
      const res = await axios.get(`${API_URL}/api/posts/neural-feed`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setReels(res.data || []);
    } catch (err) {
      toast.error("Neural Network Interrupted: Private Link Down");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollTop / window.innerHeight);
    if (index !== activeIndex) setActiveIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans selection:bg-cyan-500/30">
      
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-6 z-[100]">
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl"
        >
          <ArrowLeft size={24} />
        </motion.button>

        <h2 className="text-sm font-black tracking-[0.3em] uppercase bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
          Neural Drift
        </h2>

        <motion.button 
          animate={isVoiceActive ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          className={`p-2 rounded-xl border border-white/10 ${isVoiceActive ? 'bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4]' : 'bg-black/20'}`}
        >
          {isVoiceActive ? <Mic size={24} /> : <MicOff size={24} />}
        </motion.button>
      </header>

      <div
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <motion.div 
               animate={{ rotate: 360, borderColor: ['#06b6d4', '#d946ef', '#06b6d4'] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="w-16 h-16 border-4 border-t-transparent rounded-full"
            />
            <p className="text-xs font-mono tracking-widest text-cyan-400 animate-pulse">CONNECTING_PRIVATE_CORE...</p>
          </div>
        ) : (
          reels.map((reel, i) => (
            <ReelItem
              key={reel._id || i}
              reel={reel}
              isActive={i === activeIndex}
              isMuted={isMuted}
              toggleMute={() => setIsMuted(!isMuted)}
            />
          ))
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full z-[100] flex items-center justify-around">
          <Zap size={20} className="text-cyan-400" />
          <div className="w-[2px] h-4 bg-white/10" />
          <span className="text-[10px] font-bold tracking-tighter opacity-50 uppercase">Session 0.1</span>
      </div>
    </div>
  );
};

export default ReelsFeed;