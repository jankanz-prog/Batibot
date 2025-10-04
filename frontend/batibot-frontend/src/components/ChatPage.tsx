// components/ChatPage.tsx - Main chat page component
import React, { useState } from 'react';
import { ChatProvider, useChatContext } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { UserList } from './chat/UserList';
import { MessagesPanel } from './chat/MessagesPanel';
import { AttachmentModal } from './chat/AttachmentModal';
import type { AttachmentInfo } from '../types/chat';
import '../styles/chat.css';

const ChatPageContent: React.FC = () => {
    const { user } = useAuth();
    const {
        messages,
        conversations,
        activeChat,
        onlineUsers,
        isConnected,
        typingUsers,
        sendMessage,
        setActiveChat,
        uploadFile,
        startTyping,
        stopTyping,
    } = useChatContext();

    const [selectedAttachment, setSelectedAttachment] = useState<AttachmentInfo | null>(null);

    const handleAttachmentClick = (attachment: AttachmentInfo) => {
        setSelectedAttachment(attachment);
    };

    const handleCloseAttachmentModal = () => {
        setSelectedAttachment(null);
    };

    if (!user) {
        return (
            <div className="chat-page">
                <div className="chat-error">
                    <h2>Authentication Required</h2>
                    <p>Please log in to access the chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Connection status indicator */}
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <div className="status-indicator">
                    <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                    {isConnected ? 'Connected to chat' : 'Connecting...'}
                </div>
            </div>

            <div className="chat-container">
                {/* Left Panel - User List */}
                <div className="chat-sidebar">
                    <UserList
                        conversations={conversations}
                        activeChat={activeChat}
                        onChatSelect={setActiveChat}
                        onlineUsers={onlineUsers}
                    />
                </div>

                {/* Right Panel - Messages */}
                <div className="chat-main">
                    {activeChat ? (
                        <MessagesPanel
                            messages={messages}
                            activeChat={activeChat}
                            currentUser={user}
                            onSendMessage={sendMessage}
                            onFileUpload={uploadFile}
                            typingUsers={typingUsers}
                            onStartTyping={startTyping}
                            onStopTyping={stopTyping}
                            onAttachmentClick={handleAttachmentClick}
                        />
                    ) : (
                        <div className="chat-welcome">
                            <div className="welcome-content">
                                <h2>💬 Welcome to Chat</h2>
                                <p>Select a conversation from the left panel to start chatting!</p>
                                <div className="welcome-features">
                                    <div className="feature">
                                        <span className="feature-icon">🌍</span>
                                        <span>Global Chat - Talk with everyone</span>
                                    </div>
                                    <div className="feature">
                                        <span className="feature-icon">👤</span>
                                        <span>Direct Messages - Private conversations</span>
                                    </div>
                                    <div className="feature">
                                        <span className="feature-icon">📎</span>
                                        <span>File Sharing - Images, documents, and more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Attachment Modal */}
            <AttachmentModal
                attachment={selectedAttachment}
                isOpen={!!selectedAttachment}
                onClose={handleCloseAttachmentModal}
            />
        </div>
    );
};

export const ChatPage: React.FC = () => {
    return (
        <ChatProvider>
            <ChatPageContent />
        </ChatProvider>
    );
};
