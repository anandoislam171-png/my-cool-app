import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Music, ArrowLeft, 
  Eye, Lock, Mic, MicOff, Zap, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = "https://my-cool-app-cvm7.onrender.com";

/* ==========================================================
    ১. ইউজার ডাটা জেনারেটর (Neural Identity)
========================================================== */
const resolveDrifter = (reel) => {
  const user = reel.author || reel.user || {};
  const name = user.fullName || user.username || "Onyx Drifter";
  
  // গুরুত্বপূর্ণ: এখানে শুধু প্রয়োজনীয় ডাটা রিটার্ন করা হচ্ছে
  return {
    name,
    avatar: user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    id: user._id || "000000"
  };
};

/* ==========================================================
    ২. রিল আইটেম (ReelItem)
========================================================== */
const ReelItem = ({ reel, isActive }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const drifter = resolveDrifter(reel);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (currentUser && reel.likes) {
      setIsLiked(reel.likes.includes(currentUser._id));
    }
  }, [currentUser, reel]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = !isLiked;
      setIsLiked(newStatus);
      setLikesCount(prev => newStatus ? prev + 1 : prev - 1);
      
      await axios.post(`${API_URL}/api/posts/${reel._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setIsLiked(!isLiked); 
      toast.error("Sync Failed");
    }
  };

  // নেভিগেশন ফিক্স: পুরো অবজেক্ট না পাঠিয়ে শুধু আইডি পাঠানো হচ্ছে
  const goToProfile = (e) => {
    e.stopPropagation();
    if (drifter.id) {
      navigate(`/profile/${drifter.id}`);
    }
  };

  return (
    <div className="h-[100dvh] w-full snap-start relative bg-black flex items-center justify-center overflow-hidden border-b border-white/5">
      <video
        ref={videoRef} 
        src={reel.mediaUrl || reel.media} 
        loop playsInline 
        onTimeUpdate={() => {
          if (videoRef.current) {
            setPlaybackProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover"
        onDoubleClick={() => {
          if (!isLiked) handleLike();
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 800);
        }}
      />

      <AnimatePresence>
        {showHeart && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1.5, opacity: 1 }} 
            exit={{ scale: 2.5, opacity: 0 }} 
            className="absolute z-[1010] text-cyan-400 drop-shadow-[0_0_30px_#06b6d4]"
          >
            <Heart fill="currentColor" size={100} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 z-[1005] p-6 flex flex-col justify-end pb-32 md:pb-10">
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1 space-y-4">
             <motion.div 
               whileTap={{ scale: 0.95 }}
               className="flex items-center gap-3 cursor-pointer w-fit" 
               onClick={goToProfile}
             >
                <div className="relative">
                  <img src={drifter.avatar} className="w-12 h-12 rounded-full border border-cyan-500/50 p-0.5 object-cover" alt="" />
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1"><Zap size={8} className="text-black fill-current"/></div>
                </div>
                <div>
                   <h4 className="font-black text-xs text-white uppercase tracking-widest">{drifter.name}</h4>
                   <p className="text-[9px] text-cyan-400/60 font-mono italic">NODE_{drifter.id.slice(-6)}</p>
                </div>
             </motion.div>
             <p className="text-sm text-zinc-300 max-w-[85%] font-medium leading-snug">{reel.text}</p>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full w-fit border border-white/5">
                <Music size={10} className="text-cyan-400 animate-pulse" />
                <span className="text-[9px] text-white/70 font-black uppercase tracking-widest">Neural Audio Stream</span>
             </div>
          </div>

          <div className="flex flex-col gap-5">
            <InteractionControl icon={<Heart fill={isLiked ? "#06b6d4" : "none"} />} label={likesCount} active={isLiked} onClick={handleLike} />
            <InteractionControl icon={<MessageCircle />} label={reel.commentsCount || "0"} />
            <InteractionControl icon={<Share2 />} label="Sync" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-[1010]">
        <motion.div 
          className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]" 
          animate={{ width: `${playbackProgress}%` }}
        />
      </div>
    </div>
  );
};

const InteractionControl = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`p-4 rounded-[1.5rem] bg-black/40 backdrop-blur-2xl border transition-all duration-300 ${active ? 'text-cyan-400 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'text-white/70 border-white/5 group-hover:border-cyan-500/30'}`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 })}
    </div>
    <span className="text-[8px] font-black text-white/40 tracking-widest uppercase">{label}</span>
  </button>
);

/* ==========================================================
    ৩. মেইন ফিড (ReelsFeed)
========================================================= */
const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const feedRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNeuralFeed = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_URL}/api/posts/neural-feed`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReels(res.data);
      } catch (err) {
        toast.error("Neural Link Offline");
      } finally {
        setLoading(false);
      }
    };
    fetchNeuralFeed();
  }, []);

  const handleScroll = (e) => {
    const scrollPos = e.currentTarget.scrollTop;
    const index = Math.round(scrollPos / window.innerHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[2000] font-sans overflow-hidden">
      <div className="fixed top-0 inset-x-0 z-[2110] p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 backdrop-blur-3xl rounded-full text-white border border-white/10 hover:border-cyan-500/50 transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsVoiceActive(!isVoiceActive)} 
            className={`p-3 rounded-full border transition-all duration-500 ${isVoiceActive ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_#06b6d4]' : 'bg-white/5 text-cyan-500 border-white/10'}`}
          >
            {isVoiceActive ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
      </div>

      <div 
        ref={feedRef} 
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth bg-[#050505]"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
             <div className="relative">
                <div className="w-16 h-16 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
             </div>
             <p className="text-cyan-500 font-black text-[10px] tracking-[0.6em] animate-pulse">SYNCING_STREAM</p>
          </div>
        ) : (
          reels.map((reel, i) => (
            <ReelItem key={reel._id} reel={reel} isActive={i === activeIndex} />
          ))
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ReelsFeed;