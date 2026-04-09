import React, { Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// UI Components (আপনার বিদ্যমান পাথ অনুযায়ী)
import Sidebar from "./components/Sidebar";
import CustomCursor from "./components/CustomCursor";
import MobileNav from "./components/MobileNav";

// Pages
import PremiumHomeFeed from "./pages/PremiumHomeFeed";
import Messenger from "./pages/Messenger";
import ProfilePage from "./pages/Profile.jsx";
import Settings from "./pages/Settings";
import ReelsFeed from "./pages/ReelsFeed";
import Landing from "./pages/Landing";
import JoinPage from "./pages/JoinPage";
import CallPage from "./pages/CallPage";
import FollowingPage from "./pages/FollowingPage"; 
import ReelsEditor from "./pages/ReelsEditor";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/**
 * 🔐 প্রোটেক্টড রুট গার্ড (Neural Access Guard)
 */
const Protected = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // অথ চেক করার সময় কিছুই রেন্ডার হবে না
  if (loading) return null; 
  
  // ইউজার থাকলে চিলড্রেন দেখাবে, না থাকলে ল্যান্ডিং পেজে পাঠিয়ে দিবে
  return user 
    ? children 
    : <Navigate to="/" state={{ from: location }} replace />;
};

function AppContent() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  // ১. গ্লোবাল লোডিং স্টেট (যখন অ্যাপ ইউজারের সেশন চেক করছে)
  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 text-cyan-500 font-mono tracking-[0.5em] uppercase">
        <div className="relative">
           <div className="w-20 h-20 border-2 border-cyan-500/5 border-t-cyan-500 rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping shadow-[0_0_15px_#06b6d4]" />
           </div>
        </div>
        <span className="text-[10px] font-black animate-pulse">Initializing_Neural_Network...</span>
      </div>
    );
  }

  // ২. নেভিগেশন কন্ট্রোল: কোন পেজগুলোতে সাইডবার/মোবাইল ন্যাভ দেখাবে না
  const authRoutes = ["/", "/join", "/forgot-password"];
  const isAuthPage = authRoutes.includes(location.pathname) || location.pathname.startsWith("/reset-password/");
  
  // ইউজার লগইন থাকলে এবং অথেন্টিকশন পেজে না থাকলে ন্যাভ দেখাবে
  const showNav = user && !isAuthPage;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden relative font-sans">
      
      {/* গ্লোবাল টোস্টার (Neural Style) */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000, 
          style: { 
            background: '#0a0a0a', 
            color: '#06b6d4', 
            border: '1px solid rgba(6,182,212,0.1)', 
            fontFamily: 'monospace', 
            fontSize: '11px', 
            borderRadius: '12px' 
          } 
        }} 
      />
      
      <CustomCursor />

      {/* ব্র্যান্ডিং গ্লো এফেক্ট (সব পেজের ব্যাকগ্রাউন্ডে থাকবে) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,_#06b6d4_0%,_transparent_60%)] z-0" />

      <div className="flex w-full min-h-screen relative">
        
        {/* ডেস্কটপ সাইডবার */}
        {showNav && (
          <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-[100] bg-black/40 backdrop-blur-3xl border-r border-white/5">
            <Sidebar />
          </aside>
        )}

        {/* মেইন কন্টেন্ট এরিয়া */}
        <main className={`flex-1 min-h-screen relative z-10 transition-all duration-500 ${showNav ? 'md:pl-64' : ''}`}>
          <Suspense fallback={
            <div className="h-full w-full min-h-[80vh] flex flex-col items-center justify-center text-cyan-500/40 animate-pulse font-mono tracking-[0.4em] uppercase gap-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <span className="text-[9px]">Syncing_Neural_Link...</span>
            </div>
          }>
            <div className="w-full h-full pb-20 md:pb-0"> {/* মোবাইল ন্যাভ এর জন্য নিচে স্পেস */}
              <Routes>
                {/* ৩. পাবলিক রুটস (লগইন থাকলে ফিডে পাঠিয়ে দিবে) */}
                <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Landing />} />
                <Route path="/join" element={user ? <Navigate to="/feed" replace /> : <JoinPage />} />
                <Route path="/forgot-password" element={user ? <Navigate to="/feed" replace /> : <ForgotPassword />} />
                <Route path="/reset-password/:token" element={user ? <Navigate to="/feed" replace /> : <ResetPassword />} />
                
                {/* ৪. প্রোটেক্টড রুটস (লগইন ছাড়া এক্সেস করা যাবে না) */}
                <Route path="/feed" element={<Protected><PremiumHomeFeed /></Protected>} />
                <Route path="/reels" element={<Protected><ReelsFeed /></Protected>} />
                <Route path="/reels-editor" element={<Protected><ReelsEditor /></Protected>} />
                <Route path="/reels-editor/:id" element={<Protected><ReelsEditor /></Protected>} />
                <Route path="/following" element={<Protected><FollowingPage /></Protected>} />
                <Route path="/profile/:id" element={<Protected><ProfilePage /></Protected>} />
                <Route path="/messages" element={<Protected><Messenger /></Protected>} />
                <Route path="/settings" element={<Protected><Settings /></Protected>} />
                <Route path="/call/:roomId" element={<Protected><CallPage /></Protected>} />
                
                {/* ফালব্যাক (ভুল লিংকে ঢুকলে অটোমেটিক সঠিক জায়গায় নিয়ে যাবে) */}
                <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
              </Routes>
            </div>
          </Suspense>

          {/* মোবাইল নেভিগেশন (শুধুমাত্র মোবাইলে এবং লগইন অবস্থায় দেখাবে) */}
          {showNav && (
            <div className="md:hidden fixed bottom-0 left-0 w-full z-[1000]">
                <MobileNav />
            </div>
          )}
        </main>
      </div>

      {/* অতিরিক্ত ডেকোরেশন গ্লো */}
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] pointer-events-none opacity-[0.05] bg-cyan-500 blur-[150px] rounded-full z-0" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}