import React from 'react';
import PostCard from '../components/PostCard';

const MinimalHome = () => {
  const feedData = [
    {
      id: 1,
      user: "Naimus Shakib",
      time: "Just Now",
      content: "OnyxDrift is not just a social network. It's an extension of your neural identity. Borderless, fast, and adaptive. 🌑",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
    },
    {
      id: 2,
      user: "Minimalist Hub",
      time: "4h ago",
      content: "Typography is the voice of design. When you remove the boxes, the message speaks louder. Pure black, pure focus.",
      image: null
    }
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Glassmorphism Navigation */}
      <nav className="sticky top-0 z-[100] backdrop-blur-2xl bg-black/60 border-b border-white/[0.05] px-8 py-5 flex justify-between items-center">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Perspective: Minimal</h2>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
      </nav>

      {/* Feed Area */}
      <div className="pb-32">
        {feedData.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
        
        {/* Infinite Scroll Loader (Skeleton Concept) */}
        <div className="py-20 flex flex-col items-center justify-center opacity-20">
          <div className="w-1 h-12 bg-gradient-to-b from-white to-transparent animate-bounce"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] mt-4">Streaming Neural Feed</p>
        </div>
      </div>
    </div>
  );
};

export default MinimalHome;