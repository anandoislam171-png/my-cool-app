import React, { useEffect, useState, useMemo, useCallback, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaRegHeart, FaSearch, FaRegComment, 
  FaShare, FaImage, FaTimes, FaSmile,
  FaVolumeUp, FaVolumeMute
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { AuthContext } from '../context/AuthContext';

// গ্লোবাল সাউন্ড স্টেট
let globalIsMuted = true;

/* ==========================================================
    ১. স্মার্ট ভিডিও ইঞ্জিন (NeuralVideoPlayer)
========================================================== */
const NeuralVideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(globalIsMuted);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Received Token:", token); // এটি চেক করুন
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id }; 
      return next();
    } catch (error) {
      console.log("JWT Verification Detail:", error.message); // এখানে আসল কারণ দেখা যাবে (যেমন: jwt expired)
      return res.status(401).json({ error: "Neural Link Severed", message: error.message });
    }
  }
  return res.status(401).json({ error: "Access Denied", message: "No Token Provided" });
};
  const toggleMute = (e) => {
    e.stopPropagation();
    globalIsMuted = !muted;
    setMuted(!muted);
    if (videoRef.current) videoRef.current.muted = globalIsMuted;
  };

  return (
    <div className="relative group/video rounded-xl overflow-hidden bg-black border border-white/5">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        className="w-full max-h-[500px] object-contain cursor-pointer"
        onClick={toggleMute}
      />
      <button 
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover/video:opacity-100 transition-opacity"
      >
        {muted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} className="text-cyan-400" />}
      </button>
    </div>
  );
};

