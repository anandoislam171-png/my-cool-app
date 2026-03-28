import React, { Suspense, lazy, useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// UI Components
import Sidebar from "./components/Sidebar";
import CustomCursor from "./components/CustomCursor";
import MobileNav from "./components/MobileNav";

// Lazy-loaded Pages
const Messenger = lazy(() => import("./pages/Messenger"));
const PremiumHomeFeed = lazy(() => import("./pages/PremiumHomeFeed"));
const ProfilePage = lazy(() => import("./pages/Profile.jsx"));
const Settings = lazy(() => import("./pages/Settings")); 
const ReelsFeed = lazy(() => import("./pages/ReelsFeed"));
const Landing = lazy(() => import("./pages/Landing"));
const JoinPage = lazy(() => import("./pages/JoinPage"));
const CallPage = lazy(() => import("./pages/CallPage"));

// Temporary Neural Components
const Analytics = () => <div className="p-10 text-cyan-500 font-mono uppercase tracking-widest animate-pulse">Neural_Analytics_v1.0</div>;
const Explore = () => <div className="p-10 text-cyan-500 font-mono uppercase tracking-widest animate-pulse">Scanning_Global_Grid...</div>;
const CreatePost = () => <div className="p-10 text-cyan-500 font-mono uppercase tracking-widest animate-pulse">Initializing_Neural_Synthesizer...</div>;

/**
 * 🔐 প্রোটেক্টড রুট গার্ড
 * replace: true ব্যবহার করা হয়েছে যাতে ব্যাক বাটনে লুপ না হয়।
 */
const Protected = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return null; 
  
  return user 
    ? children 
    : <Navigate to="/" state={{ from: location }} replace />;
};

/**
 * মেইন কন্টেন্ট কম্পোনেন্ট
 */
function AppContent() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  // ১. গ্লোবাল বুটিং স্ক্রিন (Neural Loading)
  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 text-cyan-500 font-mono tracking-[0.5em] uppercase">
        <div className="relative">
           <div className="w-16 h-16 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
           </div>
        </div>
        <span className="text-[10px] animate-pulse">Booting_Neural_Interface...</span>
      </div>
    );
  }

  // ২. নেভিগেশন দেখানোর শর্ত (Landing এবং Join পেজে সাইডবার থাকবে না)
  const isFullWidthPage = ["/", "/join"].includes(location.pathname);
  const showNav = !isFullWidthPage && user;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: { 
            background: '#0a0a0a', 
            color: '#06b6d4', 
            border: '1px solid rgba(6,182,212,0.2)',
            fontFamily: 'monospace',
            fontSize: '12px'
          }
        }} 
      />
      
      <CustomCursor />

      <div className="flex w-full min-h-screen relative">
        
        {/* ডেস্কটপ সাইডবার */}
        {showNav && (
          <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-40 bg-[#020617]/90 backdrop-blur-xl border-r border-cyan-900/10 shadow-[20px_0_50px_rgba(0,0,0,0.8)]">
            <Sidebar />
          </aside>
        )}

        {/* মোবাইল নেভিগেশন */}
        {showNav && <MobileNav />}

        {/* মেইন কন্টেন্ট এরিয়া */}
        <main className={`flex-1 min-h-screen transition-all duration-700 ease-in-out ${showNav ? 'md:pl-64 pb-20 md:pb-0' : ''} relative z-10`}>
          <Suspense fallback={
            <div className="h-full w-full min-h-[80vh] flex flex-col items-center justify-center text-cyan-500/40 animate-pulse font-mono tracking-widest uppercase gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <span className="text-[9px]">Syncing_Neural_Link...</span>
            </div>
          }>
            <Routes>
              {/* ৩. পাবলিক রুটস (লগইন থাকলে অটো ফিডে পাঠাবে) */}
              <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Landing />} />
              <Route path="/join" element={user ? <Navigate to="/feed" replace /> : <JoinPage />} />
              
              {/* ৪. প্রোটেক্টড রুটস */}
              <Route path="/feed" element={<Protected><PremiumHomeFeed /></Protected>} />
              <Route path="/reels" element={<Protected><ReelsFeed /></Protected>} />
              <Route path="/following" element={<Protected><PremiumHomeFeed filter="following" /></Protected>} />
              <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
              <Route path="/messages" element={<Protected><Messenger /></Protected>} />
              <Route path="/explorer" element={<Protected><Explore /></Protected>} />
              <Route path="/create" element={<Protected><CreatePost /></Protected>} />
              <Route path="/profile/:username" element={<Protected><ProfilePage /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/call/:roomId" element={<Protected><CallPage /></Protected>} />
              
              {/* ৫. ফালব্যাক (Catch-all) রুট */}
              <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* ব্র্যান্ডিং ডেকোরেশন (Neural Glow) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-[radial-gradient(circle_at_50%_-20%,_#06b6d4_0%,_transparent_60%)] z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.03] bg-cyan-500 blur-[120px] rounded-full z-0" />
    </div>
  );
}

/**
 * রুট অ্যাপ কম্পোনেন্ট
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}