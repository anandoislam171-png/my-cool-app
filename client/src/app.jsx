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

const Analytics = () => <div className="p-10 text-cyan-500 font-mono uppercase tracking-widest">Neural_Analytics_v1.0</div>;
const Explore = () => <div className="p-10 text-cyan-500 font-mono uppercase tracking-widest">Scanning_Global_Grid...</div>;
const CreatePost = () => <div className="p-10 text-cyan-500 font-mono uppercase tracking-widest">Initializing_Neural_Synthesizer...</div>;

// 🔐 প্রোটেক্টড রুট গার্ড
const Protected = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/" replace />;
};

/**
 * মেইন কন্টেন্ট কম্পোনেন্ট (এটি রাউটারের ভেতরে থাকবে)
 */
function AppContent() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-4 text-cyan-500 font-mono tracking-[0.5em] uppercase">
      <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      Booting_Neural_Interface...
    </div>
  );

  const isFullWidthPage = ["/", "/join"].includes(location.pathname);
  const showNav = !isFullWidthPage && user;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { background: '#0a0a0a', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }
        }} 
      />
      <CustomCursor />

      <div className="flex w-full min-h-screen relative">
        {showNav && (
          <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-40 bg-[#020617]/90 backdrop-blur-xl border-r border-cyan-900/20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
            <Sidebar />
          </aside>
        )}

        {showNav && <MobileNav />}

        <main className={`flex-1 min-h-screen transition-all duration-500 ${showNav ? 'md:pl-64 pb-24' : ''} relative z-10`}>
          <Suspense fallback={
            <div className="h-full w-full min-h-screen flex flex-col items-center justify-center text-cyan-500 animate-pulse font-mono tracking-widest uppercase gap-2">
              <div className="w-8 h-[1px] bg-cyan-500 animate-bounce" />
              Syncing_Neural_Link...
            </div>
          }>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Landing />} />
              <Route path="/join" element={user ? <Navigate to="/feed" replace /> : <JoinPage />} />
              <Route path="/feed" element={<Protected><PremiumHomeFeed /></Protected>} />
              <Route path="/reels" element={<Protected><ReelsFeed /></Protected>} />
              <Route path="/following" element={<Protected><PremiumHomeFeed /></Protected>} />
              <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
              <Route path="/messages" element={<Protected><Messenger /></Protected>} />
              <Route path="/explorer" element={<Protected><Explore /></Protected>} />
              <Route path="/create" element={<Protected><CreatePost /></Protected>} />
              <Route path="/profile/:username" element={<Protected><ProfilePage /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/call/:roomId" element={<Protected><CallPage /></Protected>} />
              <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#06b6d4_0%,_transparent_50%)] z-0" />
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