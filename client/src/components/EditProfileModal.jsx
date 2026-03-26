import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, onUpdate }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || 'Global Node',
    website: user?.website || 'onyx-drift.com'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      setUser(res.data.user); // AuthContext আপডেট করা
      onUpdate(); // প্রোফাইল পেজ রিফ্রেশ করা
      onClose();
    } catch (err) {
      console.error("IDENTITY_SYNC_FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/10 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black w-full max-w-[600px] h-full md:h-auto md:max-h-[90vh] rounded-[2rem] border border-white/10 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <X size={20} />
            </button>
            <h2 className="text-lg font-black uppercase tracking-tighter italic">Edit Profile</h2>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-black px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Banner Edit Placeholder */}
          <div className="h-32 bg-gray-900 relative flex items-center justify-center border-b border-white/5">
             <div className="p-3 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 transition-all text-white">
                <Camera size={20} />
             </div>
          </div>

          {/* Profile Pic Edit Placeholder */}
          <div className="px-4 -mt-12 relative inline-block">
             <div className="w-24 h-24 rounded-full bg-black p-1">
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center border-4 border-black relative">
                   <div className="p-2 bg-black/40 rounded-full cursor-pointer hover:bg-black/60 transition-all text-white">
                      <Camera size={16} />
                   </div>
                </div>
             </div>
          </div>

          {/* Input Fields (X-Style Floating Labels) */}
          <div className="p-6 space-y-6">
            <div className="relative group border border-white/10 rounded-xl p-3 focus-within:border-white transition-all">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-white">First Name</label>
               <input 
                 type="text" 
                 className="w-full bg-transparent border-none focus:ring-0 text-white p-0 text-sm mt-1"
                 value={formData.firstName}
                 onChange={(e) => setFormData({...formData, firstName: e.target.value})}
               />
            </div>

            <div className="relative group border border-white/10 rounded-xl p-3 focus-within:border-white transition-all">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-white">Last Name</label>
               <input 
                 type="text" 
                 className="w-full bg-transparent border-none focus:ring-0 text-white p-0 text-sm mt-1"
                 value={formData.lastName}
                 onChange={(e) => setFormData({...formData, lastName: e.target.value})}
               />
            </div>

            <div className="relative group border border-white/10 rounded-xl p-3 focus-within:border-white transition-all">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-white">Bio</label>
               <textarea 
                 className="w-full bg-transparent border-none focus:ring-0 text-white p-0 text-sm mt-1 resize-none"
                 rows={3}
                 value={formData.bio}
                 onChange={(e) => setFormData({...formData, bio: e.target.value})}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;