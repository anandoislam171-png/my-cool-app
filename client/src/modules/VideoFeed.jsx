import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Music, ShieldCheck, Zap } from 'lucide-react';
import api from '../utils/api';

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/posts/neural?mode=video');
        setVideos(res.data.data);
      } catch (err) {
        console.error("VIDEO_SYNC_ERROR", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[10px] tracking-[0.5em] text-gray-700 animate-pulse uppercase">Syncing Visual Grid...</div>;

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

const VideoCard = ({ video }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // অটো-প্লে এবং অটো-পজ লজিক (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play();
          setPlaying(true);
        } else {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-screen w-full snap-start bg-black flex items-center justify-center border-b border-white/5">
      {/* Background Video */}
      <video
        ref={videoRef}
        src={video.mediaUrl}
        className="h-full w-full object-cover md:max-w-[450px] md:rounded-[2rem] md:my-4 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
        loop
        muted
        playsInline
        onClick={() => {
          if (playing) {
            videoRef.current.pause();
            setPlaying(false);
          } else {
            videoRef.current.play();
            setPlaying(true);
          }
        }}
      />

      {/* Right Side Actions (TikTok Style) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-20">
        <div className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-active:scale-90 transition-all cursor-pointer shadow-lg">
            <Heart size={24} className="text-white group-hover:text-red-500 transition-colors" fill={video.isLiked ? "currentColor" : "none"} />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase">{video.stats?.syncs || 0}</span>
        </div>

        <div className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer shadow-lg">
            <MessageCircle size={24} className="text-white" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase">42</span>
        </div>

        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer shadow-lg">
          <Share2 size={24} className="text-white" />
        </div>

        {/* User Avatar with Pulse Effect */}
        <div className="relative mt-2">
           <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-900">
              <div className="w-full h-full flex items-center justify-center font-black italic text-xs">
                {video.author?.firstName[0]}
              </div>
           </div>
           <div className="absolute -bottom-2 -right-2 bg-blue-500 p-1 rounded-full border-2 border-black">
              <Zap size={10} fill="white" />
           </div>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none md:max-w-[450px] md:left-1/2 md:-translate-x-1/2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-black italic uppercase tracking-tighter text-sm">
              {video.author?.firstName} {video.author?.lastName}
            </h3>
            <ShieldCheck size={14} className="text-blue-500" />
            <button className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest pointer-events-auto">Sync</button>
          </div>
          <p className="text-xs text-gray-300 line-clamp-2 max-w-[80%]">
            {video.content} <span className="text-blue-400 font-bold">#OnyxDrift #FutureAI</span>
          </p>
          <div className="flex items-center gap-2 overflow-hidden">
            <Music size={12} className="text-gray-400 animate-spin-slow" />
            <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-400 whitespace-nowrap">
              Original Audio - Neural Sync Protocol 0.1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;