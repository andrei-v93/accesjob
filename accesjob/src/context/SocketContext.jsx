// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ user, children }) {
    const [socket, setSocket] = useState(null);
    const listenersRef = useRef([]);

    useEffect(() => {
        if (!user) return;

        // Evită reconectarea multiplă
        if (socket) {
            console.log('❌ Socket deja activ. Îl deconectăm:', socket.id);
            socket.disconnect();
        }

        const newSocket = io(import.meta.env.VITE_API_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Socket conectat:', newSocket.id);
            // Reatașează toți listenerii
            listenersRef.current.forEach((cb) => {
                newSocket.on('receiveMessage', cb);
            });
        });

        return () => {
            console.log('🔌 Cleanup socket:', newSocket.id);
            newSocket.disconnect();
            listenersRef.current = [];
            setSocket(null);
        };
    }, [user]);

    const onMessage = (callback) => {
        if (!callback || typeof callback !== 'function') return;

        const alreadyRegistered = listenersRef.current.includes(callback);
        if (!alreadyRegistered) {
            listenersRef.current.push(callback);
            if (socket) socket.on('receiveMessage', callback);
        }
    };

    const joinRoom = (conversationId) => {
        socket?.emit('joinRoom', { conversationId });
    };

    const sendMessage = (conversationId, message) => {
        socket?.emit('sendMessage', { conversationId, message });
    };

    return (
        <SocketContext.Provider value={{ socket, joinRoom, sendMessage, onMessage }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
