// src/modules/NeuralEditor.jsx
import React from 'react';

const NeuralEditor = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col p-6">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-white font-black uppercase tracking-[0.5em]">Neural Editor</h2>
        <button onClick={onClose} className="text-white">CLOSE</button>
      </div>
      <textarea 
        className="bg-transparent text-white text-2xl outline-none resize-none h-full" 
        placeholder="Post your thoughts to OnyxDrift..."
      />
    </div>
  );
};

export default NeuralEditor;