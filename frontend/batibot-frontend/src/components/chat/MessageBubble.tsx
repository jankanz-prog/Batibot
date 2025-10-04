// components/chat/MessageBubble.tsx - Individual message bubble
import React from 'react';
import type { MessageBubbleProps } from '../../types/chat';

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwn,
    currentUser,
    onAttachmentClick,
}) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            // Same day - show time only
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 24 * 7) {
            // This week - show day and time
            return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
            // Older - show date and time
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    };

    const getProfilePicture = (profilePicture?: string, username?: string) => {
        if (profilePicture) {
            return (
                <img
                    src={profilePicture}
                    alt={`${username}'s profile`}
                    className="message-avatar"
                />
            );
        }
        
        return (
            <div className="message-avatar message-avatar-initial">
                {username?.[0]?.toUpperCase() || '?'}
            </div>
        );
    };

    const getAttachmentIcon = (type: string) => {
        switch (type) {
            case 'image':
                return '🖼️';
            case 'pdf':
                return '📄';
            case 'doc':
                return '📝';
            case 'excel':
                return '📊';
            case 'video':
                return '🎥';
            case 'audio':
                return '🎵';
            default:
                return '📎';
        }
    };

    const renderAttachment = () => {
        if (!message.attachment_url) return null;

        const attachment = {
            url: message.attachment_url,
            type: message.attachment_type || 'other',
            filename: message.attachment_filename || 'Unknown file',
            message: message,
        };

        const isImage = message.attachment_type === 'image';

        return (
            <div className="message-attachment">
                {isImage ? (
                    <div 
                        className="attachment-image-preview"
                        onClick={() => onAttachmentClick(attachment)}
                    >
                        <img
                            src={`http://localhost:3001${message.attachment_url}`}
                            alt={message.attachment_filename || 'Image'}
                            className="attachment-image"
                            loading="lazy"
                        />
                        <div className="attachment-overlay">
                            <span className="attachment-icon">🔍</span>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="attachment-file"
                        onClick={() => onAttachmentClick(attachment)}
                    >
                        <div className="attachment-file-icon">
                            {getAttachmentIcon(message.attachment_type || 'other')}
                        </div>
                        <div className="attachment-file-info">
                            <div className="attachment-filename">
                                {message.attachment_filename || 'Unknown file'}
                            </div>
                            <div className="attachment-filetype">
                                {message.attachment_type?.toUpperCase() || 'FILE'}
                            </div>
                        </div>
                        <div className="attachment-actions">
                            <span className="attachment-download">⬇️</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
            {!isOwn && (
                <div className="message-avatar-container">
                    {getProfilePicture(message.sender.profile_picture, message.sender.username)}
                </div>
            )}
            
            <div className="message-content">
                {/* Message header for non-own messages */}
                {!isOwn && (
                    <div className="message-header">
                        <span className="message-sender">{message.sender.username}</span>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                )}

                {/* Message body */}
                <div className="message-body">
                    {/* Text content */}
                    {message.content && (
                        <div className="message-text">
                            {message.content}
                        </div>
                    )}

                    {/* Attachment */}
                    {renderAttachment()}
                </div>

                {/* Own message time */}
                {isOwn && (
                    <div className="message-footer">
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