/* ==========================================================
    ২. পোস্ট তৈরির কম্পোনেন্ট (Neural Synthesizer)
========================================================== */
const CreatePost = ({ onPostCreated, api, user }) => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim() && !media) return toast.error("Input required for transmission");
    
    const formData = new FormData();
    formData.append("text", text);
    if (media) formData.append("media", media); 

    try {
      setLoading(true);
      // এখানে টোকেনটি অটোমেটিক আপনার 'api' ইন্টারসেপ্টর থেকে যাওয়ার কথা
      await api.post("/posts", formData);
      toast.success("Signal Transmitted!");
      setText("");
      removeMedia();
      if (onPostCreated) onPostCreated(); 
    } catch (err) {
      toast.error("Transmission Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-white/[0.05] bg-black">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 shrink-0 overflow-hidden shadow-md">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}&background=06b6d4&color=fff`} 
            alt="me" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening in the drift?"
            className="w-full bg-transparent border-none focus:ring-0 text-[16px] text-zinc-200 placeholder-zinc-600 resize-none min-h-[60px] font-medium"
          />
          
          <AnimatePresence>
            {preview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-2 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900"
              >
                <button 
                  onClick={removeMedia} 
                  className="absolute top-2 left-2 bg-black/70 p-2 rounded-full hover:bg-black z-10 text-white"
                >
                  <FaTimes size={12} />
                </button>
                {media?.type.startsWith("video") ? (
                  <video src={preview} className="w-full h-auto" muted controls />
                ) : (
                  <img src={preview} alt="preview" className="w-full h-auto max-h-[450px] object-cover" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-1">
              <button onClick={() => fileInputRef.current.click()} className="p-2.5 rounded-full hover:bg-cyan-500/10 text-cyan-500 transition-all active:scale-90"><FaImage size={18} /></button>
              <button className="p-2.5 rounded-full hover:bg-cyan-500/10 text-cyan-500 transition-all opacity-40"><FaSmile size={18} /></button>
              <input type="file" ref={fileInputRef} onChange={handleMediaChange} className="hidden" accept="image/*,video/*" />
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !media)}
              className="bg-cyan-500 text-black px-6 py-1.5 rounded-full font-black text-[13px] uppercase hover:bg-cyan-400 disabled:opacity-30 transition-all"
            >
              {loading ? "..." : "Drift"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
    ৩. মেইন হোম ফিড (PremiumHomeFeed)
========================================================= */
const PremiumHomeFeed = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  const { user, api, loading: isAuthLoading, logout } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Global");

  // ডোমেইন ভিত্তিক মিডিয়া ইউআরএল ফিক্স
  const getMediaUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // ব্যাকস্ল্যাশ ফিক্স করা হয়েছে এবং ডোমেইন পাথ ঠিক করা হয়েছে
    const cleanPath = url.replace(/\\/g, '/');
    return `https://onyx-drift.com/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      // রিকোয়েস্ট পাঠানোর সময় হেডার নিশ্চিত করা
      const res = await api.get("/posts/neural-feed"); 
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Neural grid access denied. Re-authenticating...");
        // যদি টোকেন এক্সপায়ার হয় তবে অটো লগআউট লজিক এখানে দিতে পারেন
      } else {
        toast.error("Neural grid offline");
      }
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handleLike = async (id) => {
    try {
      const res = await api.post(`/posts/${id}/like`);
      setPosts(prev => prev.map(p => p._id === id ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      result = result.filter(p => 
        p.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [posts, searchQuery]);

  if (isAuthLoading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-cyan-500 font-mono text-xs animate-pulse tracking-[0.3em]">INITIALIZING_NEURAL_LINK...</div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-cyan-500/30">
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/[0.05] p-4 flex justify-between items-center px-6">
        <h2 className="text-lg font-black tracking-tighter uppercase italic">
          Onyx<span className="text-cyan-500 font-mono">Drift</span>
        </h2>
        <FaSearch className="text-zinc-500 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => navigate("/explorer")} />
      </header>

      <main className="max-w-xl mx-auto border-x border-white/[0.05] min-h-screen bg-zinc-950/20">
        <CreatePost onPostCreated={fetchPosts} api={api} user={user} />

        <div className="flex border-b border-white/[0.05] sticky top-[60px] bg-black/80 backdrop-blur-md z-40">
          {["Global", "Following"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest relative">
              <span className={activeFilter === f ? "text-white" : "text-zinc-500"}>{f}</span>
              {activeFilter === f && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col pb-20">
          {loading && posts.length === 0 ? (
            <div className="p-20 text-center text-cyan-500 font-mono text-[10px] animate-pulse uppercase tracking-[0.2em]">SYNCING_NEURAL_GRID...</div>
          ) : filteredPosts.length === 0 ? (
             <div className="p-20 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-[0.2em]">No signals detected in the drift</div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post._id} className="p-4 border-b border-white/[0.05] hover:bg-white/[0.01] transition-all group">
                <div className="flex gap-3">
                  <img 
                    src={getMediaUrl(post.authorAvatar || post.authorProfilePic) || `https://ui-avatars.com/api/?name=${post.authorName || 'D'}&background=18181b&color=71717a`} 
                    className="w-10 h-10 rounded-full bg-zinc-900 object-cover border border-white/10"
                    alt="" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-[14px] hover:underline cursor-pointer">{post.authorName || "Drifter"}</span>
                      <span className="text-zinc-600 text-[12px]">· {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-[14.5px] text-zinc-300 leading-relaxed mb-3">{post.text}</p>
                    
                    {post.media && (
                      <div className="my-3">
                        {post.media.match(/\.(mp4|webm|mov|quicktime)$/i) ? (
                          <NeuralVideoPlayer src={getMediaUrl(post.media)} />
                        ) : (
                          <img src={getMediaUrl(post.media)} className="rounded-xl w-full object-cover border border-white/5 shadow-2xl" alt="" />
                        )}
                      </div>
                    )}

                    <div className="flex justify-between max-w-sm mt-4 text-zinc-500">
                      <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                        <FaRegComment size={15}/> 
                        <span className="text-xs">{post.comments?.length || 0}</span>
                      </button>
                      <button 
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 transition-colors ${post.likes?.includes(user?._id) ? 'text-rose-500' : 'hover:text-rose-500'}`}
                      >
                        {post.likes?.includes(user?._id) ? <FaHeart size={15} className="drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"/> : <FaRegHeart size={15}/>}
                        <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                      </button>
                      <button className="hover:text-cyan-400 transition-colors"><FaShare size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PremiumHomeFeed;