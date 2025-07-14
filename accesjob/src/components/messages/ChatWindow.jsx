import React, { useEffect, useRef, useState } from 'react';
import styles from './ChatWindow.module.scss';
import { useSocket } from '../../context/SocketContext';

const API_URL = import.meta.env.VITE_API_URL;

function ChatWindow({ conversation, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessageNotice, setShowNewMessageNotice] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState(null);
    const [lightboxType, setLightboxType] = useState(null);
    const dragCounter = useRef(0);

    const { joinRoom, sendMessage, onMessage, socket } = useSocket();
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUserId = currentUser?._id || currentUser?.id;

    const deduplicateMessages = (msgs) => {
        const seen = new Set();
        return msgs.filter((msg) => {
            const key = msg._id || `${msg.senderId}-${msg.createdAt}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const scrollToBottom = () => {
        const el = messageContainerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };

    const isScrolledToBottom = () => {
        const el = messageContainerRef.current;
        if (!el) return false;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 20;
    };

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/message.mp3');
        audio.currentTime = 0;
        audio.play().catch(() => {});
    };

    useEffect(() => {
        if (!conversation?._id) return;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/messages/messages/${conversation._id}`);
                const data = await res.json();
                setMessages(deduplicateMessages(data));
                setTimeout(() => scrollToBottom(), 100);
            } catch (err) {
                console.error('❌ Eroare încărcare mesaje:', err);
            }
        };
        joinRoom(conversation._id);
        fetchMessages();
    }, [conversation?._id]);

    useEffect(() => {
        const handleLiveMessage = (message) => {
            if (message.conversationId !== conversation._id) return;
            setMessages((prev) => deduplicateMessages([...prev, message]));
            if (isScrolledToBottom()) scrollToBottom();
            else {
                setShowNewMessageNotice(true);
                playNotificationSound();
            }
        };
        onMessage(handleLiveMessage);
    }, [conversation?._id, onMessage]);

    useEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const isBottom = isScrolledToBottom();
            setIsAtBottom(isBottom);
            if (isBottom) setShowNewMessageNotice(false);
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleTyping = ({ conversationId, senderId, senderName }) => {
            if (conversationId === conversation._id && senderId !== currentUserId) {
                setTypingUser(senderName || 'Utilizator');
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
            }
        };
        socket.on('typing', handleTyping);
        return () => socket.off('typing', handleTyping);
    }, [socket, conversation?._id, currentUserId]);

    const handleTyping = () => {
        if (!socket || isTyping) return;
        setIsTyping(true);
        const firstName = currentUser?.name?.split(' ')[0] || 'Utilizator';
        socket.emit('typing', {
            conversationId: conversation._id,
            senderId: currentUserId,
            senderName: firstName,
        });
        setTimeout(() => setIsTyping(false), 1500);
    };

    const handleSend = async () => {
        if (!newMessage.trim() && files.length === 0) return;

        for (const f of files) {
            if (f.progress < 100) continue;
            const payload = {
                conversationId: conversation._id,
                senderId: currentUserId,
                text: '',
                fileUrl: f.url,
                fileName: f.name,
            };

            try {
                const res = await fetch(`${API_URL}/api/messages/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const saved = await res.json();
                if (res.ok) {
                    sendMessage(conversation._id, saved);
                    setMessages((prev) => deduplicateMessages([...prev, saved]));
                }
            } catch (err) {
                console.error('❌ Eroare trimitere fișier:', err);
            }
        }

        if (newMessage.trim()) {
            const textPayload = {
                conversationId: conversation._id,
                senderId: currentUserId,
                text: newMessage.trim(),
            };
            try {
                const res = await fetch(`${API_URL}/api/messages/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(textPayload),
                });
                const savedTextMsg = await res.json();
                if (res.ok) {
                    sendMessage(conversation._id, savedTextMsg);
                    setMessages((prev) => deduplicateMessages([...prev, savedTextMsg]));
                }
            } catch (err) {
                console.error('❌ Eroare text:', err);
            }
        }

        setNewMessage('');
        setFiles([]);
        setTimeout(() => scrollToBottom(), 50);
    };

    const uploadFile = (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const newFile = {
            name: file.name,
            type: file.type,
            progress: 0,
            url: null,
        };
        setFiles((prev) => [...prev, newFile]);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/messages/upload`);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.name === file.name ? { ...f, progress: percent } : f
                    )
                );
            }
        };
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.name === file.name
                            ? { ...f, url: data.url, name: data.name, progress: 100 }
                            : f
                    )
                );
            } else {
                console.error('❌ Upload eșuat:', xhr.statusText);
            }
        };
        xhr.send(formData);
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        selected.forEach(uploadFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setDragActive(false);
        const dropped = Array.from(e.dataTransfer.files);
        dropped.forEach(uploadFile);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        setDragActive(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current <= 0) setDragActive(false);
    };
    const handleDragOver = (e) => e.preventDefault();

    const removeFile = (idx) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const openLightbox = (url, type) => {
        setLightboxUrl(url);
        setLightboxType(type);
    };

    const closeLightbox = () => {
        setLightboxUrl(null);
        setLightboxType(null);
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeLightbox();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div
            className={`d-flex flex-column flex-grow-1 p-3 position-relative ${styles.chatWindow}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {dragActive && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '3px dashed #ccc',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                    }}
                >
                    Atașează fișiere aici
                </div>
            )}

            <div className="flex-grow-1 overflow-auto" ref={messageContainerRef}>
                {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUserId;
                    return (
                        <div key={msg._id || `${msg.senderId}-${msg.createdAt}`} className={`mb-2 ${isOwn ? 'text-end' : 'text-start'}`}>
                            <div className="d-inline-block p-2 rounded shadow-sm bg-light">
                                {msg.fileUrl && msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) && (
                                    <img
                                        src={msg.fileUrl}
                                        alt={msg.fileName}
                                        style={{ maxWidth: 200, maxHeight: 200, cursor: 'pointer' }}
                                        onClick={() => openLightbox(msg.fileUrl, 'image')}
                                    />
                                )}
                                {msg.fileUrl && msg.fileUrl.match(/\.(mp4|webm|ogg)$/i) && (
                                    <video
                                        src={msg.fileUrl}
                                        controls
                                        style={{ maxWidth: 300, cursor: 'pointer' }}
                                        onClick={() => openLightbox(msg.fileUrl, 'video')}
                                    />
                                )}
                                {msg.fileUrl && !msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp|mp4|webm|ogg)$/i) && (
                                    <a href={msg.fileUrl} download={msg.fileName}>
                                        📎 {msg.fileName || 'Fișier'}
                                    </a>
                                )}
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                {typingUser && <div className="text-muted mb-2"><em>{typingUser} scrie...</em></div>}
                <div ref={messagesEndRef} />
            </div>

            {!isAtBottom && (
                <button className="btn btn-light border position-fixed end-0 bottom-5 me-3 mb-5" onClick={scrollToBottom}>
                    ⬇ Scroll la final
                </button>
            )}

            {showNewMessageNotice && !isAtBottom && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-3 px-3 py-1 bg-primary text-white rounded-pill shadow">
                    Mesaj nou
                </div>
            )}

            {files.length > 0 && (
                <div className="mb-2 d-flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <div key={i} className="position-relative border rounded p-2 bg-light">
                            {f.type.startsWith('image') ? (
                                <img src={URL.createObjectURL(new Blob([f]))} alt={f.name} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                            ) : f.type.startsWith('video') ? (
                                <video src={URL.createObjectURL(new Blob([f]))} style={{ width: 100 }} />
                            ) : (
                                <div style={{ width: 100 }}>{f.name}</div>
                            )}
                            <div className="progress mt-1" style={{ height: '6px' }}>
                                <div className="progress-bar" style={{ width: `${f.progress}%` }} />
                            </div>
                            <div className="text-center small">{f.progress}%</div>
                            <button className="btn-close position-absolute top-0 end-0" onClick={() => removeFile(i)} />
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-2 d-flex align-items-center gap-2">
                <button
                    className="btn btn-outline-secondary rounded-circle d-flex justify-content-center align-items-center"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Atașează fișiere"
                >
                    📎
                </button>
                <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} onChange={handleFileChange} />
                <input
                    className="form-control flex-grow-1"
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        (newMessage.trim() || files.length > 0) &&
                        handleSend()
                    }
                    placeholder="Scrie un mesaj..."
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={!newMessage.trim() && files.length === 0}>
                    Trimite
                </button>
            </div>

            {lightboxUrl && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer',
                    }}
                    onClick={closeLightbox}
                >
                    {lightboxType === 'image' ? (
                        <img src={lightboxUrl} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%' }} />
                    ) : (
                        <video src={lightboxUrl} controls autoPlay style={{ maxWidth: '90%', maxHeight: '90%' }} />
                    )}
                </div>
            )}
        </div>
    );
}

export default ChatWindow;
