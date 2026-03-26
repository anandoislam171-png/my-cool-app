import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';

// ১. Vite & WebRTC Polyfills (Vite-এ SimplePeer চালানোর জন্য জরুরি)
if (typeof window !== 'undefined') {
    window.global = window;
    window.process = { env: {} }; 
}

const SocketContext = createContext();

// ২. সকেট কানেকশন (JWT Auth2 এর সাথে মিল রেখে)
// এখানে আমরা localStorage থেকে টোকেনটি নিয়ে সকেটের মাধ্যমে পাঠাচ্ছি
const token = localStorage.getItem('accessToken');
const socket = io('https://my-cool-app-cvm7.onrender.com', {
    transports: ['websocket'],
    secure: true,
    auth: {
        token: token // সার্ভার সাইডে এটি ভেরিফাই করা যাবে
    }
});

const ContextProvider = ({ children }) => {
    const [call, setCall] = useState({ isReceivingCall: false, from: '', name: '', signal: null, pic: '', type: 'video' });
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState(null);
    const [me, setMe] = useState('');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        // সকেট ইভেন্ট লিসেনারস
        socket.on('me', (id) => setMe(id));

        socket.on('incomingCall', ({ from, name, signal, pic, type }) => {
            setCall({ isReceivingCall: true, from, name, signal, pic, type });
        });

        socket.on('callEnded', () => {
            resetCallState();
        });

        // এরর হ্যান্ডলিং (যদি টোকেন ইনভ্যালিড হয়)
        socket.on('connect_error', (err) => {
            console.error("Socket Auth Error:", err.message);
        });

        return () => {
            socket.off('me');
            socket.off('incomingCall');
            socket.off('callEnded');
            socket.off('connect_error');
        };
    }, []);

    // ৩. মিডিয়া এক্সেস (ক্যামেরা/মাইক্রোফোন)
    const getMedia = async (isAudioOnly = false) => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: !isAudioOnly,
                audio: true
            });

            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error("Media Access Error:", err);
            return null;
        }
    };

    // ৪. কল রিসিভ করা (Answer Call)
    const answerCall = async () => {
        setCallAccepted(true);
        const userStream = await getMedia(call.type === 'audio');
        if (!userStream) return;

        const peer = new SimplePeer({ 
            initiator: false, 
            trickle: false, 
            stream: userStream 
        });

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: call.from });
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    // ৫. কল দেওয়া (Call User)
    const callUser = async (id, name, pic, isAudioOnly = false) => {
        const userStream = await getMedia(isAudioOnly);
        if (!userStream) return;

        const peer = new SimplePeer({ 
            initiator: true, 
            trickle: false, 
            stream: userStream 
        });

        peer.on('signal', (data) => {
            socket.emit('callUser', {
                userToCall: id,
                signalData: data,
                from: me,
                name: name,
                pic: pic,
                type: isAudioOnly ? 'audio' : 'video'
            });
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    // ৬. কল শেষ করা
    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        const target = call.from || me;
        socket.emit("endCall", { to: target });
        resetCallState();
    };

    const resetCallState = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        setCall({ isReceivingCall: false, from: '', name: '', signal: null, pic: '', type: 'video' });
        setCallAccepted(false);
        setCallEnded(false);
        setStream(null);
        
        if (myVideo.current) myVideo.current.srcObject = null;
        if (userVideo.current) userVideo.current.srcObject = null;
        
        // কল শেষ হলে ইউজারকে মেসেজ সেকশনে পাঠিয়ে দিবে
        window.location.href = '/messages';
    };

    return (
        <SocketContext.Provider value={{
            call, callAccepted, callEnded, myVideo, userVideo, stream,
            me, answerCall, callUser, leaveCall
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useCall = () => useContext(SocketContext);
export { ContextProvider, SocketContext };