import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineChevronLeft, HiOutlineBell, HiOutlineEyeSlash, 
  HiMagnifyingGlass, HiChatBubbleLeftRight, HiUsers, 
  HiCog6Tooth, HiOutlineVideoCamera, HiOutlinePhoto, 
  HiOutlineMicrophone, HiOutlinePaperAirplane, HiOutlineStopCircle 
} from "react-icons/hi2";

const API_URL = "https://my-cool-app-cvm7.onrender.com";
const AUTH_AUDIENCE = "https://onyx-drift-api";
const CLOUD_NAME = "dx0cf0ggu";
const UPLOAD_PRESET = "onyx_preset"; // আপনার Cloudinary Unsigned Preset নাম
const CLOUDINARY_URL = `https://api.cloudinary.com{CLOUD_NAME}/image/upload`;

const getAvatar = (name) => `https://api.dicebear.com{name || 'Drifter'}`;

const Messenger = ({ socket }) => {
  const { user, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);

  const scrollRef = useRef();
  const fileInputRef = useRef();
  const api = useRef(axios.create({ baseURL: API_URL }));

  // ✅ AUTH TOKEN SETUP
  const getAuthToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: { audience: AUTH_AUDIENCE, scope: "openid profile email" },
        cacheMode: "off",
      });
    } catch (e) { 
      console.error("Token fetch error:", e);
      return null; 
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const interceptor = api.current.interceptors.request.use(async (config) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => api.current.interceptors.request.eject(interceptor);
  }, [getAuthToken]);

  // ✅ SOCKET LOGIC
  useEffect(() => {
    const s = socket?.current || socket;
    if (!s) return;

    s.on("getUsers", (users) => setOnlineUsers(users));
    
    s.on("displayTyping", (data) => {
      if (currentChat?.userDetails?.auth0Id === data.senderId) setTypingStatus("Typing...");
    });

    s.on("hideTyping", () => setTypingStatus(""));

    s.on("getMessage", (data) => {
      if (currentChat?._id === data.conversationId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      s.off("getUsers");
      s.off("displayTyping");
      s.off("hideTyping");
      s.off("getMessage");
    };
  }, [socket, currentChat]);

  // ✅ FETCH DATA
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.current.get("/api/messages/conversations");
      setConversations(res.data || []);
    } catch (err) { console.error("Conversations load error:", err); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchConversations();
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    if (currentChat) {
      api.current.get(`/api/messages/${currentChat._id}`).then(res => setMessages(res.data));
    }
  }, [currentChat]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ✅ HANDLERS
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const s = socket?.current || socket;
    if (s && currentChat) {
      s.emit("typing", { senderId: user.sub, receiverId: currentChat.userDetails?.auth0Id });
      // Clear typing after 3s
      if (window.typingTimeout) clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        s.emit("stopTyping", { receiverId: currentChat.userDetails?.auth0Id });
      }, 3000);
    }
  };

  const handleSend = async (imageLink = null) => {
    if (!currentChat || (!newMessage.trim() && !imageLink)) return;
    const msgData = { 
      senderId: user.sub, 
      text: newMessage, 
      media: imageLink, // মডেলে 'media' ব্যবহার করা হয়েছে
      mediaType: imageLink ? "image" : "text",
      conversationId: currentChat._id 
    };

    try {
      const res = await api.current.post("/api/messages/message", msgData);
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
      const s = socket?.current || socket;
      if (s) s.emit("sendMessage", { ...res.data, receiverId: currentChat.userDetails?.auth0Id });
    } catch (err) { console.error("Send error:", err); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await axios.post(CLOUDINARY_URL, formData);
      handleSend(res.data.secure_url);
    } catch (err) { 
      console.error("Upload error:", err);
      alert("Upload failed! Check your preset name."); 
    } finally { setIsUploading(false); }
  };

  const isOnline = (id) => onlineUsers.some(u => u.userId === id);

  return (
    <div className={`fixed inset-0 text-white h-[100dvh] overflow-hidden transition-all duration-700 ${isIncognito ? 'bg-[#0a0010]' : 'bg-[#02040a]'}`}>
      {!currentChat ? (
        <div className="flex flex-col h-full w-full">
          <header className="p-5 pt-12 bg-black/40 border-b border-white/5 backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <img src={user?.picture} className="w-10 h-10 rounded-xl border border-cyan-500/30" alt="me" />
                <h1 className="text-lg font-black text-cyan-500 italic uppercase">ONYXDRIFT</h1>
              </div>
            </div>
            <input type="text" placeholder="Scan the grid..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm" />
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {conversations.map(c => (
              <div key={c._id} onClick={() => setCurrentChat(c)} className="p-3.5 flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl relative cursor-pointer">
                <div className="relative">
                  <img src={c.userDetails?.avatar || getAvatar(c.userDetails?.name)} className="w-12 h-12 rounded-xl object-cover" alt="avatar" />
                  {isOnline(c.userDetails?.auth0Id) && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm">{c.userDetails?.name || "Unknown"}</h3>
                  <p className="text-xs text-zinc-500 truncate">{c.lastMessage?.text || "New encrypted channel..."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full bg-[#02040a]">
          <header className="p-4 pt-10 flex items-center gap-3 bg-black/60 border-b border-white/5">
            <button onClick={() => setCurrentChat(null)}><HiOutlineChevronLeft size={24}/></button>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{currentChat.userDetails?.name}</span>
              <span className="text-[10px] text-cyan-400 italic">{typingStatus || (isOnline(currentChat.userDetails?.auth0Id) ? "Online" : "Offline")}</span>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.senderId === user.sub ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${m.senderId === user.sub ? 'bg-cyan-600' : 'bg-white/10'}`}>
                  {m.media && <img src={m.media} className="rounded-lg mb-2 max-h-60" alt="sent" />}
                  {m.text && <p className="text-sm">{m.text}</p>}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <footer className="p-4 bg-black/80 border-t border-white/5 flex items-center gap-2">
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="p-2 text-zinc-400">
              <HiOutlinePhoto size={24} className={isUploading ? "animate-spin" : ""}/>
            </button>
            <input 
              value={newMessage} 
              onChange={handleTyping} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm outline-none" 
              placeholder={isUploading ? "Uploading Data..." : "Transmission..."} 
            />
            <button onClick={() => handleSend()} className="p-2.5 bg-cyan-500 rounded-xl text-black"><HiOutlinePaperAirplane size={20}/></button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Messenger;
