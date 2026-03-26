import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostCard = ({ user, content, image, time }) => {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  // Double Tap Gesture Logic
  const handleDoubleTap = () => {
    setLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div 
      onDoubleClick={handleDoubleTap}
      className="relative max-w-2xl mx-auto bg-black pt-8 pb-10 px-6 transition-all hover:bg-[#030303] group borderless-flow"
    >
      {/* ১. ৩ডি হার্ট অ্যানিমেশন (Double Tap Effect) */}
      <AnimatePresence>
        {showHeart && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <Heart size={80} fill="white" className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ২. হেডার: গ্রাডিয়েন্ট অ্যাকসেন্ট */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#333] p-[1.5px] rotate-45 group-hover:rotate-0 transition-transform duration-500">
             <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden -rotate-45 group-hover:rotate-0 transition-transform duration-500">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} alt="avatar" />
             </div>
          </div>
          <div>
            <h4 className="text-[17px] font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent group-hover:to-white transition-all cursor-pointer">
              {user}
            </h4>
            <p className="text-gray-600 text-[11px] uppercase tracking-[0.2em]">{time}</p>
          </div>
        </div>
        <MoreHorizontal className="text-gray-700 hover:text-white cursor-pointer transition-colors" size={18} />
      </div>

      {/* ৩. কন্টেন্ট: ইউনিক টাইপোগ্রাফি (Bold & Clean) */}
      <div className="mb-6 text-[18px] text-gray-200 font-medium leading-[1.6] tracking-tight">
        {content}
      </div>

      {/* ৪. ৩ডি ডেপথ ইমেজ */}
      {image && (
        <div className="relative rounded-3xl overflow-hidden mb-6 bg-[#0a0a0a] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transform transition-transform duration-700 hover:scale-[1.02] hover:-translate-y-2">
          <img src={image} alt="post" className="w-full object-cover max-h-[600px] opacity-90 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* ৫. মাইক্রো-গ্লাস মর্ফিজম অ্যাকশন বার */}
      <div className="inline-flex items-center gap-8 px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] shadow-xl">
        <button 
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 transition-all duration-300 ${liked ? 'text-rose-500' : 'text-gray-500 hover:text-white'}`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "scale-110" : ""} />
          <span className="text-[11px] font-bold font-mono">2.4K</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-all">
          <MessageCircle size={18} />
          <span className="text-[11px] font-bold font-mono">180</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-500 hover:text-emerald-400 transition-all">
          <Share2 size={18} />
        </button>
        
        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
        
        <button className="text-gray-500 hover:text-white transition-all">
          <Bookmark size={18} />
        </button>
      </div>

      {/* Borderless Flow Separator (খুবই সূক্ষ্ম) */}
      <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
};

export default PostCard;