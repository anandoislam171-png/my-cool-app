import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, MapPin, 
  X, Zap, Cpu, Radio, Settings 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // আপনার ব্যবহার করা কনটেক্সট

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, api: authApi } = useAuth(); // AuthContext থেকে ডাটা নিচ্ছি

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🚀 Fetch Profile Data
  useEffect(() => {
    const fetchNeuralData = async () => {
      if (!username) return;
      try {
        setLoading(true);
        
        // ১. প্রোফাইল ডাটা ফেচ
        const userRes = await authApi.get(`/users/${encodeURIComponent(username)}`);
        const userData = userRes.data;
        setUser(userData);
        setIsFollowing(userData.isFollowing || false);

        // ২. ইউজারের পোস্ট ফেচ
        const postsRes = await authApi.get(`/users/${encodeURIComponent(username)}/posts`);
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);

      } catch (error) {
        console.error("Profile Fetch Error:", error);
        toast.error("Neural Identity Not Found");
      } finally {
        setLoading(false);
      }
    };

    fetchNeuralData();
  }, [username, authApi]);

  // ❤️ Follow/Link Logic
  const handleFollowToggle = async () => {
    if (!currentUser) return toast.error("Authentication Required");
    try {
      await authApi.post(`/users/${user._id}/follow`);
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
      <div className="w-12 h-12 border-2 border-t-cyan-500 border-white/5 rounded-full animate-spin" />
      <p className="text-cyan-500 font-black text-[9px] tracking-[0.6em] animate-pulse uppercase">Syncing_Neural_ID...</p>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <Cpu className="text-zinc-900 mb-6" size={80} strokeWidth={1} />
      <p className="text-zinc-500 font-black text-[10px] tracking-[0.4em] uppercase mb-8">Signal_Lost: 404_ID_NOT_FOUND</p>
      <button onClick={() => navigate("/")} className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
        Return_to_Core
      </button>
    </div>
  );

  const isMe = currentUser?.username === user.username || currentUser?._id === user._id;

  return (
    <div className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-white/5 pb-20 font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-2xl flex items-center px-6 py-4 gap-6 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full text-white transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black uppercase tracking-tight italic">{user.displayName || user.username}</h1>
            {user.isVerified && <Zap size={14} className="text-cyan-400 fill-current" />}
          </div>
          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">{posts.length} Signals_Detected</span>
        </div>
      </header>

      {/* Cover & Avatar */}
      <div className="relative">
        <div className="h-48 bg-zinc-950 overflow-hidden relative">
          {user.coverImg ? (
            <img src={user.coverImg} className="w-full h-full object-cover opacity-50" alt="" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-cyan-950/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>
        
        <div className="px-6 -mt-16 flex justify-between items-end relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              className="w-32 h-32 rounded-[2.5rem] border-[6px] border-black object-cover bg-zinc-900 shadow-2xl"
              alt={user.username}
            />
          </motion.div>
          <div className="pb-3">
            {isMe ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
              >
                <Settings size={14} /> Config_ID
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                  isFollowing 
                    ? "border border-zinc-800 text-zinc-500 bg-black" 
                    : "bg-cyan-500 text-black shadow-[0_10px_30px_rgba(0,242,255,0.3)]"
                }`}
              >
                {isFollowing ? "Linked_Network" : "Link_Neural"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bio & Details */}
      <div className="px-8 mt-6">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{user.displayName}</h2>
        <p className="text-cyan-500 text-xs font-mono font-bold">//NET_ID: @{user.username}</p>
        
        <p className="mt-5 text-sm text-zinc-400 leading-relaxed font-medium italic border-l-2 border-white/5 pl-4">
          "{user.bio || "This drifter hasn't shared a neural signature yet."}"
        </p>

        <div className="flex flex-wrap gap-4 text-[9px] text-zinc-600 mt-6 font-black uppercase tracking-[0.2em]">
          {user.location && (
            <div className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl">
              <MapPin size={12} className="text-cyan-500" /> {user.location}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl">
            <Calendar size={12} className="text-cyan-500" /> SYNCED_{user.joinedAt?.slice(0, 4) || "2026"}
          </div>
        </div>

        <div className="flex gap-10 mt-8 border-y border-white/5 py-6">
          <div className="group cursor-pointer">
            <p className="text-xl font-black italic group-hover:text-cyan-400 transition-colors">{user.followingCount || 0}</p>
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em]">Following</p>
          </div>
          <div className="group cursor-pointer">
            <p className="text-xl font-black italic group-hover:text-cyan-400 transition-colors">{user.followersCount || 0}</p>
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em]">Followers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mt-4 sticky top-16 bg-black/60 backdrop-blur-xl z-30">
        {["Posts", "Media", "Stored"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] relative transition-all"
          >
            <span className={activeTab === tab ? "text-cyan-400" : "text-zinc-700"}>{tab}</span>
            {activeTab === tab && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_15px_#00f2ff]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="divide-y divide-white/5">
        {posts.length > 0 ? (
          posts.map((p, idx) => (
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }}
              key={p._id} 
              className="p-8 hover:bg-white/[0.01] transition-all group"
            >
              <p className="text-sm leading-relaxed text-zinc-300 font-medium">{p.content}</p>
              {p.image && (
                <div className="mt-5 rounded-[2rem] overflow-hidden border border-white/10 aspect-video bg-zinc-900">
                   <img src={p.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" alt="" />
                </div>
              )}
              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-4 text-[9px] text-zinc-700 font-black tracking-widest uppercase">
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  <span className="text-zinc-800">|</span>
                  <span className="group-hover:text-cyan-500 transition-colors">SIG_VERIFIED</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center flex flex-col items-center opacity-10">
            <Radio size={48} strokeWidth={1} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em]">No_Neural_Signals_Detected</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#080808] w-full max-w-md p-8 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">Config_Neural_ID</h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
                    <X size={20}/>
                  </button>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2 block">Display_Name</label>
                    <input className="w-full bg-black border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-cyan-500/50 transition-all" placeholder="Enter Name" defaultValue={user.displayName} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2 block">Neural_Bio</label>
                    <textarea className="w-full bg-black border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-cyan-500/50 transition-all h-32 resize-none" placeholder="Broadcast your thoughts..." defaultValue={user.bio} />
                  </div>
               </div>
               
               <button className="w-full mt-10 bg-white text-black py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all">
                  Commit_Changes
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;