import React from 'react';
import { X, Users, Heart, Share2, Shield, Mic, Zap } from 'lucide-react';

const LiveStudio = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black">
      {/* Mock Camera Feed (Real implementation will use getUserMedia) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black overflow-hidden">
        <div className="w-full h-full bg-gray-900 flex items-center justify-center italic text-gray-800 font-black text-4xl uppercase tracking-[1em]">
           Live_Feed
        </div>
      </div>

      {/* Interface Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        
        {/* Upper Controls */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center">
            <div className="bg-red-600 px-3 py-1 rounded-lg flex items-center gap-2 animate-pulse">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               <span className="text-[10px] font-black uppercase text-white tracking-widest">Live</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[10px] font-black flex items-center gap-1">
              <Users size={12}/> 1.2K
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white"><X size={24}/></button>
        </div>

        {/* Bottom Section: Comments & Actions */}
        <div className="space-y-6">
          {/* Virtual Comments */}
          <div className="space-y-3 h-48 overflow-y-hidden mask-fade-top flex flex-col justify-end">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-2 rounded-xl w-fit">
               <div className="w-6 h-6 rounded-full bg-blue-500"></div>
               <p className="text-[10px] text-white"><span className="font-black italic mr-2 uppercase">Neural_User:</span> This UI is insane! 🔥</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-2 rounded-xl w-fit">
               <div className="w-6 h-6 rounded-full bg-gray-600"></div>
               <p className="text-[10px] text-white"><span className="font-black italic mr-2 uppercase">Onyx_Agent:</span> Sync protocol stable.</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center justify-between">
               <input type="text" placeholder="SEND A NEURAL PULSE..." className="bg-transparent border-none text-[10px] font-black text-white w-full placeholder-white/20 uppercase italic focus:ring-0"/>
               <Zap size={18} className="text-yellow-400" />
            </div>
            <button className="p-4 bg-white rounded-full text-black hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"><Heart size={24} fill="black"/></button>
            <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/10"><Share2 size={24}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStudio;