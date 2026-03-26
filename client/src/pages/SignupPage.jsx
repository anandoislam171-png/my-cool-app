import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, ShieldCheck, LayoutGrid, Play, 
  MessageSquare, BookOpen, ChevronRight, Globe 
} from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    activeMode: 'minimal'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const modes = [
    { id: 'minimal', icon: <LayoutGrid size={16} />, label: 'Minimal' },
    { id: 'video', icon: <Play size={16} />, label: 'Motion' },
    { id: 'chat', icon: <MessageSquare size={16} />, label: 'Connect' },
    { id: 'knowledge', icon: <BookOpen size={16} />, label: 'Archive' },
  ];

  const handleModeSelect = (mode) => {
    setFormData({ ...formData, activeMode: mode });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ১. পাসওয়ার্ড ভ্যালিডেশন
    if (formData.password !== formData.confirmPassword) {
      return setError("ACCESS KEYS DO NOT MATCH");
    }

    // ২. রিকোয়েস্ট পাঠানো
    setIsLoading(true);
    try {
      await signup(formData);
      navigate('/'); 
    } catch (err) {
      // ব্যাকএন্ড থেকে আসা মেসেজ দেখানো
      setError(err || 'INITIALIZATION FAILED. TRY AGAIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#010101] text-white p-4 font-sans overflow-x-hidden relative">
      
      {/* Background Glows (Neural Ambiance) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[500px] relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 mb-4 shadow-inner">
            <UserPlus size={32} strokeWidth={1} className="text-white/90" />
          </div>
          <h2 className="text-3xl font-black tracking-[-0.05em] uppercase italic">
            INITIALIZE <span className="text-gray-700">NODE</span>
          </h2>
          <p className="text-[10px] text-gray-500 tracking-[0.4em] mt-2 uppercase">Establish your neural presence</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#050505]/80 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl border-t-white/10">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-[10px] tracking-widest text-red-500 bg-red-500/5 border border-red-500/10 py-3 rounded-xl text-center animate-pulse uppercase font-bold">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="FIRST NAME"
                className="w-full bg-black border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-[11px] tracking-widest placeholder:text-gray-800 uppercase text-white"
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="LAST NAME"
                className="w-full bg-black border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-[11px] tracking-widest placeholder:text-gray-800 uppercase text-white"
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>

            {/* Email Field */}
            <input
              type="email"
              placeholder="IDENTITY@ONYXDRIFT.NET"
              className="w-full bg-black border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-[11px] tracking-widest placeholder:text-gray-800 uppercase text-white"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />

            {/* Access Key Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="ACCESS KEY"
                className="w-full bg-black border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-[11px] tracking-widest placeholder:text-gray-800 uppercase text-white"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="RE-ENTER KEY"
                className="w-full bg-black border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-white/20 transition-all text-[11px] tracking-widest placeholder:text-gray-800 uppercase text-white"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            {/* Perspective Selection (OnyxDrift Special) */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[8px] uppercase tracking-[0.3em] text-gray-600 font-bold">Neural Perspective</span>
                <span className="text-[8px] text-white/40 uppercase font-mono italic">
                  0{modes.findIndex(m => m.id === formData.activeMode) + 1} / 04
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeSelect(mode.id)}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all duration-500 gap-1.5 ${
                      formData.activeMode === mode.id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-black text-gray-700 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {mode.icon}
                    <span className="text-[7px] font-black uppercase tracking-tighter">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.05)] mt-4 disabled:opacity-50"
            >
              <span className="text-xs tracking-[0.2em] uppercase">
                {isLoading ? 'Processing...' : 'Connect Identity'}
              </span>
              {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-8 text-center">
            <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">
              ALREADY VERIFIED? <Link to="/login" className="text-white hover:text-gray-400 ml-1 transition-all">SIGN IN</Link>
            </p>
          </div>
        </div>

        {/* System Footer Information */}
        <div className="mt-8 flex items-center justify-between px-6 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[7px] tracking-[0.4em] uppercase">Protocol Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} />
            <span className="text-[7px] tracking-[0.4em] uppercase">Global Node v2.6</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;