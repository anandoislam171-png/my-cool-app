import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, MapPin,
  MoreHorizontal, Verified, X, Zap, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  // 🌍 Configuration
  const API_URL = "https://my-cool-app-cvm7.onrender.com";

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🔐 Secure API Instance (Custom Auth2)
  const onyxApi = useCallback(() => {
    const token = localStorage.getItem('accessToken'); // আপনার useAuth হুক থেকে প্রাপ্ত টোকেন
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
  }, []);

  // 🚀 Fetch Profile Data
  useEffect(() => {
    const fetchNeuralData = async () => {
      if (!username) return;
      try {
        setLoading(true);
        const api = onyxApi();
        
        // ১. প্রোফাইল ডাটা ফেচ
        const userRes = await api.get(`/api/users/${encodeURIComponent(username)}`);
        const userData = userRes.data;
        setUser(userData);
        setIsFollowing(userData.isFollowing || false);

        // ২. ইউজারের পোস্ট ফেচ
        const postsRes = await api.get(`/api/users/${encodeURIComponent(username)}/posts`);
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);

      } catch (error) {
        console.error("Profile Fetch Error:", error);
        toast.error("User Link Failed");
      } finally {
        setLoading(false);
      }
    };

    fetchNeuralData();
  }, [username, onyxApi]);

  // ❤️ Follow Logic
  const handleFollowToggle = async () => {
    try {
      const api = onyxApi();
      await api.post(`/api/users/${user._id}/follow`);
      
      setIsFollowing(!isFollowing);
      setUser(prev => ({
        ...prev,
        followersCount: prev.followersCount + (isFollowing ? -1 : 1)
      }));
    } catch (err) {
      toast.error("Network Rejection");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
      <div className="w-12 h-12 border-4 border-t-cyan-500 border-white/5 rounded-full animate-spin" />
      <p className="text-cyan-500 font-black text-[10px] tracking-[0.5em] animate-pulse uppercase">Syncing_Neural_ID...</p>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <Cpu className="text-zinc-800 mb-4" size={60} />
      <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Signal_Lost: User_Not_Found</p>
      <button onClick={() => navigate("/")} className="mt-6 text-cyan-400 border border-cyan-500/20 px-6 py-2 rounded-full text-xs font-black uppercase">Return to Feed</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-white/5 pb-20 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl flex items-center px-4 py-3 gap-6 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full text-cyan-500 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-md font-black uppercase tracking-tighter italic">{user.displayName || user.username}</h1>
            {user.isVerified && <Zap size={14} className="text-cyan-400 fill-current" />}
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{posts.length} Signals</span>
        </div>
      </header>

      {/* Cover & Avatar */}
      <div className="relative">
        <div className="h-44 bg-zinc-900 overflow-hidden">
          {user.coverImg ? (
            <img src={user.coverImg} className="w-full h-full object-cover opacity-60" alt="Cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-black to-cyan-900/20" />
          )}
        </div>
        
        <div className="px-4 -mt-14 flex justify-between items-end relative z-10">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            className="w-28 h-28 rounded-3xl border-4 border-black object-cover bg-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            alt={user.username}
          />
          <div className="flex gap-2 pb-2">
            {user.isMe ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                Config_Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-8 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  isFollowing 
                    ? "border border-zinc-800 text-zinc-500" 
                    : "bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]"
                }`}
              >
                {isFollowing ? "Linked" : "Link_Neural"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bio & Details */}
      <div className="px-6 mt-4">
        <h2 className="text-2xl font-black italic tracking-tighter">{user.displayName}</h2>
        <p className="text-cyan-500 text-xs font-mono">@{user.username}</p>
        
        <p className="mt-4 text-sm text-zinc-400 leading-relaxed font-medium italic">
          "{user.bio || "This drifter hasn't shared a neural signature yet."}"
        </p>

        <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 mt-5 font-black uppercase tracking-[0.1em]">
          {user.location && (
            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <MapPin size={12} className="text-cyan-500" /> {user.location}
            </div>
          )}
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <Calendar size={12} className="text-cyan-500" /> Joined_{user.joinedAt || "2026"}
          </div>
        </div>

        <div className="flex gap-8 mt-6 border-y border-white/5 py-4">
          <div className="text-center">
            <p className="text-lg font-black italic">{user.followingCount || 0}</p>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black italic">{user.followersCount || 0}</p>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Followers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mt-2 sticky top-14 bg-black/80 backdrop-blur-md z-30">
        {["Posts", "Media", "Stored"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative"
          >
            <span className={activeTab === tab ? "text-cyan-400" : "text-zinc-600"}>{tab}</span>
            {activeTab === tab && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_#00f2ff]" />
            )}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="divide-y divide-white/5">
        {posts.length > 0 ? (
          posts.map((p) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              key={p._id} 
              className="p-6 hover:bg-white/[0.02] transition-all cursor-pointer group"
            >
              <p className="text-sm leading-relaxed text-zinc-200">{p.content}</p>
              {p.image && (
                <img src={p.image} className="mt-4 rounded-3xl border border-white/10 w-full object-cover max-h-96 grayscale hover:grayscale-0 transition-all duration-500" alt="" />
              )}
              <div className="flex gap-4 mt-4 text-[10px] text-zinc-600 font-bold">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="group-hover:text-cyan-500 transition-colors">TRANSMISSION_COMPLETE</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center opacity-20">
            <Radio size={40} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No_Signals_Detected</p>
          </div>
        )}
      </div>

      {/* Edit Modal (Simplified for Custom Auth) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/60">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0d1117] w-full max-w-md p-8 border border-white/10 rounded-[2.5rem] shadow-2xl"
            >
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">Config_Neural_ID</h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
               </div>
               {/* এখানে আপনার কাস্টম ইনপুট ফিল্ডগুলো যোগ করবেন */}
               <div className="space-y-4">
                  <input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-xs font-mono outline-none focus:border-cyan-500" placeholder="Display Name" defaultValue={user.displayName} />
                  <textarea className="w-full bg-black border border-white/5 rounded-2xl p-4 text-xs font-mono outline-none focus:border-cyan-500 h-32" placeholder="Neural Bio" defaultValue={user.bio} />
               </div>
               <button className="w-full mt-8 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase text-xs shadow-[0_0_20px_rgba(0,242,255,0.3)]">Save_Protocols</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Radio = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
  </svg>
);

export default ProfilePage;