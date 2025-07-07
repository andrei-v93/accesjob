import React, { useEffect, useRef, useState } from 'react';
import styles from './ChatWindow.module.scss';
import { useSocket } from '../../context/SocketContext';

const API_URL = import.meta.env.VITE_API_URL;

function ChatWindow({ conversation, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { joinRoom, sendMessage, onMessage } = useSocket();
    const messagesEndRef = useRef(null);

    const currentUserId = currentUser?._id || currentUser?.id;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversation?._id) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/messages/messages/${conversation._id}`);
                const data = await res.json();
                console.log('📦 Mesaje încărcate din backend:', data); // <- vezi ce vine
                setMessages(data);
            } catch (err) {
                console.error('❌ Eroare la încărcarea mesajelor:', err);
            }
        };

        joinRoom(conversation._id);
        fetchMessages();
    }, [conversation?._id]);

    useEffect(() => {
        const handleLiveMessage = (message) => {
            if (message.conversationId !== conversation._id) return;

            setMessages((prev) =>
                prev.find((m) => m._id === message._id) ? prev : [...prev, message]
            );
        };

        onMessage(handleLiveMessage);
    }, [conversation?._id, onMessage]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const message = {
            conversationId: conversation._id,
            senderId: currentUserId,
            text: newMessage.trim(),
        };

        try {
            const res = await fetch(`${API_URL}/api/messages/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message),
            });

            const savedMessage = await res.json();

            if (res.ok) {
                sendMessage(conversation._id, savedMessage);
                setNewMessage('');

                // Refacem fetch-ul pentru a ne asigura că vedem tot ce e în DB
                const refetch = await fetch(`${API_URL}/api/messages/messages/${conversation._id}`);
                const updated = await refetch.json();
                setMessages(updated);
            } else {
                console.error('❌ Eroare server:', savedMessage.message);
            }
        } catch (err) {
            console.error('❌ Eroare fetch:', err.message);
        }
    };

    return (
        <div className={`d-flex flex-column flex-grow-1 p-3 ${styles.chatWindow}`}>
            <div className="flex-grow-1 overflow-auto">
                {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUserId;
                    return (
                        <div key={msg._id} className={`mb-2 ${isOwn ? 'text-end' : 'text-start'}`}>
                            <div className="d-inline-block p-2 rounded shadow-sm bg-light">
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-3 d-flex">
                <input
                    className="form-control me-2"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Scrie un mesaj..."
                />
                <button className="btn btn-primary" onClick={handleSend}>Trimite</button>
            </div>
        </div>
    );
}

export default ChatWindow;
