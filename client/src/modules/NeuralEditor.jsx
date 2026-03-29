import React, { useState, useEffect } from 'react';
import { X, Send, Mic, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NeuralEditor = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // এস্কেপ কী চাপলে বন্ধ হবে
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!content.trim()) return;
    setIsPublishing(true);
    
    // এখানে আপনার API কল হবে (e.g., api.post('/posts', { content }))
    setTimeout(() => {
      console.log("Published to OnyxDrift:", content);
      setIsPublishing(false);
      setContent('');
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-[200] bg-[#050505] flex flex-col"
      >
        {/* হেডার */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">
              Neural_Editor_v1
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* টেক্সট এরিয়া */}
        <div className="flex-1 flex flex-col p-8 relative">
          <textarea 
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent text-white text-3xl md:text-5xl font-light outline-none resize-none h-full placeholder:text-zinc-800 tracking-tight leading-tight" 
            placeholder="What's on your neural network?..."
          />
          
          {/* ক্যারেক্টার কাউন্ট বা স্ট্যাটাস */}
          <div className="absolute bottom-10 left-8">
            <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
              Status: {content.length > 0 ? 'Ready_for_Sync' : 'Awaiting_Input'}
            </p>
          </div>
        </div>

        {/* বটম অ্যাকশন বার */}
        <div className="p-6 bg-black/50 backdrop-blur-xl border-t border-white/5 flex justify-between items-center">
          <div className="flex gap-4">
            <button className="p-4 rounded-2xl bg-white/5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all group">
              <Mic size={22} className="group-active:scale-90" />
            </button>
            <button className="p-4 rounded-2xl bg-white/5 text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
              <Sparkles size={22} />
            </button>
          </div>

          <button 
            onClick={handlePublish}
            disabled={!content.trim() || isPublishing}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] italic transition-all
              ${content.trim() 
                ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}
            `}
          >
            {isPublishing ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Sync_Now</span>
                <Send size={14} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NeuralEditor;