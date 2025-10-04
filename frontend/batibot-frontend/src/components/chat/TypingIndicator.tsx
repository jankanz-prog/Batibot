// components/chat/TypingIndicator.tsx - Shows when users are typing
import React from 'react';
import type { TypingIndicatorProps } from '../../types/chat';

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    typingUsers,
    activeChat,
}) => {
    // Get typing users for current chat
    const currentChatKey = activeChat === 'global' ? 'global' : activeChat?.toString();
    const typingUser = currentChatKey ? typingUsers[currentChatKey] : null;

    if (!typingUser) {
        return null;
    }

    return (
        <div className="typing-indicator">
            <div className="typing-bubble">
                <div className="typing-avatar">
                    {typingUser.username[0].toUpperCase()}
                </div>
                <div className="typing-content">
                    <div className="typing-text">
                        <span className="typing-username">{typingUser.username}</span> is typing
                    </div>
                    <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
