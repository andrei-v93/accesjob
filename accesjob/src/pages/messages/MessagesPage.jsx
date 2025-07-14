import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConversationList from '../../components/messages/ConversationList';
import ChatWindow from '../../components/messages/ChatWindow';
import { useNotifications } from '../../context/NotificationContext';
import styles from './MessagesPage.module.scss';

const API_URL = import.meta.env.VITE_API_URL;

function MessagesPage({ user }) {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const location = useLocation();
    const openConversationId = location.state?.openConversationId;
    const { markAsRead } = useNotifications();
    const userId = user?.id || user?._id;

    const fetchConversations = async () => {
        if (!userId) return;

        try {
            const res = await fetch(`${API_URL}/api/messages/conversations/${userId}`);
            const data = await res.json();
            setConversations(data);

            if (openConversationId) {
                const found = data.find(c => c._id === openConversationId);
                if (found) setSelectedConversation(found);
            }
        } catch (err) {
            console.error('Eroare la încărcarea conversațiilor:', err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [userId, location.state]);

    useEffect(() => {
        if (selectedConversation?._id) {
            markAsRead(selectedConversation._id);
        }
    }, [selectedConversation]);

    const handleSelectConversation = async (conv) => {
        try {
            const res = await fetch(`${API_URL}/api/messages/conversations/${userId}`);
            const updated = await res.json();
            setConversations(updated);

            const refreshed = updated.find(c => c._id === conv._id);
            setSelectedConversation(refreshed || conv);
        } catch (err) {
            console.error('❌ Eroare actualizare conversații:', err);
            setSelectedConversation(conv);
        }
    };

    return (
        <div className={`container-fluid ${styles.messagesPage}`} style={{ height: '100vh', overflow: 'hidden' }}>
            <div className="row h-100">
                <div className="col-md-4 border-end h-100">
                    <ConversationList
                        conversations={conversations}
                        currentUser={user}
                        onSelect={handleSelectConversation}
                        selectedId={selectedConversation?._id}
                    />
                </div>
                <div className="col-md-8 d-flex flex-column h-100">
                    {selectedConversation ? (
                        <ChatWindow
                            conversation={selectedConversation}
                            currentUser={user}
                        />
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                            Selectează o conversație pentru a începe.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;
