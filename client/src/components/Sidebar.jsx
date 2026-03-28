import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome, FaEnvelope, FaCompass, FaCog, FaSignOutAlt, 
  FaUserPlus, FaFire
} from 'react-icons/fa'; 
import { HiOutlineChartBar } from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Feed', icon: <FaHome />, path: '/feed' },
    { name: 'For You', icon: <FaFire />, path: '/reels' },
    { name: 'Following', icon: <FaUserPlus />, path: '/following' }, 
    { name: 'Analytics', icon: <HiOutlineChartBar />, path: '/analytics' },
    { name: 'Messages', icon: <FaEnvelope />, path: '/messages' },
    { name: 'Explore', icon: <FaCompass />, path: '/explorer' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  return (
    <div className="flex flex-col h-full py-6 justify-between bg-black/50 backdrop-blur-xl border-r border-cyan-900/10 relative overflow-hidden">
      
      <div className="space-y-1">
        {/* ব্র্যান্ডিং সেকশন */}
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">
            Onyx_Drift
          </p>
        </div>
        
        {/* মেনু আইটেম সমূহ */}
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group
              ${isActive ? 'text-cyan-400' : 'text-zinc-600 hover:text-zinc-200'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-full bg-cyan-500 shadow-[2px_0_15px_#06b6d4]" />
                )}
                <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[12px] font-black uppercase tracking-wider italic">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* লগআউট সেকশন */}
      <div className="px-4 mt-auto">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-6 py-4 text-zinc-600 hover:text-rose-500 transition-colors uppercase italic font-bold text-[11px] group"
        >
          <FaSignOutAlt size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Disconnect_Node</span>
        </button>
      </div>

      {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
};

export default Sidebar;