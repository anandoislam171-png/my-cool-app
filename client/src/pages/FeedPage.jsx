import React, { useState } from 'react';
import { 
  LayoutGrid, Play, MessageSquare, BookOpen, 
  Search, Bell, User, PlusCircle, Flame 
} from 'lucide-react';

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('minimal');

  // মক ডেটা (আপনার ফিউচার API এর জন্য)
  const feedItems = [
    { id: 1, author: "Neural_Node_01", content: "The future of OnyxDrift is here. No typing, just flow.", type: "minimal" },
    { id: 2, author: "Cyber_Drifter", content: "Eye-tracking navigation feels like magic.", type: "motion" },
    { id: 3, author: "Admin_Alpha", content: "Welcome to the private neural network.", type: "knowledge" },
  ];

  const perspectives = [
    { id: 'minimal', icon: <LayoutGrid size={18} />, label: 'Minimal' },
    { id: 'motion', icon: <Play size={18} />, label: 'Motion' },
    { id: 'connect', icon: <MessageSquare size={18} />, label: 'Connect' },
    { id: 'archive', icon: <BookOpen size={18} />, label: 'Archive' },
  ];

  return (
    <div className="min-h-screen bg-[#010101] text-white font-sans">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">
          ONYX<span className="text-gray-600">DRIFT</span>
        </h1>
        
        <div className="flex items-center gap-6 opacity-60">
          <Search size={20} className="hover:text-white cursor-pointer transition-all" />
          <Bell size={20} className="hover:text-white cursor-pointer transition-all" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-transparent border border-white/10 flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32 max-w-[600px] mx-auto px-4">
        
        {/* Perspective Switcher */}
        <div className="flex justify-between items-center mb-10 bg-[#050505] p-2 rounded-[2rem] border border-white/5">
          {perspectives.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[1.5rem] transition-all duration-500 ${
                activeTab === p.id 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {p.icon}
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                {p.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Feed */}
        <div className="space-y-6">
          {feedItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-[#050505] border border-white/5 p-6 rounded-[2.5rem] hover:border-white/10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Flame size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest">{item.author}</h3>
                    <p className="text-[8px] text-gray-600 uppercase">2M AGO • {item.type}</p>
                  </div>
                </div>
                <button className="text-gray-700 hover:text-white transition-colors">
                  <PlusCircle size={20} />
                </button>
              </div>
              
              <p className="text-lg font-medium leading-relaxed tracking-tight text-gray-300">
                {item.content}
              </p>

              <div className="mt-6 pt-6 border-t border-white/5 flex gap-6 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                <span className="hover:text-white cursor-pointer">RESONATE</span>
                <span className="hover:text-white cursor-pointer">ECHO</span>
                <span className="hover:text-white cursor-pointer">DRIFT</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Interaction Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-[2.5rem] flex items-center gap-4 shadow-2xl active:scale-95 transition-all cursor-pointer group">
         <span className="text-xs font-black uppercase tracking-[0.2em]">Synchronize Thoughts</span>
         <PlusCircle size={20} className="group-rotate-90 transition-transform" />
      </div>

    </div>
  );
};

export default FeedPage;