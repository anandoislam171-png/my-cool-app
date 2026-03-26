import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Music, ArrowLeft, 
  Cpu, Award, Eye, Lock, Mic, MicOff, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext"; // আপনার কাস্টম অথ হুক
import axios from 'axios';
import toast from 'react-hot-toast';
import Webcam from "react-webcam";

const API_URL = "https://my-cool-app-cvm7.onrender.com";

/* ==========================================================
    ১. ইউজার ডাটা জেনারেটর (Neural Identity)
========================================================== */
const resolveDrifter = (reel) => {
  const user = reel.author || reel.user || {};
  const name = user.fullName || user.username || "Onyx Drifter";
  return {
    name,
    avatar: user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    id: user._id || "000000"
  };
};

/* ==========================================================
    ২. রিল আইটেম (ReelItem)
========================================================== */
const ReelItem = ({ reel, index, isVoiceLiked }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const drifter = resolveDrifter(reel);

  useEffect(() => {
    if (currentUser && reel.likes) {
      setIsLiked(reel.likes.includes(currentUser._id));
    }
  }, [currentUser, reel]);

  useEffect(() => {
    if (isVoiceLiked) triggerLikeEffect();
  }, [isVoiceLiked]);

  const triggerLikeEffect = () => {
    if (!isLiked) handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

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
      setIsLiked(!isLiked); // Rollback on error
    }
  };

  return (
    <div className="h-[100dvh] w-full snap-start relative bg-black flex items-center justify-center overflow-hidden">
      {/* Neural Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-30" />

      <video
        ref={videoRef} 
        src={reel.mediaUrl || reel.media} 
        loop playsInline muted
        onTimeUpdate={() => videoRef.current && setPlaybackProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)}
        className="absolute inset-0 w-full h-full object-cover"
        onDoubleClick={triggerLikeEffect}
      />

      <AnimatePresence>
        {showHeart && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, rotate: -20 }} 
            animate={{ scale: 1.2, opacity: 1, rotate: 0 }} 
            exit={{ scale: 2, opacity: 0, y: -100 }} 
            className="absolute z-[1010] drop-shadow-[0_0_20px_#00f2ff]"
          >
            <Heart fill="#00f2ff" className="text-cyan-400" size={120} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-[1005] p-6 flex flex-col justify-end pb-32">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-4">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               className="flex items-center gap-3 cursor-pointer" 
               onClick={() => navigate(`/profile/${drifter.id}`)}
             >
                <div className="relative">
                  <img src={drifter.avatar} className="w-14 h-14 rounded-full border-2 border-cyan-500 p-0.5 object-cover" alt="" />
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1"><Zap size={10} className="text-black fill-current"/></div>
                </div>
                <div>
                   <h4 className="font-black text-sm text-white uppercase tracking-widest">{drifter.name}</h4>
                   <p className="text-[10px] text-cyan-400/80 font-mono">PROTOCOL_{drifter.id.slice(-5)}</p>
                </div>
             </motion.div>
             <p className="text-sm text-zinc-300 max-w-[80%] font-light leading-relaxed">{reel.text}</p>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full w-fit border border-white/10">
                <Music size={12} className="text-cyan-400 animate-pulse" />
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-tighter">Neural Audio Sync Active</span>
             </div>
          </div>

          <div className="flex flex-col gap-5">
            <InteractionControl icon={<Heart fill={isLiked ? "#00f2ff" : "none"} />} label={likesCount} active={isLiked} onClick={handleLike} />
            <InteractionControl icon={<MessageCircle />} label={reel.commentsCount || "Chat"} />
            <InteractionControl icon={<Share2 />} label="Sync" />
          </div>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-[1010]">
        <motion.div 
          className="h-full bg-cyan-500 shadow-[0_0_20px_#00f2ff]" 
          style={{ width: `${playbackProgress}%` }} 
        />
      </div>
    </div>
  );
};

const InteractionControl = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`p-4 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 transition-all duration-300 ${active ? 'text-cyan-400 border-cyan-500 shadow-[0_0_20px_rgba(0,242,255,0.3)]' : 'text-white/80 group-hover:border-cyan-500/50'}`}>
      {React.cloneElement(icon, { size: 26, strokeWidth: 1.5 })}
    </div>
    <span className="text-[9px] font-black text-white/50 tracking-tighter uppercase">{label}</span>
  </button>
);

/* ==========================================================
    ৩. মেইন ফিড (ReelsFeed)
========================================================= */
const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNeuralActive, setIsNeuralActive] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [privacyLock, setPrivacyLock] = useState(false);
  const [voiceLikeTrigger, setVoiceLikeTrigger] = useState(0);

  const feedRef = useRef(null);
  const navigate = useNavigate();

  // --- ডাটা ফেচিং (Auth2 JWT) ---
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

  // --- স্ক্রল লজিক ---
  const handleScroll = (dir) => {
    if (!feedRef.current) return;
    const offset = window.innerHeight;
    feedRef.current.scrollBy({ top: dir === 'down' ? offset : -offset, behavior: 'smooth' });
  };

  // --- ভয়েস কমান্ড ইঞ্জিন ---
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec || !isVoiceActive) return;

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.onresult = (e) => {
      const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (cmd.includes("next")) handleScroll('down');
      if (cmd.includes("back")) handleScroll('up');
      if (cmd.includes("like")) setVoiceLikeTrigger(t => t + 1);
    };
    recognition.start();
    return () => recognition.stop();
  }, [isVoiceActive]);

  return (
    <div className="fixed inset-0 bg-black z-[2000] font-sans selection:bg-cyan-500/30">
      
      {/* Neural Privacy Guard */}
      <AnimatePresence>
        {privacyLock && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-3xl flex items-center justify-center">
            <div className="text-center p-10 border border-cyan-500/20 rounded-[40px] bg-zinc-900/50">
              <Lock className="text-cyan-500 w-16 h-16 mx-auto mb-4 animate-bounce" />
              <h2 className="text-white font-black tracking-widest uppercase">Operator Sync Required</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controller Header */}
      <div className="fixed top-0 inset-x-0 z-[2110] p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-white border border-white/10 hover:border-cyan-500 transition-all">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsVoiceActive(!isVoiceActive)} 
            className={`p-3 rounded-full border transition-all ${isVoiceActive ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_#00f2ff]' : 'bg-white/5 text-cyan-500 border-white/10'}`}
          >
            {isVoiceActive ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button 
            onClick={() => setIsNeuralActive(!isNeuralActive)} 
            className={`p-3 rounded-full border transition-all ${isNeuralActive ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_#00f2ff]' : 'bg-white/5 text-cyan-500 border-white/10'}`}
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Main Stream */}
      <div ref={feedRef} className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-t-cyan-500 border-white/5 rounded-full animate-spin mb-6" />
             <p className="text-cyan-500 font-black text-[10px] tracking-[0.5em] animate-pulse">INIT_NEURAL_STREAM</p>
          </div>
        ) : (
          reels.map((reel, i) => (
            <ReelItem key={reel._id} reel={reel} index={i} isVoiceLiked={voiceLikeTrigger > 0} />
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