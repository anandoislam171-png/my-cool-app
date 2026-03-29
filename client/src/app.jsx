import React, { Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// UI Components
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
import ReelsEditor from "./pages/ReelsEditor"; // ইমপোর্ট করা হয়েছে

/**
 * 🔐 প্রোটেক্টড রুট গার্ড
 */
const Protected = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return null; 
  
  return user 
    ? children 
    : <Navigate to="/" state={{ from: location }} replace />;
};

function AppContent() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  // ইনিশিয়াল লোডিং স্টেট
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

  const isAuthPage = ["/", "/join"].includes(location.pathname);
  const showNav = user && !isAuthPage;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden relative font-sans">
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

      {/* ব্র্যান্ডিং গ্লো ডেকোরেশন */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,_#06b6d4_0%,_transparent_60%)] z-0" />

      <div className="flex w-full min-h-screen relative">
        {showNav && (
          <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-[100] bg-black/40 backdrop-blur-3xl border-r border-white/5">
            <Sidebar />
          </aside>
        )}

        <main className={`flex-1 min-h-screen relative z-10 transition-all duration-500 ${showNav ? 'md:pl-64' : ''}`}>
          <Suspense fallback={
            <div className="h-full w-full min-h-[80vh] flex flex-col items-center justify-center text-cyan-500/40 animate-pulse font-mono tracking-[0.4em] uppercase gap-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <span className="text-[9px]">Syncing_Neural_Link...</span>
            </div>
          }>
            <div className="w-full h-full">
              <Routes>
                {/* ১. পাবলিক রুটস */}
                <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Landing />} />
                <Route path="/join" element={user ? <Navigate to="/feed" replace /> : <JoinPage />} />
                
                {/* ২. প্রোটেক্টড রুটস */}
                <Route path="/feed" element={<Protected><PremiumHomeFeed /></Protected>} />
                <Route path="/reels" element={<Protected><ReelsFeed /></Protected>} />
                
                {/* রিলস এডিটর রাউট (id সহ এবং id ছাড়া) */}
                <Route path="/reels-editor" element={<Protected><ReelsEditor /></Protected>} />
                <Route path="/reels-editor/:id" element={<Protected><ReelsEditor /></Protected>} />
                
                <Route path="/following" element={<Protected><FollowingPage /></Protected>} />
                <Route path="/profile/:id" element={<Protected><ProfilePage /></Protected>} />
                <Route path="/messages" element={<Protected><Messenger /></Protected>} />
                <Route path="/settings" element={<Protected><Settings /></Protected>} />
                <Route path="/call/:roomId" element={<Protected><CallPage /></Protected>} />
                
                {/* ৩. ফালব্যাক রুট */}
                <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
              </Routes>
            </div>
          </Suspense>

          {/* মোবাইল নেভিগেশন */}
          {showNav && (
            <div className="md:hidden fixed bottom-0 left-0 w-full z-[1000]">
               <MobileNav />
            </div>
          )}
        </main>
      </div>

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