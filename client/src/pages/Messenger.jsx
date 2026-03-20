import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

// Constants
const API_URL = "https://my-cool-app-cvm7.onrender.com";
const AUTH_AUDIENCE = "https://onyx-drift-api";

const Messenger = ({ socket }) => {
  const { user, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const scrollRef = useRef();

  // ✅ FIXED TOKEN FUNCTION
  const getAuthToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: AUTH_AUDIENCE,
          scope: "openid profile email",
        },
        cacheMode: "off", // 🔥 very important
      });

      console.log("🔥 TOKEN:", token); // debug

      return token;
    } catch (e) {
      console.error("❌ Token Error:", e);
      return null;
    }
  }, [getAccessTokenSilently]);

  // ✅ AXIOS INSTANCE WITH INTERCEPTOR
  const api = useRef(null);

  useEffect(() => {
    api.current = axios.create({
      baseURL: API_URL,
    });

    api.current.interceptors.request.use(async (config) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }, [getAuthToken]);

  // ✅ FETCH CONVERSATIONS
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    try {
      const res = await api.current.get("/api/messages/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("❌ Conversations Error:", err?.response?.data || err.message);
    }
  }, [isAuthenticated, authLoading]);

  // ✅ FETCH MESSAGES
  const fetchMessages = useCallback(async (id) => {
    if (!id) return;

    try {
      const res = await api.current.get(`/api/messages/${id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("❌ Messages Error:", err?.response?.data || err.message);
    }
  }, []);

  // ✅ SEND MESSAGE
  const handleSend = async () => {
    if (!currentChat || !user) return;

    const msgData = {
      senderId: user.sub,
      text: "Hello",
      conversationId: currentChat._id,
      createdAt: new Date(),
    };

    try {
      await api.current.post("/api/messages/message", msgData);
    } catch (err) {
      console.error("❌ Send Error:", err?.response?.data || err.message);
    }
  };

  // EFFECTS
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchConversations();
    }
  }, [isAuthenticated, authLoading, fetchConversations]);

  useEffect(() => {
    if (currentChat) {
      fetchMessages(currentChat._id);
    }
  }, [currentChat, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className={`fixed inset-0 text-white h-[100dvh] overflow-hidden transition-all duration-700 ${isIncognito ? 'bg-[#0a0010]' : 'bg-[#02040a]'}`}>
      
      {/* 🔔 Notifications Layer */}
      <AnimatePresence>
        {showNotification && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-[300] bg-[#02040a] flex flex-col">
            <header className="p-4 pt-12 flex items-center gap-4 border-b border-white/5 bg-black/50 backdrop-blur-xl">
              <button onClick={() => setShowNotification(false)} className="p-2 text-zinc-400"><HiOutlineChevronLeft size={24}/></button>
              <h2 className="font-black uppercase tracking-widest text-sm text-cyan-500">Neural Log</h2>
            </header>
            <div className="flex-1 overflow-y-auto"><Notification /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 Conversations List */}
      <div className={`flex flex-col h-full w-full ${currentChat ? 'hidden' : 'flex'}`}>
        <header className="p-5 pt-12 flex flex-col gap-4 bg-black/40 border-b border-white/5 backdrop-blur-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={user?.picture || getAvatar(user?.name)} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl border border-cyan-500/30 object-cover" alt="Profile" />
              <div>
                <h1 className="text-lg font-black italic text-cyan-500 uppercase tracking-tighter">ONYXDRIFT</h1>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Node: {user?.nickname || "Unknown"}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setShowNotification(true)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 relative">
                 <HiOutlineBell size={20}/>
                 <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
               </button>
               <button onClick={() => setIsIncognito(!isIncognito)} className={`p-2.5 rounded-xl transition-all ${isIncognito ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-zinc-500'}`}>
                 <HiOutlineEyeSlash size={20}/>
               </button>
            </div>
          </div>
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
            <input type="text" placeholder="Scan the grid..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-cyan-500/50 text-white" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-32">
          {activeTab === "chats" && conversations.map(c => (
            <motion.div whileTap={{ scale: 0.98 }} key={c._id} onClick={() => setCurrentChat(c)} className="p-3.5 flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all">
              <img src={c.userDetails?.avatar || getAvatar(c.userDetails?.name)} referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="Avatar" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-zinc-200">{c.userDetails?.name || "Drifter"}</span>
                  <span className="text-[8px] text-zinc-600 font-mono">{c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate italic">{c.lastMessage?.text || "New encrypted channel..."}</p>
              </div>
            </motion.div>
          ))}
          
          {activeTab === "groups" && (
            <GroupMessenger 
              socket={socket} 
              API_URL={API_URL} 
              getAuthToken={getAuthToken} 
              onSelectGroup={(group) => setCurrentChat({ ...group, isGroup: true, userDetails: { name: group.name, avatar: getAvatar("Group") } })}
            />
          )}
          
          {activeTab === "settings" && <Settings />}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 p-4 pb-10 flex justify-around items-center bg-black/80 backdrop-blur-2xl border-t border-white/5 z-50">
          <button onClick={() => setActiveTab("chats")} className={`p-3 flex flex-col items-center gap-1 ${activeTab === "chats" ? 'text-cyan-500' : 'text-zinc-600'}`}>
            <HiChatBubbleLeftRight size={24} />
            <span className="text-[8px] font-black uppercase">Channels</span>
          </button>
          <button onClick={() => setActiveTab("groups")} className={`p-3 flex flex-col items-center gap-1 ${activeTab === "groups" ? 'text-cyan-500' : 'text-zinc-600'}`}>
            <HiUsers size={24} />
            <span className="text-[8px] font-black uppercase">Nexus</span>
          </button>
          <button onClick={() => setActiveTab("settings")} className={`p-3 flex flex-col items-center gap-1 ${activeTab === "settings" ? 'text-cyan-500' : 'text-zinc-600'}`}>
            <HiCog6Tooth size={24} />
            <span className="text-[8px] font-black uppercase">Config</span>
          </button>
        </nav>
      </div>

      {/* 💬 Chat Interface Layer */}
      <AnimatePresence>
        {currentChat && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-[200] flex flex-col bg-[#02040a]">
            <header className="p-3 pt-12 flex justify-between items-center border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentChat(null)} className="text-zinc-400 p-2"><HiOutlineChevronLeft size={28}/></button>
                  <img src={currentChat.userDetails?.avatar || getAvatar(currentChat.userDetails?.name)} referrerPolicy="no-referrer" className="w-9 h-9 rounded-lg border border-cyan-500/20 object-cover" alt="User" />
                  <div>
                    <h3 className="font-bold text-xs">{currentChat.userDetails?.name || "Anonymous"}</h3>
                    <div className="flex items-center gap-1">
                       <div className={`w-1.5 h-1.5 rounded-full ${typingUser ? 'bg-green-500 animate-bounce' : 'bg-cyan-500 animate-pulse'}`}/>
                       <p className="text-[8px] text-cyan-500 font-black uppercase tracking-widest">{typingUser ? 'Typing Signal...' : 'Linked'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 pr-2">
                  <button onClick={() => initiateCall('audio')} className="p-2.5 text-zinc-400 hover:text-cyan-500 hover:bg-white/5 rounded-xl transition-all"><FaPhone size={16}/></button>
                  <button onClick={() => initiateCall('video')} className="p-2.5 text-zinc-400 hover:text-cyan-500 hover:bg-white/5 rounded-xl transition-all"><HiOutlineVideoCamera size={22}/></button>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
              {isLoadingMessages ? <NeonSpinner /> : messages.map((m, i) => (
                <div key={m._id || i} className={`flex flex-col ${m.senderId === user?.sub ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] border ${m.senderId === user?.sub ? "bg-cyan-500/10 border-cyan-500/20 text-white" : "bg-white/5 border-white/10 text-zinc-300"}`}>
                    {m.mediaType === "image" && m.media && <img src={m.media} referrerPolicy="no-referrer" alt="Neural" className="rounded-lg mb-2 max-h-60 w-full object-cover border border-white/10" />}
                    {m.mediaType === "voice" && m.media && <NeuralAudioPlayer url={m.media} />}
                    {m.text && <p className="text-[13px] leading-relaxed break-words">{m.text}</p>}
                  </div>
                  <span className="text-[7px] text-zinc-600 mt-1 uppercase font-mono">
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 pb-10 bg-black/90 backdrop-blur-2xl border-t border-white/5">
              <MoodSelector currentMood={selectedMood} onSelectMood={setSelectedMood} />
              <div className="flex items-center gap-2 mt-4 bg-white/5 p-1.5 pl-4 rounded-3xl border border-white/10">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className="text-zinc-500 p-2 hover:text-cyan-500">
                  <HiOutlinePhoto size={22} className={isUploading ? "animate-spin" : ""} />
                </button>
                <input 
                  value={newMessage} 
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    const s = socket?.current || socket;
                    if(s && currentChat) s.emit("typing", { conversationId: currentChat._id, senderName: user?.name || "Someone" });
                  }} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder="Transmit signal..." 
                  className="bg-transparent flex-1 outline-none text-white text-[13px]" 
                />
                {newMessage.trim() === "" ? (
                  <button onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white/5 text-zinc-400'}`}>
                    {isRecording ? <HiOutlineStopCircle size={20} /> : <HiOutlineMicrophone size={20} />}
                  </button>
                ) : (
                  <button onClick={() => handleSend()} className="p-3 rounded-full bg-cyan-500 text-black active:scale-90">
                    <HiOutlinePaperAirplane size={18} className="-rotate-45" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messenger;