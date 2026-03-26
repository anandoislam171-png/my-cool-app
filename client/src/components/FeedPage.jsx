import React, { useState, useEffect } from 'react';
import ThreadsFeed from '../components/ThreadsFeed';
import PostCreator from '../components/PostCreator';
import { useAuth } from '../context/AuthContext';
import { Home, Search, PlusSquare, Bell, User, Settings, Zap } from 'lucide-react';

const FeedPage = () => {
  const { user, logout } = useAuth();
  const [feedKey, setFeedKey] = useState(0); // নতুন পোস্ট হলে ফিড রিফ্রেশ করার জন্য

  // নতুন পোস্ট ক্রিয়েট হলে ফিডকে রিলোড করার ট্রিগার
  const handlePostCreated = () => {
    setFeedKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* 1. Desktop Sidebar (Left) - শুধুমাত্র ল্যাপটপে দেখাবে */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-[280px] border-r border-white/5 flex-col p-8 justify-between">
        <div className="space-y-10">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            ONYX<span className="text-gray-700">DRIFT</span>
          </h1>
          
          <div className="space-y-6">
            <NavItem icon={<Home size={22} />} label="Neural Feed" active />
            <NavItem icon={<Search size={22} />} label="Search Node" />
            <NavItem icon={<Bell size={22} />} label="Signals" />
            <NavItem icon={<Zap size={22} />} label="Active Sync" />
            <NavItem icon={<User size={22} />} label="Identity" />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate uppercase">{user?.name}</p>
              <p className="text-[8px] text-gray-600 tracking-widest uppercase">{user?.mode} Mode</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full py-3 rounded-xl bg-white/5 text-[9px] uppercase tracking-widest font-bold hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            Disconnect Session
          </button>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className="md:ml-[280px] min-h-screen pb-24 md:pb-10">
        <div className="max-w-[600px] mx-auto pt-6 md:pt-10">
          
          {/* Post Creator Section */}
          <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl md:relative md:bg-transparent">
            <PostCreator onPostCreated={handlePostCreated} />
          </div>

          {/* Neural Feed Section */}
          <ThreadsFeed key={feedKey} />
        </div>
      </main>

      {/* 3. Mobile Bottom Navigation - শুধুমাত্র মোবাইলে দেখাবে */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-between items-center z-50">
        <Home size={22} className="text-white" />
        <Search size={22} className="text-gray-600" />
        <PlusSquare size={26} className="text-white" />
        <Bell size={22} className="text-gray-600" />
        <User size={22} className="text-gray-600" />
      </div>

    </div>
  );
};

// Sidebar Item Component
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-4 cursor-pointer transition-all group ${active ? 'text-white' : 'text-gray-600 hover:text-white'}`}>
    <div className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
      {icon}
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

export default FeedPage;