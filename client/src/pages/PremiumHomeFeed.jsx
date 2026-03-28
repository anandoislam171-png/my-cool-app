import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaBolt, FaRegHeart, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { AuthContext } from '../context/AuthContext'; // আপনার তৈরি করা কনটেক্সট

const PremiumHomeFeed = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  
  // ✅ ১. গ্লোবাল অথ কনটেক্সট থেকে ডাটা নিন (আলাদা Axios চেকের দরকার নেই)
  const { user, api, loading: isAuthLoading } = useContext(AuthContext);

  // Local States
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Global");

  // ✅ ২. Fetch Posts (useCallback ব্যবহার করা হয়েছে যাতে লুপ না হয়)
  const fetchPosts = useCallback(async () => {
    // যদি ইউজার না থাকে তবে কল করার দরকার নেই
    if (!user) return;

    try {
      setLoading(true);
      const res = await api.get("/api/posts/neural-feed");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Feed error:", err);
      // toast.error("Unable to sync with Neural Grid");
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  // ইউজার পাওয়া গেলে অটোমেটিক পোস্ট ফেচ করবে
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // ✅ ৩. Like Function
  const handleLike = async (id) => {
    try {
      const res = await api.post(`/api/posts/${id}/like`);
      // সাকসেস হলে শুধু ওই পোস্টটি আপডেট করুন
      setPosts(prev => prev.map(p => p._id === id ? res.data : p));
    } catch (err) {
      toast.error("Signal interference: Action failed");
    }
  };

  // ✅ ৪. Filter & Search Logic (useMemo পারফরম্যান্স বাড়াবে)
  const filteredPosts = useMemo(() => {
    let result = [...posts];
    
    if (activeFilter === "Encrypted") {
      result = result.filter(p => p.isEncrypted);
    }
    
    if (searchQuery) {
      result = result.filter(p => 
        p.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [posts, activeFilter, searchQuery]);

  // ৫. লোডিং কন্ডিশন
  if (isAuthLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center font-mono text-cyan-500 uppercase tracking-[0.3em]">
        <FaBolt className="animate-pulse mr-3" /> Initializing_Grid...
      </div>
    );
  }

  return (
    <div className="bg-[#020617] text-white min-h-screen pb-20 font-sans selection:bg-cyan-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center p-4 px-6">
        <h2 className="text-xl font-black italic text-cyan-500 tracking-tighter uppercase">
          Onyx<span className="text-white">Drift</span>
        </h2>
        <div className="flex items-center gap-4">
           <FaSearch className="text-zinc-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => navigate("/explorer")} />
        </div>
      </header>

      {/* MAIN FEED */}
      <main className="max-w-2xl mx-auto border-x border-white/5 min-h-screen bg-black/20">
        {/* TABS/FILTERS */}
        <div className="flex gap-3 p-4 border-b border-white/5 sticky top-[61px] bg-[#020617]/60 backdrop-blur-md z-40">
          {["Global", "Encrypted", "Following"].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeFilter === f 
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-white/5 text-zinc-500 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* POST LIST */}
        {loading && posts.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
             <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Scanning_Neural_Grid...</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  key={post._id} 
                  className="p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-900 flex items-center justify-center font-black text-white shadow-lg border border-white/10">
                        {post.authorName?.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[12px] font-bold uppercase tracking-tight text-zinc-200">{post.authorName}</h4>
                           <span className="text-[9px] text-cyan-500/50 font-mono italic">#{post._id.slice(-4)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                           <span className="text-[8px] text-zinc-500 tracking-[0.2em] font-bold uppercase">Signal_Locked</span>
                        </div>
                     </div>
                  </div>
                  
                  <p className="text-[14px] leading-relaxed text-zinc-400 font-medium pl-1">
                    {post.text}
                  </p>
                  
                  <div className="mt-6 flex items-center gap-6 pl-1">
                    <button 
                      onClick={() => handleLike(post._id)} 
                      className={`flex items-center gap-2.5 transition-all duration-300 ${
                        post.likes?.includes(user?._id) ? 'text-cyan-400' : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      {post.likes?.includes(user?._id) ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                      <span className="text-[11px] font-mono font-bold">{post.likes?.length || 0}</span>
                    </button>
                    
                    {/* Placeholder for comments or shares */}
                    <div className="h-4 w-[1px] bg-white/5" />
                    <span className="text-[9px] text-zinc-700 font-mono uppercase tracking-tighter">Verified_Neural_Node</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                No_Signals_Detected_In_This_Sector
              </div>
            )}
          </div>
        )}
      </main>

      {/* ডেকোরেটিভ নিয়ন লাইট */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default PremiumHomeFeed;