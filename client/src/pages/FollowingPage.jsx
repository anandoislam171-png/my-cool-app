import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaUserPlus, FaEnvelope, FaPhoneAlt, FaRocket, 
  FaUserCheck, FaSearch, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // আপনার কাস্টম Auth2 হুক

// 🧠 DISPLAY NAME HELPER
const getDisplayName = (u) => {
  if (!u) return "Drifter";
  return u.displayName || u.name || u.username || "Drifter";
};

const FollowingPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const { api, user: currentUser } = useAuth(); // AuthContext থেকে api এবং user নিচ্ছি
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('userId');

  /**
   * ১. প্রোফাইল ও পোস্ট লোড করা
   */
  const loadProfileData = useCallback(async (id) => {
    try {
      setLoading(true);
      const encodedId = encodeURIComponent(id);

      // প্রোফাইল এবং পোস্ট একসাথে ফেচ করা
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/user/profile/${encodedId}`),
        api.get(`/posts/user/${encodedId}`)
      ]);

      setUsers(profileRes.data ? [profileRes.data] : []);
      setPosts(postsRes.data || []);
    } catch (err) {
      console.error("📡 Neural Link Error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * ২. ইউজার সার্চ (Identity Scanner)
   */
  const loadDiscoveryList = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await api.get('/user/search', {
        params: { q: query.trim() }
      });
      
      setUsers(res.data || []);
      setPosts([]); 
    } catch (err) {
      console.error("🔍 Search Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (targetUserId) {
      loadProfileData(targetUserId);
    } else {
      const delayDebounceFn = setTimeout(() => {
        loadDiscoveryList(searchTerm);
      }, 500); 
      return () => clearTimeout(delayDebounceFn);
    }
  }, [targetUserId, searchTerm, loadProfileData, loadDiscoveryList]);

  /**
   * ৩. ফলো লজিক
   */
  const handleFollow = async (targetId) => {
    try {
      const res = await api.post(`/user/follow/${encodeURIComponent(targetId)}`);
      // টোস্ট মেসেজ দিলে ভালো হয়, এখানে অ্যালার্ট রাখা হলো
      alert(res.data.followed ? "Identity Linked!" : "Link Severed!");
    } catch (err) { 
      alert("Synchronization Error");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen font-sans max-w-7xl mx-auto selection:bg-cyan-500/30">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => targetUserId ? navigate('/following') : navigate('/feed')} 
            className="flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            {targetUserId ? "Back to Discovery" : "Back to Feed"}
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <FaRocket className="text-cyan-500 animate-pulse" /> 
            {targetUserId ? "DRIFTER_PROFILE" : "IDENTITY_SCANNER"}
          </h1>
        </div>

        {!targetUserId && (
          <div className="relative w-full md:w-[400px]">
            <input 
              type="text" 
              placeholder="SCAN NEURAL ID (NAME/USERNAME)..." 
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-bold tracking-widest outline-none focus:border-cyan-500/40 transition-all backdrop-blur-3xl uppercase placeholder:text-zinc-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={14} />
          </div>
        )}
      </div>

      {/* Discovery Grid */}
      <div className={`grid grid-cols-1 ${targetUserId ? 'max-w-xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-8`}>
        {users.length > 0 ? users.map((u) => (
          <div 
            key={u._id} 
            className={`backdrop-blur-3xl border rounded-[2.5rem] p-8 transition-all duration-500 group ${targetUserId ? 'bg-cyan-500/[0.07] border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-cyan-500/20 hover:-translate-y-2 shadow-2xl'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="relative cursor-pointer" 
                onClick={() => navigate(`/following?userId=${u._id}`)}
              >
                <img 
                  src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                  className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-500" 
                  alt="Avatar" 
                />
                {u.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black p-2 rounded-full ring-4 ring-[#020617]">
                    <FaUserCheck size={12} />
                  </div>
                )}
              </div>
              <h3 className="text-white font-black text-2xl mt-6 italic uppercase tracking-tighter">
                {getDisplayName(u)}
              </h3>
              <p className="text-cyan-500/40 text-[10px] font-black tracking-[0.3em] uppercase mt-2">
                @{u.username || "drifter"}
              </p>
            </div>
            
            <div className="mt-10 grid grid-cols-3 gap-4">
                <button onClick={() => handleFollow(u._id)} className="flex flex-col items-center p-4 bg-white/[0.03] rounded-3xl text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all">
                  <FaUserPlus size={18} />
                  <span className="text-[8px] font-black mt-2 uppercase">Link</span>
                </button>
                <button onClick={() => navigate(`/messages?userId=${u._id}`)} className="flex flex-col items-center p-4 bg-white/[0.03] rounded-3xl text-purple-500 hover:bg-purple-600 hover:text-white transition-all">
                  <FaEnvelope size={18} />
                  <span className="text-[8px] font-black mt-2 uppercase">Comms</span>
                </button>
                <button onClick={() => navigate(`/call/${u._id}`)} className="flex flex-col items-center p-4 bg-white/[0.03] rounded-3xl text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                  <FaPhoneAlt size={18} />
                  <span className="text-[8px] font-black mt-2 uppercase">Voice</span>
                </button>
            </div>
          </div>
        )) : !loading && (
          <div className="col-span-full py-32 text-center">
            <div className="w-12 h-[1px] bg-zinc-800 mx-auto mb-6" />
            <p className="text-zinc-600 font-black italic uppercase tracking-[0.5em] text-[10px]">No_Drifter_Signal_Detected</p>
          </div>
        )}
      </div>

      {/* User Posts (Only in Profile View) */}
      {targetUserId && !loading && (
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-white font-black italic mb-8 flex items-center gap-3 text-sm tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" /> 
            Recent_Neural_Transmissions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.length > 0 ? posts.map(post => (
              <div key={post._id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] hover:border-cyan-500/20 transition-all group backdrop-blur-sm">
                {post.media && (
                  <div className="rounded-3xl overflow-hidden mb-5 aspect-video bg-black/40 border border-white/5">
                    {post.media.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={post.media} className="w-full h-full object-contain" controls />
                    ) : (
                      <img src={post.media} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Post" />
                    )}
                  </div>
                )}
                <p className="text-zinc-400 text-xs font-medium leading-relaxed uppercase tracking-tight">{post.text}</p>
              </div>
            )) : (
              <div className="col-span-full p-12 border border-dashed border-white/5 rounded-[2.5rem] text-center">
                <p className="text-zinc-700 text-[10px] italic tracking-[0.3em] uppercase">No Signals Transmitted In This Sector...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md z-[1000]">
          <div className="relative">
             <div className="w-16 h-16 border-2 border-cyan-500/5 border-t-cyan-500 rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping shadow-[0_0_15px_#06b6d4]" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowingPage;