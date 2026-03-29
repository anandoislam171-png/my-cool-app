import React, { useEffect, useState, useMemo, useCallback, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaRegHeart, FaSearch, FaRegComment, 
  FaRetweet, FaShare, FaImage, FaTimes, FaGlobeAmericas, FaSmile 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { AuthContext } from '../context/AuthContext';

// --- ১. পোস্ট তৈরি করার ইন্টারনাল কম্পোনেন্ট (Neural Synthesizer) ---
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
      await api.post("/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
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
            src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=06b6d4&color=fff`} 
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
                  <video src={preview} className="w-full h-auto" controls />
                ) : (
                  <img src={preview} alt="preview" className="w-full h-auto max-h-[450px] object-cover" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1.5 py-3 border-b border-white/[0.05] mb-3">
            <FaGlobeAmericas className="text-cyan-500" size={12} />
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Public Neural Access</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="p-2.5 rounded-full hover:bg-cyan-500/10 text-cyan-500 transition-all active:scale-90"
              >
                <FaImage size={18} />
              </button>
              <button className="p-2.5 rounded-full hover:bg-cyan-500/10 text-cyan-500 transition-all opacity-40"><FaSmile size={18} /></button>
              <input type="file" ref={fileInputRef} onChange={handleMediaChange} className="hidden" accept="image/*,video/*" />
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !media)}
              className="bg-cyan-500 text-black px-6 py-1.5 rounded-full font-black text-[13px] uppercase hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              {loading ? "..." : "Drift"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ২. মেইন হোম ফিড কম্পোনেন্ট ---
const PremiumHomeFeed = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  const { user, api, loading: isAuthLoading } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Global");

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get("/posts/neural-feed");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Feed error:", err);
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
      setPosts(prev => prev.map(p => p._id === id ? res.data : p));
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  // ডাইনামিক ইউআরএল হ্যান্ডলার
  const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Render এ সেট করা VITE_API_URL থেকে বেইজ ইউআরএল বের করা
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/${path.replace(/\\/g, '/')}`;
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (activeFilter === "Encrypted") result = result.filter(p => p.isEncrypted);
    if (searchQuery) {
      result = result.filter(p => 
        p.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [posts, activeFilter, searchQuery]);

  if (isAuthLoading) return null;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-cyan-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/[0.05] p-4 flex justify-between items-center px-6">
        <h2 className="text-lg font-black tracking-tighter uppercase italic">
          Onyx<span className="text-cyan-500 font-mono">Drift</span>
        </h2>
        <FaSearch className="text-zinc-500 cursor-pointer hover:text-white transition-all" onClick={() => navigate("/explorer")} />
      </header>

      <main className="max-w-xl mx-auto border-x border-white/[0.05] min-h-screen bg-zinc-950/20">
        <CreatePost onPostCreated={fetchPosts} api={api} user={user} />

        {/* TABS */}
        <div className="flex border-b border-white/[0.05] sticky top-[60px] bg-black/80 backdrop-blur-md z-40">
          {["Global", "Encrypted", "Following"].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest relative"
            >
              <span className={activeFilter === f ? "text-white" : "text-zinc-500 transition-colors"}>{f}</span>
              {activeFilter === f && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* FEED LIST */}
        <div className="flex flex-col">
          {loading && posts.length === 0 ? (
            <div className="p-20 text-center text-zinc-700 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
              Syncing_Neural_Grid...
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                key={post._id} 
                className="p-4 border-b border-white/[0.05] hover:bg-white/[0.01] transition-all group"
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 overflow-hidden shadow-lg group-hover:border-cyan-500/30 transition-colors">
                      {post.authorProfilePic ? (
                        <img src={getMediaUrl(post.authorProfilePic)} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-xs">
                          {post.authorName?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>
                    <div className="w-[1px] grow bg-white/[0.05] my-2 group-hover:bg-white/10 transition-colors" />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[14px] text-zinc-100 hover:underline">{post.authorName || "Drifter"}</span>
                        <span className="text-zinc-600 text-[13px]">@{post.authorName?.toLowerCase().replace(/\s/g, '') || "anon"}</span>
                        <span className="text-zinc-700 text-[11px]">· {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>

                    <p className="text-[14px] text-zinc-300 leading-relaxed mb-2 whitespace-pre-wrap">{post.text}</p>

                    {/* PHOTO / VIDEO DISPLAY */}
                    {post.mediaUrl && (
                      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-2 bg-zinc-900/40 shadow-inner group-hover:border-white/20 transition-all">
                        {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) || post.mediaType === "video" ? (
                          <video 
                            src={getMediaUrl(post.mediaUrl)} 
                            controls 
                            className="w-full max-h-[400px] object-contain bg-black" 
                          />
                        ) : (
                          <img 
                            src={getMediaUrl(post.mediaUrl)} 
                            alt="media" 
                            className="w-full h-auto object-cover max-h-[500px]" 
                            onError={(e) => { 
                                e.target.style.display = 'none'; 
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-between items-center max-w-sm mt-3 text-zinc-500">
                      <button className="hover:text-cyan-400 flex items-center gap-2 transition-all">
                        <FaRegComment size={15} /> <span className="text-[11px]">{post.comments?.length || 0}</span>
                      </button>
                      <button className="hover:text-green-500 transition-all"><FaRetweet size={17} /></button>
                      <button 
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 transition-all ${post.likes?.includes(user?._id) ? 'text-rose-500' : 'hover:text-rose-500'}`}
                      >
                        {post.likes?.includes(user?._id) ? <FaHeart size={15} /> : <FaRegHeart size={15} />}
                        <span className="text-[11px] font-bold">{post.likes?.length || 0}</span>
                      </button>
                      <button className="hover:text-cyan-400 transition-all"><FaShare size={14} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-20 text-center text-zinc-800 font-mono text-[10px] tracking-widest uppercase">
              ZERO_SIGNALS_DETECTED_IN_SECTOR
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PremiumHomeFeed;