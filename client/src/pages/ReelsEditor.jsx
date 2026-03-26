import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
// ১. Auth0 এর বদলে আমাদের কাস্টম Auth Context ইম্পোর্ট করুন
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Play, Sparkles, Send, Wand2, Layers, Scissors } from "lucide-react";
import toast from 'react-hot-toast';

// সাব-কম্পোনেন্ট ইমপোর্ট
import Sidebar from "../components/Editor/Sidebar";
import Timeline from "../components/Editor/Timeline";
import Modals from "../components/Editor/Modals";
import Marketplace from "../components/Editor/Marketplace";
import { renderVideo } from "../services/RenderService"; 
import { detectSilence } from "../services/SilenceDetectionService";
import { detectBeats } from "../services/BeatSyncService";
import { generateSubtitles } from "../services/AutoSubtitleService";
import { removeObjectFromVideo } from "../services/ObjectRemovalService";

// API URL (আপনার এনভায়রনমেন্ট অনুযায়ী)
const API_URL = "https://onyx-drift-app-final-u29m.onrender.com";

const TikTokEditor = () => {
  // ২. Auth0 এর বদলে useAuth ব্যবহার
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // ৩. টোকেন গেট করার কাস্টম ফাংশন (LocalStorage থেকে)
  const getAccessToken = () => localStorage.getItem('accessToken');

  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRendering, setIsRendering] = useState(false); 
  const [activeMenu, setActiveMenu] = useState(null);
  const [renderProgress, setRenderProgress] = useState(0);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [clips, setClips] = useState([]); 
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [tracks, setTracks] = useState({
    video: [], 
    audio: [], 
    text: []   
  });

  const [editData, setEditData] = useState({
    filters: { 
      brightness: 100, contrast: 100, saturate: 100, 
      exposure: 0, shadows: 0, highlights: 0, 
      blur: 0, temperature: 0, tint: 0, vibrance: 100 
    },
    aiAutoEffects: 'none', 
    playbackSpeed: 1,
    layers: [],
    aspectRatio: "9:16",
    rotation: 0,
    isFlipped: false,
    shareToMarketplace: false,
    removeBackground: false 
  });

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Auto-play blocked"));
    }
  }, [videoSrc]);

  // --- API কলের জন্য হেডার জেনারেটর ---
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });

  const handleObjectRemoval = async () => {
    if (!selectionRect || !videoFile) return toast.error("Select an object first!");
    const eraseToast = toast.loading("AI is digitally erasing the object...");
    try {
      const token = getAccessToken(); // কাস্টম টোকেন
      const cleanVideoUrl = await removeObjectFromVideo(videoFile, selectionRect, token);
      setVideoSrc(cleanVideoUrl);
      setIsEraserMode(false);
      setSelectionRect(null);
      toast.success("Object Vanished into Thin Air!", { id: eraseToast });
    } catch (err) {
      toast.error("Eraser failed. Try a smaller area.", { id: eraseToast });
    }
  };

  const handleAutoCaptions = async () => {
    if (!videoSrc) return toast.error("Inject video first!");
    const sToast = toast.loading("AI is listening to your video...");
    try {
      const captions = await generateSubtitles(videoSrc);
      const newLayers = captions.map(cap => ({
        id: Date.now() + Math.random(),
        type: 'text',
        content: cap.text,
        start: cap.start,
        end: cap.end,
        style: {
          fontSize: '24px',
          fontWeight: '900',
          color: '#facc15',
          textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
          fontFamily: 'Inter, sans-serif'
        }
      }));
      setEditData(prev => ({ ...prev, layers: [...prev.layers, ...newLayers] }));
      setTracks(t => ({ ...t, text: [...t.text, ...newLayers] }));
      toast.success(`${captions.length} Captions Generated!`, { id: sToast });
    } catch (err) {
      toast.error("Subtitle generation failed.", { id: sToast });
    }
  };

  const generateVoiceover = async (text) => {
    if (!text) return toast.error("Enter text for voiceover!");
    setIsAiProcessing(true);
    const vToast = toast.loading("Synthesizing Neural Voice...");
    try {
      const res = await axios.post(`${API_URL}/api/ai/generate-voiceover`, 
        { text: text },
        getAuthHeaders() // OAuth2 হেডার ব্যবহার
      );
      const newLayer = { id: Date.now(), type: 'audio', content: 'AI Voiceover', url: res.data.audioUrl };
      setEditData(p => ({ ...p, layers: [...p.layers, newLayer] }));
      setTracks(t => ({...t, audio: [...t.audio, newLayer]}));
      toast.success("Voiceover Synced to Timeline!", { id: vToast });
    } catch (err) {
      toast.error("Voice Synthesis Failed", { id: vToast });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const applyAICommand = async () => {
    if (!aiPrompt) return toast.error("Enter a command first!");
    setIsAiProcessing(true);
    const loadingToast = toast.loading("AI is analyzing your command...");
    try {
      const res = await axios.post(`${API_URL}/api/ai/process-command`, 
        { command: aiPrompt, currentFilters: editData.filters },
        getAuthHeaders()
      );
      setEditData(prev => ({ ...prev, filters: res.data.newFilters }));
      toast.success("AI Visual Refactoring Complete!", { id: loadingToast });
      setAiPrompt("");
    } catch (err) {
      toast.error("AI Neural Link Failed", { id: loadingToast });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const triggerRemoveBG = async () => {
    if (!videoFile) return toast.error("Please upload a video first!");
    setIsAiProcessing(true);
    toast.loading("AI is removing background...");
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      const res = await axios.post(`${API_URL}/api/ai/remove-background`, formData, {
        headers: { 
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data" 
        }
      });
      setVideoSrc(res.data.processedVideo);
      toast.dismiss();
      toast.success("Background Removed!");
    } catch (err) {
      toast.dismiss();
      toast.error("AI Removal Failed!");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const checkViralPotential = async () => {
    setIsAiProcessing(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/analyze-viral-score`, {
        videoData: editData,
        currentTitle: "OnyxDrift Reel"
      }, getAuthHeaders());
      toast(`Viral Score: ${res.data.analysis.score}%`, { icon: '🚀' });
    } catch (err) {
      toast.error("Prediction Engine Offline");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- অন্যান্য UI লজিক (অপরিবর্তিত) ---
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newClips = files.map(file => ({
        id: Date.now() + Math.random(),
        file: file,
        src: URL.createObjectURL(file)
      }));
      setClips(prev => [...prev, ...newClips]);
      setVideoFile(files[0]); 
      setVideoSrc(newClips[0].src);
      toast.success(`${files.length} Source(s) Injected!`);
    }
  };

  const handleExport = async () => {
    if (!videoFile) return toast.error("No video to export!");
    setIsRendering(true);
    const toastId = toast.loading("Merging Audio & Video Strands...");
    try {
      const renderedVideoUrl = await renderVideo(videoFile, editData.layers, editData, setRenderProgress);
      const a = document.createElement('a');
      a.href = renderedVideoUrl;
      a.download = `Onyx_Edit_${Date.now()}.mp4`;
      a.click();
      toast.success("Render Complete!", { id: toastId });
    } catch (error) {
      toast.error("Render Failed.", { id: toastId });
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020202] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        editData={editData} 
        setEditData={setEditData} 
        predictViralScore={checkViralPotential} 
        setIsMarketplaceOpen={setIsMarketplaceOpen}
      />

      <main className="flex-1 flex flex-col h-full relative z-0">
        <header className="p-4 md:p-8 flex justify-between items-center z-10 bg-[#020202]/80 backdrop-blur-md">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-zinc-400 shrink-0">
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 max-w-md mx-4 relative hidden md:block">
            <div className="bg-zinc-900/50 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 focus-within:border-cyan-500/50 transition-all">
              <input 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Command AI: 'Make it cinematic'..."
                className="bg-transparent border-none outline-none text-[11px] w-full placeholder:text-zinc-600"
              />
              <div className="flex gap-1">
                 <button onClick={applyAICommand} className="p-1.5 hover:bg-white/10 rounded-full text-cyan-500 transition-colors"><Wand2 size={14}/></button>
                 <button onClick={() => {}} className="p-1.5 bg-cyan-500 text-black rounded-full hover:scale-110 transition-transform"><Send size={14}/></button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 md:gap-4 shrink-0">
            <button onClick={handleAutoCaptions} className="p-2 md:p-3 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/5 transition-all text-amber-400">
              <Sparkles size={18} />
            </button>
            <button 
              onClick={handleExport} 
              disabled={isRendering}
              className="px-4 md:px-6 py-2 md:py-3 bg-cyan-500 text-black font-black uppercase text-[10px] md:text-xs rounded-full shadow-lg transition-all"
            >
              {isRendering ? `Rendering ${renderProgress}%` : "Export"}
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 relative z-0 overflow-hidden">
          {videoSrc ? (
            <div 
              className="relative rounded-2xl overflow-hidden bg-black shadow-2xl transition-all"
              style={{ 
                aspectRatio: "9/16", 
                maxHeight: "65vh", 
                width: "auto",
                transform: `scaleX(${editData.isFlipped ? -1 : 1})` 
              }}
            >
              <video
                ref={videoRef} 
                src={videoSrc} 
                loop 
                playsInline 
                autoPlay
                className="w-full h-full object-contain"
                style={{ filter: `brightness(${editData.filters.brightness}%) contrast(${editData.filters.contrast}%) saturate(${editData.filters.saturate}%) blur(${editData.filters.blur}px)` }}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration)}
              />
            </div>
          ) : (
            <div onClick={() => fileInputRef.current.click()} className="flex flex-col items-center cursor-pointer group">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-dashed border-cyan-500/20 group-hover:border-cyan-500 transition-all">
                <Plus size={32} className="text-cyan-500" />
              </div>
              <p className="mt-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Inject Neural Source</p>
            </div>
          )}
        </div>

        <Timeline 
          currentTime={currentTime} duration={duration} videoRef={videoRef} isPlaying={isPlaying} 
          setEditData={setEditData} setVideoSrc={setVideoSrc} clips={clips} tracks={tracks} 
        />
      </main>

      <Marketplace isOpen={isMarketplaceOpen} onClose={() => setIsMarketplaceOpen(false)} />
      <input ref={fileInputRef} type="file" hidden accept="video/*" multiple onChange={handleUpload} />
    </div>
  );
};

export default TikTokEditor;