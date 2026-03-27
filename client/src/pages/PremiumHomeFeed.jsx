import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBolt, FaRegHeart, FaHeart, FaRegComment, FaShareAlt, 
  FaBrain, FaCog, FaHome, FaStore, FaFingerprint, FaImage 
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = "https://my-cool-app-cvm7.onrender.com";

const OnyxFeed = () => {
  const navigate = useNavigate();

  // --- States ---
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("GLOBAL");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [postText, setPostText] = useState("");

  // --- ১. এপিআই কনফিগারেশন (Loop-Proof) ---
  const api = useMemo(() => {
    const token = localStorage.getItem('accessToken');
    return axios.create({
      baseURL: API_URL,
      headers: { Authorization: token ? `Bearer ${token}` : "" }
    });
  }, []); // ডিপেন্ডেন্সি নেই, তাই বারবার ক্রিয়েট হবে না।

  // --- ২. অথেন্টিকেশন এবং ডাটা ফেচিং ---
  const loadInitialData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // ইউজার এবং ফিড ডাটা একসাথে লোড করা (Performance Optimization)
      const [userRes, postsRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/posts/neural-feed')
      ]);

      setUser(userRes.data);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    } catch (err) {
      console.error("Initialization Failed", err);
      localStorage.removeItem('accessToken');
      navigate('/login');
    } finally {
      setIsAuthChecking(false);
      setLoading(false);
    }
  }, [api, navigate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // --- ৩. পোস্ট সাবমিট লজিক ---
  const handlePost = async () => {
    if (!postText.trim()) return;
    try {
      const res = await api.post('/api/posts', { text: postText });
      setPosts([res.data, ...posts]);
      setPostText("");
      toast.success("Uplink Successful", {
        style: { background: '#0891b2', color: '#fff', borderRadius: '99px' }
      });
    } catch (err) {
      toast.error("Transmission Interrupted");
    }
  };

  // --- ৪. ফিল্টারিং লজিক ---
  const displayPosts = useMemo(() => {
    if (activeFilter === "RESONANCE") return posts.filter(p => p.isAiGenerated);
    if (activeFilter === "ENCRYPTED") return posts.filter(p => p.isEncrypted);
    return posts;
  }, [posts, activeFilter]);

  if (isAuthChecking) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-cyan-500 font-black tracking-[10px] text-xs uppercase"
        >
          Initializing_Onyx_Grid
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-cyan-500/30">
      
      {/* --- নভিগেশন বার --- */}
      <nav className="fixed top-0 w-full h-14 bg-black/70 backdrop-blur-xl border-b border-white/5 z-[100] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={user?.avatar} className="w-8 h-8 rounded-full border border-cyan-500/20" alt="me" />
          <h1 className="text-lg font-black italic text-white tracking-tighter">ONYX<span className="text-cyan-500">DRIFT</span></h1>
        </div>
        <div className="flex gap-5 text-zinc-500">
          <FaHome className="text-white text-xl" />
          <FaStore className="hover:text-white transition-colors cursor-pointer" />
          <FaCog className="hover:text-white transition-colors cursor-pointer" />
        </div>
      </nav>

      {/* --- মেইন কন্টেন্ট --- */}
      <main className="max-w-[600px] mx-auto pt-14 border-x border-white/5 min-h-screen">
        
        {/* ফিল্টার ট্যাব */}
        <div className="flex border-b border-white/5 sticky top-14 bg-black/80 backdrop-blur-md z-50">
          {['GLOBAL', 'ENCRYPTED', 'RESONANCE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-4 text-[10px] font-black tracking-widest transition-all ${activeFilter === tab ? 'text-cyan-500 border-b border-cyan-500' : 'text-zinc-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ইনপুট এরিয়া */}
        <div className="p-4 border-b border-white/5 bg-zinc-900/10">
          <div className="flex gap-4">
            <img src={user?.avatar} className="w-10 h-10 rounded-full" alt="" />
            <div className="flex-1">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Synchronize with the grid..."
                className="w-full bg-transparent border-none outline-none text-lg placeholder-zinc-700 resize-none pt-2"
                rows="2"
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.03]">
                <div className="flex gap-4 text-cyan-600">
                  <FaImage className="cursor-pointer hover:text-cyan-400" />
                  <FaBrain className="cursor-pointer hover:text-cyan-400" />
                </div>
                <button 
                  onClick={handlePost}
                  disabled={!postText.trim()}
                  className="bg-cyan-600 text-black px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider hover:bg-cyan-400 disabled:opacity-20 transition-all shadow-[0_0_15px_rgba(8,145,170,0.3)]"
                >
                  Execute
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* পোস্ট লিস্ট */}
        {loading ? (
          <div className="p-20 text-center font-mono text-[10px] tracking-[5px] text-zinc-700">SCANNING_DATA_STREAMS...</div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {displayPosts.map((post) => (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                key={post._id} 
                className="p-4 flex gap-4 hover:bg-white/[0.01] transition-all group"
              >
                <img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-white/5" alt="" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-200 text-sm">{post.authorName}</span>
                    <span className="text-zinc-600 text-xs">@{post.username || 'drifter'}</span>
                  </div>
                  <p className={`text-[15px] leading-relaxed ${post.isAiGenerated ? 'text-cyan-100/70 italic' : 'text-zinc-400'}`}>
                    {post.text}
                  </p>
                  
                  {/* ইন্টারঅ্যাকশন বাটন */}
                  <div className="flex justify-between mt-4 max-w-sm text-zinc-600 text-xs">
                    <div className="flex items-center gap-2 hover:text-rose-500 cursor-pointer transition-colors">
                      <FaRegHeart /> <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-cyan-500 cursor-pointer transition-colors">
                      <FaRegComment /> <span>{post.comments?.length || 0}</span>
                    </div>
                    <div className="hover:text-green-500 cursor-pointer transition-colors">
                      <FaShareAlt />
                    </div>
                    <div className="hover:text-purple-500 cursor-pointer transition-colors">
                      <FaBrain />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ফ্লোটিং বাটন (Mobile Style) */}
      <motion.div 
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(8,145,170,0.5)] z-[110] cursor-pointer"
      >
        <FaBolt />
      </motion.div>

    </div>
  );
};

export default OnyxFeed;