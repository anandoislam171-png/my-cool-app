import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Image, X, Send, Paperclip } from 'lucide-react';

const PostCreator = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/posts/create', { 
        content,
        contentType: 'text' // পরে ইমেজ সাপোর্ট যোগ করা যাবে
      });
      setContent('');
      setIsExpanded(false);
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      console.error("NEURAL_POST_FAILED:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto mb-6 px-4 md:px-0">
      <div className={`bg-[#050505] border border-white/5 rounded-[1.5rem] transition-all duration-500 ${isExpanded ? 'p-6 shadow-2xl' : 'p-4'}`}>
        
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('')}
          </div>

          <div className="flex-1">
            {/* Input Area */}
            <textarea
              placeholder="Start a thread..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm md:text-base text-gray-300 placeholder:text-gray-700 resize-none py-2 min-h-[40px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              rows={isExpanded ? 4 : 1}
            />

            {isExpanded && (
              <div className="flex items-center justify-between mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-4 text-gray-600">
                  <button className="hover:text-white transition-colors"><Image size={18} /></button>
                  <button className="hover:text-white transition-colors"><Paperclip size={18} /></button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={loading || !content.trim()}
                    className={`px-5 py-2 rounded-full font-black text-[11px] uppercase tracking-tighter transition-all flex items-center gap-2 ${
                      content.trim() ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/5 text-gray-700'
                    }`}
                  >
                    {loading ? 'Syncing...' : 'Post'}
                    <Send size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;