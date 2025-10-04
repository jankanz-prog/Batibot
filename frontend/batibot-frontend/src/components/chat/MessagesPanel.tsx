// components/chat/MessagesPanel.tsx - Right panel messages display
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import type { MessagesPanelProps, AttachmentInfo } from '../../types/chat';

interface MessagesPanelPropsExtended extends MessagesPanelProps {
    onAttachmentClick: (attachment: AttachmentInfo) => void;
}

export const MessagesPanel: React.FC<MessagesPanelPropsExtended> = ({
    messages,
    activeChat,
    currentUser,
    onSendMessage,
    onFileUpload,
    typingUsers,
    onStartTyping,
    onStopTyping,
    onAttachmentClick,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Get chat header info
    const getChatHeader = () => {
        if (activeChat === 'global') {
            return {
                title: '🌍 Global Chat',
                subtitle: 'Everyone can see these messages',
            };
        } else {
            // Find the user for this DM
            const targetUser = messages.find(m => 
                (m.sender_id === activeChat || m.receiver_id === activeChat) && 
                m.sender_id !== currentUser.id
            )?.sender || messages.find(m => 
                (m.sender_id === activeChat || m.receiver_id === activeChat) && 
                m.receiver_id !== currentUser.id
            )?.receiver;

            return {
                title: targetUser?.username || `User ${activeChat}`,
                subtitle: 'Private conversation',
            };
        }
    };

    const chatHeader = getChatHeader();

    // Filter messages for current chat
    const filteredMessages = messages.filter(message => {
        if (activeChat === 'global') {
            return message.receiver_id === null; // Global messages
        } else {
            // DM messages between current user and target user
            return (
                (message.sender_id === currentUser.id && message.receiver_id === activeChat) ||
                (message.sender_id === activeChat && message.receiver_id === currentUser.id)
            );
        }
    });

    return (
        <div className="messages-panel">
            {/* Chat Header */}
            <div className="messages-header">
                <div className="chat-info">
                    <h2 className="chat-title">{chatHeader.title}</h2>
                    <p className="chat-subtitle">{chatHeader.subtitle}</p>
                </div>
                <div className="chat-actions">
                    <button 
                        className="scroll-to-bottom-btn"
                        onClick={scrollToBottom}
                        title="Scroll to bottom"
                    >
                        ⬇️
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container" ref={messagesContainerRef}>
                <div className="messages-list">
                    {filteredMessages.length === 0 ? (
                        <div className="no-messages">
                            <div className="no-messages-content">
                                {activeChat === 'global' ? (
                                    <>
                                        <span className="no-messages-icon">🌍</span>
                                        <h3>Welcome to Global Chat!</h3>
                                        <p>Start a conversation with everyone in the community.</p>
                                    </>
                                ) : (
                                    <>
                                        <span className="no-messages-icon">💬</span>
                                        <h3>Start your conversation</h3>
                                        <p>Send a message to begin chatting privately.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {filteredMessages.map((message) => (
                                <MessageBubble
                                    key={message.message_id}
                                    message={message}
                                    isOwn={message.sender_id === currentUser.id}
                                    currentUser={currentUser}
                                    onAttachmentClick={onAttachmentClick}
                                />
                            ))}
                            
                            {/* Typing Indicator */}
                            <TypingIndicator
                                typingUsers={typingUsers}
                                activeChat={activeChat}
                            />
                        </>
                    )}
                    
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="messages-input-container">
                <MessageInput
                    onSendMessage={onSendMessage}
                    onFileUpload={onFileUpload}
                    onStartTyping={onStartTyping}
                    onStopTyping={onStopTyping}
                />
            </div>
        </div>
    );
};
