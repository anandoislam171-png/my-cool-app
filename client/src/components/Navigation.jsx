import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Zap, 
  PlusSquare,
  Shield
} from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Neural Feed', icon: <Home size={24} />, path: '/' },
    { id: 'search', label: 'Search Node', icon: <Search size={24} />, path: '/search' },
    { id: 'signals', label: 'Signals', icon: <Bell size={24} />, path: '/notifications' },
    { id: 'sync', label: 'Active Sync', icon: <Zap size={24} />, path: '/sync' },
    { id: 'profile', label: 'Identity', icon: <User size={24} />, path: '/profile' },
  ];

  return (
    <>
      {/* --- ১. ডেক্সটপ সাইডবার (Laptop/Desktop Only) --- */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-[280px] border-r border-white/5 flex-col p-6 justify-between bg-black">
        <div className="space-y-8">
          {/* Logo */}
          <div className="px-3">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
              ONYX<span className="text-gray-700">DRIFT</span>
            </h1>
          </div>
          
          {/* Nav Links */}
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                  ${isActive ? 'bg-white/5 text-white' : 'text-gray-600 hover:text-white hover:bg-white/[0.02]'}
                `}
              >
                <div className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* New Thread Button (Desktop) */}
          <button className="w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            New Thread
          </button>
        </div>

        {/* User Profile & Logout (Bottom) */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-transparent border border-white/10 flex items-center justify-center text-xs font-bold italic">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black truncate uppercase text-white">{user?.firstName} {user?.lastName}</p>
              <div className="flex items-center gap-1">
                <Shield size={8} className="text-blue-500" />
                <p className="text-[7px] text-gray-600 tracking-widest uppercase italic">{user?.mode || 'Minimal'} Mode</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-500/5 transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <LogOut size={14} /> Disconnect
          </button>
        </div>
      </nav>

      {/* --- ২. মোবাইল বটম ন্যাভবার (Mobile Only) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-[100]">
        {navItems.map((item) => (
          <NavLink 
            key={item.id} 
            to={item.path}
            className={({ isActive }) => isActive ? 'text-white scale-110' : 'text-gray-600'}
          >
            {item.icon}
          </NavLink>
        ))}
        {/* Mobile Create Button */}
        <button className="text-white bg-white/10 p-2 rounded-lg">
          <PlusSquare size={24} />
        </button>
      </div>
    </>
  );
};

export default Navigation;