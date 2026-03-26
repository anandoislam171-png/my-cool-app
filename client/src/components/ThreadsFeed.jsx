import React from 'react';
import { Heart, MessageCircle, Repeat, Send, MoreHorizontal, ShieldCheck } from 'lucide-react';

const ThreadsFeed = ({ posts }) => {
  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <div key={post._id} className="p-4 border-b border-white/5 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Left: Avatar & Line */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black italic text-xs overflow-hidden">
              {post.author?.firstName?.[0]}
            </div>
            <div className="w-[1.5px] flex-1 bg-white/5 my-2"></div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white italic">
                  {post.author?.firstName} {post.author?.lastName}
                </h4>
                <ShieldCheck size={12} className="text-blue-500" />
              </div>
              <MoreHorizontal size={14} className="text-gray-600" />
            </div>

            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              {post.content}
            </p>

            {/* Post Media if exists */}
            {post.mediaUrl && (
              <div className="rounded-2xl border border-white/5 overflow-hidden mt-2 max-h-[300px]">
                <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button className="text-gray-600 hover:text-white transition-all"><Heart size={18} /></button>
              <button className="text-gray-600 hover:text-white transition-all"><MessageCircle size={18} /></button>
              <button className="text-gray-600 hover:text-white transition-all"><Repeat size={18} /></button>
              <button className="text-gray-600 hover:text-white transition-all"><Send size={18} /></button>
            </div>

            {/* Stats */}
            <div className="flex gap-3 pt-1">
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{post.stats?.syncs || 0} Syncs</p>
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{post.stats?.pulses || 0} Pulses</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreadsFeed;