// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [unreadConversations, setUnreadConversations] = useState([]);
    const { onMessage, user } = useSocket(); // ✅ Extragem și user din context

    const userId = user?._id || user?.id;

    const markAsUnread = (conversationId) => {
        setUnreadConversations((prev) =>
            prev.includes(conversationId) ? prev : [...prev, conversationId]
        );
    };

    const markAsRead = (conversationId) => {
        setUnreadConversations((prev) =>
            prev.filter((id) => id !== conversationId)
        );
    };

    const isUnread = (conversationId) => unreadConversations.includes(conversationId);

    const getUnreadCount = () => unreadConversations.length;

    useEffect(() => {
        if (!userId || !onMessage) return;

        const handleMessage = (message) => {
            if (message?.senderId !== userId) {
                markAsUnread(message.conversationId);
            }
        };

        onMessage(handleMessage);
    }, [onMessage, userId]);

    return (
        <NotificationContext.Provider
            value={{
                unreadConversations,
                markAsUnread,
                markAsRead,
                isUnread,
                getUnreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
