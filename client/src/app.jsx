import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuth0 } from '@auth0/auth0-react';

// Components
import Sidebar from "./components/Sidebar";
import CustomCursor from "./components/CustomCursor";
import MobileNav from "./components/MobileNav";

// Lazy-loaded Pages
const Messenger = lazy(() => import("./pages/Messenger"));
const PremiumHomeFeed = lazy(() => import("./pages/PremiumHomeFeed"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings")); 
const ReelsFeed = lazy(() => import("./pages/ReelsFeed"));
const Landing = lazy(() => import("./pages/Landing"));
const JoinPage = lazy(() => import("./pages/JoinPage"));
const CallPage = lazy(() => import("./pages/CallPage"));

// Placeholders
const Analytics = () => <div className="p-10 text-cyan-500 font-mono">NEURAL_ANALYTICS_V1</div>;
const Explore = () => <div className="p-10 text-cyan-500 font-mono">EXPLORING_GRID_WAVES...</div>;
const CreatePost = () => <div className="p-10 text-cyan-500 font-mono">INITIALIZING_CONTENT_SYNTHESIZER...</div>;

// Protected Route Wrapper
const Protected = ({ children }) => {
  const { isAuthenticated } = useAuth0();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default function App() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-mono tracking-widest uppercase">
      Booting_Neural_Interface...
    </div>
  );

  const isFullWidthPage = ["/", "/join"].includes(location.pathname);
  const showNav = !isFullWidthPage && isAuthenticated;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Toaster position="top-right" />
      <CustomCursor />

      <div className="flex w-full min-h-screen relative">
        {/* Desktop Sidebar */}
        {showNav && (
          <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-40 bg-[#020617]/90 backdrop-blur-md border-r border-cyan-900/20">
            <Sidebar />
          </aside>
        )}

        {/* Mobile Navigation */}
        {showNav && <MobileNav />}

        {/* Main Content */}
        <main 
          className={`flex-1 min-h-screen transition-all duration-500 ${showNav ? 'md:pl-64 pb-24' : ''} relative z-10`}
        >
          <Suspense fallback={
            <div className="h-full w-full min-h-screen flex items-center justify-center text-cyan-500 animate-pulse font-mono tracking-widest">
              SYNCING_NEURAL_LINK...
            </div>
          }>
            <Routes>
              {/* Public */}
              <Route path="/" element={isAuthenticated ? <Navigate to="/feed" replace /> : <Landing />} />
              <Route path="/join" element={isAuthenticated ? <Navigate to="/feed" replace /> : <JoinPage />} />

              {/* Protected Routes */}
              <Route path="/feed" element={<Protected><PremiumHomeFeed /></Protected>} />
              <Route path="/reels" element={<Protected><ReelsFeed /></Protected>} />
              <Route path="/following" element={<Protected><PremiumHomeFeed /></Protected>} />
              <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
              <Route path="/messages" element={<Protected><Messenger /></Protected>} />
              <Route path="/explorer" element={<Protected><Explore /></Protected>} />
              <Route path="/create" element={<Protected><CreatePost /></Protected>} />

              {/* Profile */}
              <Route path="/profile/:username" element={<Protected><ProfilePage /></Protected>} />

              {/* Settings */}
              <Route path="/settings" element={<Protected><Settings /></Protected>} />

              {/* Call (supports roomId param) */}
              <Route path="/call/:roomId" element={<Protected><CallPage /></Protected>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/"} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}