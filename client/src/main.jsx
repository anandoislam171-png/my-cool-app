import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import './index.css' 
import { AuthProvider } from './context/AuthContext'
import { ModeProvider } from './context/ModeContext'
import { GoogleOAuthProvider } from '@react-oauth/google' // গুগল অথ প্রোভাইডার যোগ করা হলো

// আপনার Google Cloud Console থেকে পাওয়া Client ID এখানে বসান
// যদি এখনো আইডি না থাকে, তবে আপাতত একটি খালি স্ট্রিং রাখতে পারেন
const GOOGLE_CLIENT_ID = "417838664506-q76pv076phqeoejkmdtbn1jvgpbt6kui.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ModeProvider>
          <App />
        </ModeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)