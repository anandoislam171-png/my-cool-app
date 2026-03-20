import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ArrowLeft, Calendar, MapPin,
  MoreHorizontal, Verified, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // 🌍 configuration
  const API_URL = "https://my-cool-app-cvm7.onrender.com";
  // 🚨 আপনার Auth0 Dashboard > APIs > Settings থেকে Identifier টি এখানে বসান
  const AUTH_AUDIENCE = "https://onyx-drift-api"; 

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🔐 SECURE API INSTANCE GENERATOR
  const getApi = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        return axios.create({ baseURL: API_URL });
      }

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: AUTH_AUDIENCE,
          scope: "openid profile email",
        },
      });

      return axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("🔑 Auth Token Error:", error.message);
      return axios.create({ baseURL: API_URL });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // 🚀 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const api = await getApi();
        
        // আপনার এরর অনুযায়ী রাউটটি /api/users/ হতে পারে
        // যদি ব্যাকএন্ডে সরাসরি /users/ থাকে তবে নিচেরটি কাজ করবে
        const encodedId = encodeURIComponent(username);
        
        // 👤 Fetch User Profile
        const userRes = await api.get(`/users/${encodedId}`);
        const userData = userRes.data;

        if (!userData) throw new Error("User not found");

        setUser(userData);
        setIsFollowing(userData.isFollowing || false);

        // 📝 Fetch User Posts
        try {
          const postsRes = await api.get(`/users/${encodedId}/posts`);
          setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
        } catch (postErr) {
          console.warn("⚠️ Posts not found or error:", postErr.message);
          setPosts([]);
        }

      } catch (error) {
        const errorMsg = error?.response?.data || error.message;
        console.error("❌ Profile Fetch Error:", errorMsg);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, getApi]);

  // ❤️ FOLLOW TOGGLE
  const handleFollowToggle = async () => {
    try {
      const api = await getApi();
      const targetId = user?._id || username;
      await api.post(`/users/${encodeURIComponent(targetId)}/follow`);

      setIsFollowing((prev) => !prev);
      setUser((prev) => ({
        ...prev,
        followersCount: prev.followersCount + (isFollowing ? -1 : 1),
      }));
    } catch (error) {
      console.error("❌ Follow Action Failed:", error?.response?.data || error.message);
    }
  };

  // ⏳ LOADING STATE
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-cyan-500 font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          INITIALIZING_NEURAL_PROFILE...
        </motion.div>
      </div>
    );

  // ❌ NOT FOUND STATE
  if (!user)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <span className="text-4xl text-zinc-700 font-bold">404</span>
        <p className="text-zinc-500 font-mono text-sm">USER_NOT_FOUND_IN_NETWORK ⚠️</p>
        <button onClick={() => navigate("/")} className="text-cyan-500 text-xs border border-cyan-500/30 px-4 py-1 rounded-full hover:bg-cyan-500/10">
          RETURN_HOME
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-zinc-800 pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md flex items-center px-4 py-2 gap-6 border-b border-zinc-900/50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>

        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-lg font-bold truncate max-w-[200px]">{user.displayName || user.username}</h1>
            {user.isVerified && <Verified size={16} className="text-cyan-400" />}
          </div>
          <span className="text-xs text-zinc-500">{posts.length} Posts</span>
        </div>
      </header>

      {/* COVER SECTION */}
      <div className="h-40 bg-zinc-900 relative">
        {user.coverImg ? (
          <img src={user.coverImg} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-900 opacity-50" />
        )}
      </div>

      {/* PROFILE INFO */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex justify-between items-end">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
            className="w-24 h-24 rounded-full border-4 border-black object-cover bg-zinc-800 shadow-xl"
            alt={user.username}
          />
          <div className="flex gap-2 pb-2">
            <button className="p-2 border border-zinc-700 rounded-full hover:bg-zinc-900 transition-colors">
              <MoreHorizontal size={18} />
            </button>

            {user.isMe ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1 border border-cyan-500/50 text-cyan-400 rounded-full hover:bg-cyan-500/10 transition-colors font-medium text-sm"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-1 rounded-full font-bold text-sm transition-all ${
                  isFollowing 
                    ? "border border-zinc-700 text-white hover:border-red-500/50 hover:text-red-400" 
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold leading-tight">{user.displayName}</h2>
          <p className="text-zinc-500 text-sm">@{user.username}</p>
        </div>

        <p className="mt-3 text-[15px] text-zinc-200 leading-relaxed max-w-lg">{user.bio || "No bio available."}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 mt-3 font-mono">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-zinc-600" /> {user.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-zinc-600" /> Joined {user.joinedAt || "Unknown"}
          </div>
        </div>

        <div className="flex gap-5 mt-4 text-sm font-medium">
          <span className="hover:underline cursor-pointer"><b className="text-white">{user.followingCount || 0}</b> <span className="text-zinc-500">Following</span></span>
          <span className="hover:underline cursor-pointer"><b className="text-white">{user.followersCount || 0}</b> <span className="text-zinc-500">Followers</span></span>
        </div>
      </div>

      {/* TABS SELECTION */}
      <div className="flex border-b border-zinc-800 mt-4 sticky top-14 bg-black/80 backdrop-blur-md z-30">
        {["Posts", "Replies", "Media"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-4 text-sm font-bold relative hover:bg-zinc-900/50 transition-colors"
          >
            <span className={activeTab === tab ? "text-white" : "text-zinc-500"}>{tab}</span>
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 rounded-full mx-10" />
            )}
          </button>
        ))}
      </div>

      {/* POSTS LIST */}
      <div className="divide-y divide-zinc-800">
        {posts.length > 0 ? (
          posts.map((p) => (
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              key={p._id} 
              className="p-4 hover:bg-zinc-900/30 transition-colors cursor-pointer"
            >
              <p className="text-[15px] leading-normal">{p.content}</p>
              {p.image && <img src={p.image} className="mt-3 rounded-2xl border border-zinc-800 w-full" alt="Post content" />}
            </motion.div>
          ))
        ) : (
          <div className="p-16 text-center">
            <p className="text-zinc-500 font-mono text-sm">NO_DATA_STREAM_FOUND</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-black w-full max-w-lg p-6 border border-zinc-800 rounded-2xl relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-zinc-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                 <p className="text-zinc-500 text-sm font-mono text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                    UI_EDIT_CONTROLS_LOADING...
                 </p>
              </div>
              
              <div className="flex justify-end mt-6">
                <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition-colors">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;