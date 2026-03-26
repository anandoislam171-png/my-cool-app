import React from 'react';

const FeedCard = ({ post }) => {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden mb-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
      {/* ১. হেডার: ইউজার ইনফো */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
            {post.user.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">{post.user}</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{post.time}</p>
          </div>
        </div>
        <button className="text-gray-600 hover:text-white transition-all">•••</button>
      </div>

      {/* ২. মেইন কন্টেন্ট (Image/Text) */}
      <div className="px-5 pb-4">
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>
        {post.image && (
          <div className="rounded-2xl overflow-hidden border border-white/5">
            <img 
              src={post.image} 
              alt="post" 
              className="w-full object-cover max-h-[400px] transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
        )}
      </div>

      {/* ৩. ইন্টারঅ্যাকশন বার (Micro-interactions) */}
      <div className="px-5 py-4 border-t border-white/5 flex items-center gap-6">
        <button className="flex items-center gap-2 group/btn">
          <span className="text-xl group-hover/btn:scale-125 transition-transform duration-200">🖤</span>
          <span className="text-xs text-gray-500 font-mono">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 group/btn text-gray-500 hover:text-white transition-all">
          <span className="text-xl group-hover/btn:rotate-12 transition-transform">💬</span>
          <span className="text-xs font-mono">{post.comments}</span>
        </button>
        <button className="ml-auto text-gray-500 hover:text-white transition-all">🚀</button>
      </div>
    </div>
  );
};

export default FeedCard;