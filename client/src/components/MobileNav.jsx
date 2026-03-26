import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Play, 
  Plus, 
  Users, 
  User, 
  X, 
  Video, 
  Type, 
  Image, 
  Radio 
} from 'lucide-react';

// নতুন মডিউল দুটি ইমপোর্ট করুন

import LiveStudio from '../modules/LiveStudio';

const MobileNavbar = () => {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [activeModule, setActiveModule] = useState(null); // 'text' অথবা 'live' ট্র্যাক করার জন্য

  const creationOptions = [
    { id: 'reels', label: 'Reels', icon: <Play size={22} />, color: 'text-pink-500', desc: 'Sync vertical' },
    { id: 'video', label: 'Video', icon: <Video size={22} />, color: 'text-blue-500', desc: 'Upload file' },
    { id: 'text', label: 'Neural Text', icon: <Type size={22} />, color: 'text-white', desc: 'Post thoughts' },
    { id: 'photo', label: 'Photo', icon: <Image size={22} />, color: 'text-green-500', desc: 'Visual node' },
    { id: 'live', label: 'Go Live', icon: <Radio size={22} />, color: 'text-red-500', desc: 'Real-time sync' },
  ];

  return (
    <>
      {/* --- ১. মূল মোবাইল ন্যাভবার --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-2xl border-t border-white/5 z-[100] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600'}`}>
            <Home size={22} strokeWidth={2} />
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">Neural</span>
          </NavLink>

          <NavLink to="/video" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600'}`}>
            <Play size={22} strokeWidth={2} />
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">Reels</span>
          </NavLink>

          {/* ম্যাজিক প্লাস বাটন */}
          <div className="relative -top-3">
            <button 
              onClick={() => setIsHubOpen(true)}
              className="bg-white text-black p-3 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-110 active:scale-90 transition-all duration-300"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          <NavLink to="/following" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600'}`}>
            <Users size={22} strokeWidth={2} />
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">Syncs</span>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600'}`}>
            <User size={22} strokeWidth={2} />
            <span className="text-[8px] font-black uppercase tracking-[0.1em]">Identity</span>
          </NavLink>
        </div>
      </div>

      {/* --- ২. ক্রিয়েশন হাব মডাল --- */}
      {isHubOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-24">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsHubOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-[#0A0A0A]/95 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic text-gray-500">Creative Engine</h2>
              <button onClick={() => setIsHubOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {creationOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setActiveModule(opt.id); // মডিউল সেট করবে
                    setIsHubOpen(false);    // হাব বন্ধ করবে
                  }}
                  className="flex items-center gap-5 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all group active:scale-[0.98]"
                >
                  <div className={`p-3 rounded-2xl bg-black border border-white/5 ${opt.color} group-hover:scale-110 transition-transform`}>
                    {opt.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest text-white">{opt.label}</p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center italic">
               <p className="text-[7px] text-gray-800 font-black uppercase tracking-[0.6em]">Onyx Neural Protocol</p>
            </div>
          </div>
        </div>
      )}

      {/* --- ৩. কন্টেন্ট এডিটর এবং লাইভ স্টুডিও ওভারলে --- */}
      {/* Neural Text Editor */}
      <NeuralEditor 
        isOpen={activeModule === 'text'} 
        onClose={() => setActiveModule(null)} 
      />

      {/* Live Studio Interface */}
      <LiveStudio 
        isOpen={activeModule === 'live'} 
        onClose={() => setActiveModule(null)} 
      />
      
      {/* Reels/Video/Photo এর জন্য আপনি পরে আলাদা মডিউল একই ভাবে যোগ করতে পারবেন */}
    </>
  );
};

export default MobileNavbar;