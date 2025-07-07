// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ user, children }) {
    const [socket, setSocket] = useState(null);
    const listenersRef = useRef([]);

    // Inițializare socket
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

    // 🔁 Reînregistrează toți listenerii dacă socket-ul se schimbă
    useEffect(() => {
        if (!socket) return;

        listenersRef.current.forEach((listener) => {
            socket.on('receiveMessage', listener);
        });

        return () => {
            if (socket) socket.off('receiveMessage');
        };
    }, [socket]);

    // 👇 Acum înregistrează callback-ul direct și imediat
    const onMessage = (callback) => {
        if (!callback || typeof callback !== 'function') return;

        // evită dubluri
        if (listenersRef.current.includes(callback)) return;

        listenersRef.current.push(callback);

        // dacă socket există deja, înregistrează direct
        if (socket) {
            socket.on('receiveMessage', callback);
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
