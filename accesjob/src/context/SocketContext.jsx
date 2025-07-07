// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ user, children }) {
    const [socket, setSocket] = useState(null);
    const listenersRef = useRef([]);

    useEffect(() => {
        if (!user) return;

        const newSocket = io(import.meta.env.VITE_API_URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
            listenersRef.current = [];
        };
    }, [user]);

    const joinRoom = (conversationId) => {
        socket?.emit('joinRoom', { conversationId });
    };

    const sendMessage = (conversationId, message) => {
        socket?.emit('sendMessage', { conversationId, message });
    };

    const onMessage = (callback) => {
        if (!socket || listenersRef.current.includes(callback)) return;

        const wrapped = (message) => callback(message);
        socket.on('receiveMessage', wrapped);
        listenersRef.current.push(callback);
    };

    return (
        <SocketContext.Provider
            value={{
                socket,
                user, // 🔑 ADĂUGAT aici – foarte important pentru NotificationContext
                joinRoom,
                sendMessage,
                onMessage,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
