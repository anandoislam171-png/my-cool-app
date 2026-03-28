import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

// ১. কনটেক্সট তৈরি
const ModeContext = createContext();

/**
 * ModeProvider Component
 * এটি পুরো অ্যাপে 'minimal', 'neural', বা 'classic' মোড কন্ট্রোল করবে।
 */
export const ModeProvider = ({ children }) => {
  // ২. লোকাল স্টোরেজ থেকে আগের মোড রিকভার করা (না থাকলে 'minimal')
  const [activeMode, setActiveMode] = useState(() => {
    const savedMode = localStorage.getItem('onyx_mode');
    return savedMode || 'minimal';
  });

  // ৩. মোড পরিবর্তন করার ফাংশন (useCallback ব্যবহার করা হয়েছে পারফরম্যান্সের জন্য)
  const toggleMode = useCallback((newMode) => {
    setActiveMode(newMode);
    localStorage.setItem('onyx_mode', newMode);
    
    // ঐচ্ছিক: এখানে নিয়ন সাউন্ড ইফেক্ট বা হ্যাপটিক ফিডব্যাক যোগ করা যেতে পারে
    console.log(`[Onyx-System]: Mode shifted to ${newMode.toUpperCase()}`);
  }, []);

  // ৪. মোড চেঞ্জ হলে বডি ক্লাসে আপডেট করা (CSS থিমিং সহজ করার জন্য)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('mode-minimal', 'mode-neural', 'mode-classic');
    root.classList.add(`mode-${activeMode}`);
  }, [activeMode]);

  // ৫. ভ্যালু মেমোইজেশন (অপ্রয়োজনীয় রি-রেন্ডার রোধ করতে)
  const value = useMemo(() => ({
    activeMode,
    toggleMode,
    isMinimal: activeMode === 'minimal',
    isNeural: activeMode === 'neural'
  }), [activeMode, toggleMode]);

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};

/**
 * Custom Hook: useMode
 * এর মাধ্যমে যেকোনো কম্পোনেন্ট থেকে মোড অ্যাক্সেস করা যাবে।
 */
export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};