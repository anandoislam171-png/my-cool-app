import React, { createContext, useState, useContext } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // ডিফল্ট মোড 'minimal' রাখা হয়েছে তোমার ভিশন অনুযায়ী
  const [activeMode, setActiveMode] = useState('minimal'); 

  const toggleMode = (newMode) => {
    setActiveMode(newMode);
    // এখানে তুমি চাইলে Backend API কল করে ইউজারের প্রেফারেন্স ডাটাবেজে সেভ করতে পারো
  };

  return (
    <ModeContext.Provider value={{ activeMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);