import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // যদি CSS ফাইল থাকে
import { AuthProvider } from './context/AuthContext'
import { ModeProvider } from './context/ModeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ModeProvider>
        <App />
      </ModeProvider>
    </AuthProvider>
  </React.StrictMode>,
)