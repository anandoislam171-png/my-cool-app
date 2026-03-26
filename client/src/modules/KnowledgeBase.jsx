import React, { useState } from 'react';

const KnowledgeBase = () => {
  // ডামি ডাটা (পরবর্তীতে API থেকে আসবে)
  const [topics] = useState([
    {
      id: 1,
      author: 'naimus_dev',
      title: 'The Future of Adaptive UI in Social Media',
      content: 'Imagine an app that changes its shape based on your mental state. If you are tired, it simplifies; if you are curious, it expands...',
      category: 'Tech Philosophy',
      votes: 1205,
      comments: 84
    },
    {
      id: 2,
      author: 'ai_researcher',
      title: 'Why Typing is an Outdated Input Method',
      content: 'Neural links and voice gestures are the next step. Typing limits the speed of human thought to finger movement.',
      category: 'Innovation',
      votes: 890,
      comments: 42
    }
  ]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* ১. টপিক ফিল্টার (Minimalist Pill Style) */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
        {['All Topics', 'Technology', 'Design', 'AI', 'Economy'].map((tag) => (
          <button key={tag} className="whitespace-nowrap text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-all">
            {tag}
          </button>
        ))}
      </div>

      {/* ২. ডিসকাশন ফিড */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-gray-900 border border-white/10"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{topic.author}</span>
              <span className="text-gray-800">•</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{topic.category}</span>
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-3 group-hover:text-blue-400 transition-colors">
              {topic.title}
            </h2>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {topic.content}
            </p>

            {/* ৩. ইন্টারঅ্যাকশন বার */}
            <div className="flex items-center gap-6 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-white transition-all">▲</button>
                <span className="text-xs font-mono text-gray-400">{topic.votes}</span>
                <button className="text-gray-600 hover:text-white transition-all">▼</button>
              </div>
              
              <button className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2">
                💬 {topic.comments} Discussions
              </button>

              <button className="ml-auto text-gray-600 hover:text-white">
                🚀
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;