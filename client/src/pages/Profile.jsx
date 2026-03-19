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

  const API_URL = "https://my-cool-app-cvm7.onrender.com";

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🔐 SECURE API
  const getApi = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        return axios.create({ baseURL: API_URL });
      }

      const token = await getAccessTokenSilently();
      return axios.create({
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      return axios.create({ baseURL: API_URL });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // 🚀 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;

      try {
        setLoading(true);

        const encodedId = encodeURIComponent(username);
        const api = await getApi();

        // 👤 USER
        const userRes = await api.get(`/users/${encodedId}`);
        const userData = userRes.data;

        if (!userData) throw new Error("User not found");

        setUser(userData);
        setIsFollowing(userData.isFollowing || false);

        // 📝 POSTS
        try {
          const postsRes = await api.get(`/users/${encodedId}/posts`);
          setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
        } catch {
          setPosts([]);
        }

      } catch (error) {
        console.error("❌ Profile Error:", error?.response?.data || error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, getApi]);

  // ❤️ FOLLOW
  const handleFollowToggle = async () => {
    try {
      const api = await getApi();
      const encodedId = encodeURIComponent(user?._id || username);

      await api.post(`/users/${encodedId}/follow`);

      setIsFollowing((prev) => !prev);
      setUser((prev) => ({
        ...prev,
        followersCount: prev.followersCount + (isFollowing ? -1 : 1),
      }));
    } catch (error) {
      console.error("❌ Follow failed:", error?.response?.data || error.message);
    }
  };

  // ⏳ LOADING
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-cyan-500 font-mono">
        INITIALIZING_NEURAL_PROFILE...
      </div>
    );

  // ❌ NOT FOUND
  if (!user)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        User not found ⚠️
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-zinc-800 pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md flex items-center px-4 py-2 gap-6 border-b border-zinc-900/50">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>

        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-lg font-bold">{user.displayName || "User"}</h1>
            {user.isVerified && <Verified size={16} className="text-cyan-400" />}
          </div>
          <span className="text-xs text-zinc-500">{posts.length} Posts</span>
        </div>
      </header>

      {/* COVER */}
      <div className="h-40 bg-zinc-900">
        {user.coverImg && (
          <img src={user.coverImg} className="w-full h-full object-cover" alt="" />
        )}
      </div>

      {/* PROFILE */}
      <div className="px-4 -mt-12">
        <img
          src={user.avatar}
          className="w-24 h-24 rounded-full border-4 border-black object-cover"
          alt=""
        />

        <div className="flex justify-end mt-2 gap-2">
          <button className="p-2 border border-zinc-700 rounded-full">
            <MoreHorizontal size={18} />
          </button>

          {user.isMe ? (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-1 border border-zinc-700 rounded-full"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`px-4 py-1 rounded-full ${
                isFollowing ? "border border-zinc-700" : "bg-white text-black"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold mt-3">{user.displayName}</h2>
        <p className="text-zinc-500">@{user.username}</p>
        <p className="mt-2 text-zinc-300">{user.bio}</p>

        <div className="flex gap-4 text-sm text-zinc-500 mt-2">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} /> {user.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={14} /> {user.joinedAt}
          </div>
        </div>

        <div className="flex gap-5 mt-3 text-sm">
          <span>{user.followingCount} Following</span>
          <span>{user.followersCount} Followers</span>
        </div>
      </div>

      {/* POSTS */}
      <div className="mt-6 divide-y divide-zinc-800">
        {posts.length > 0 ? (
          posts.map((p) => (
            <div key={p._id} className="p-4">
              <p>{p.content}</p>
              {p.image && <img src={p.image} className="mt-2 rounded-xl" alt="" />}
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-zinc-500">
            No posts found
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-black p-6 border border-zinc-800 rounded-xl">
              <button onClick={() => setIsEditModalOpen(false)}>
                <X />
              </button>
              <h2>Edit Profile</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;