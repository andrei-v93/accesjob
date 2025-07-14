// ✅ NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export function NotificationProvider({ user, children }) {
    const [unreadCounts, setUnreadCounts] = useState({});
    const { onMessage, joinRoom, socket } = useSocket();

    const userId = user?._id || user?.id;

    // Join camerele conversațiilor și setare inițială unreadCounts
    useEffect(() => {
        const fetchConversationsAndJoinRooms = async () => {
            if (!userId || !socket) return;

            try {
                const res = await fetch(`${API_URL}/api/messages/conversations/${userId}`);
                const data = await res.json();

                const initialUnread = {};

                data.forEach((conv) => {
                    if (conv._id) {
                        joinRoom(conv._id);

                        if (conv.lastSenderId && conv.lastSenderId !== userId) {
                            initialUnread[conv._id] = 1;
                        }
                    }
                });

                setUnreadCounts(initialUnread);
            } catch (err) {
                console.error('❌ [Notification] Eroare la fetch conversații:', err);
            }
        };

        fetchConversationsAndJoinRooms();
    }, [userId, socket]);

    // Redare sunet + actualizare contor la mesaj nou
    useEffect(() => {
        if (!userId || !socket) return;

        const playNotificationSound = () => {
            const audio = new Audio('/sounds/message.mp3');
            audio.currentTime = 0;
            audio.play().catch((e) => console.warn('🔇 Eroare redare sunet:', e));
        };

        const handleMessage = (message) => {
            if (
                message?.conversationId &&
                message?.senderId &&
                message.senderId !== userId
            ) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [message.conversationId]: prev[message.conversationId]
                        ? prev[message.conversationId] + 1
                        : 1
                }));

                playNotificationSound();
            }
        };

        socket.off('receiveMessage', handleMessage);
        socket.on('receiveMessage', handleMessage);

        return () => {
            socket.off('receiveMessage', handleMessage);
        };
    }, [userId, socket]);

    const markAsRead = (conversationId) => {
        setUnreadCounts((prev) => {
            const newCounts = { ...prev };
            delete newCounts[conversationId];
            return newCounts;
        });
    };

    const isUnread = (conversationId) => {
        return unreadCounts[conversationId] > 0;
    };

    return (
        <NotificationContext.Provider
            value={{ unreadCounts, markAsRead, isUnread }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
