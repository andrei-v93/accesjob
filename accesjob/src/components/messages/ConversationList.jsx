import React from 'react';
import './ConversationList.scss';

function ConversationList({ conversations, selectedId, onSelect, currentUser }) {
    const currentUserId = currentUser?._id || currentUser?.id;

    return (
        <div className="conversation-list-wrapper">
            <h4 className="mb-3">Conversații</h4>
            <ul className="list-group">
                {conversations.length === 0 ? (
                    <li className="list-group-item text-muted">Nu există conversații.</li>
                ) : (
                    conversations.map((conv) => {
                        const isSelected = selectedId === conv._id;
                        const otherUser =
                            currentUserId === conv.recruiterId._id
                                ? conv.employeeId
                                : conv.recruiterId;

                        return (
                            <li
                                key={conv._id}
                                className={`list-group-item d-flex align-items-center gap-3 ${isSelected ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelect(conv)}
                            >
                                <img
                                    src={otherUser.pozaUrl ? `http://localhost:5000${otherUser.pozaUrl}` : '/images/account-placeholder.jpeg'}
                                    alt={otherUser.name}
                                    className="rounded-circle"
                                    width="40"
                                    height="40"
                                />
                                <div>
                                    <strong>{otherUser.name}</strong>
                                    <br />
                                    <small className="text-muted">
                                        {conv.lastMessage?.trim()
                                            ? conv.lastMessage.slice(0, 50)
                                            : '[Mesaj nou]'}
                                    </small>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
}

export default ConversationList;
