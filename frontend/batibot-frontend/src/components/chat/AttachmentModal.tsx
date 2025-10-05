// components/chat/AttachmentModal.tsx - Full-size attachment viewer modal
import React, { useEffect } from 'react';
import type { AttachmentModalProps } from '../../types/chat';

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
    attachment,
    isOpen,
    onClose,
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !attachment) {
        return null;
    }

    const getFileIcon = (type: string) => {
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

    const downloadFile = () => {
        // Extract the path components from the attachment URL
        // URL format: /uploads/chatUploads/filename
        const urlParts = attachment.url.split('/');
        const folder = urlParts[2]; // chatUploads
        const filename = urlParts[3]; // actual filename
        
        // Use the download route that forces download
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
        const link = document.createElement('a');
        link.href = `${serverUrl}/download/uploads/${folder}/${filename}`;
        link.download = attachment.filename; // This will be overridden by server response
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
        const fullUrl = `${serverUrl}${attachment.url}`;

        switch (attachment.type) {
            case 'image':
                return (
                    <div className="modal-image-container">
                        <img
                            src={fullUrl}
                            alt={attachment.filename}
                            className="modal-image"
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="modal-pdf-container">
                        <iframe
                            src={`${fullUrl}#toolbar=1`}
                            className="modal-pdf"
                            title={attachment.filename}
                        />
                    </div>
                );

            case 'video':
                return (
                    <div className="modal-video-container">
                        <video
                            src={fullUrl}
                            controls
                            className="modal-video"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );

            case 'audio':
                return (
                    <div className="modal-audio-container">
                        <div className="audio-file-info">
                            <div className="file-icon">{getFileIcon(attachment.type)}</div>
                            <div className="file-details">
                                <h3>{attachment.filename}</h3>
                                <p>Audio File</p>
                            </div>
                        </div>
                        <audio
                            src={fullUrl}
                            controls
                            className="modal-audio"
                        >
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                );

            default:
                // For docs, excel, and other files
                return (
                    <div className="modal-file-container">
                        <div className="file-preview">
                            <div className="file-icon-large">
                                {getFileIcon(attachment.type)}
                            </div>
                            <div className="file-info">
                                <h3>{attachment.filename}</h3>
                                <p className="file-type">{attachment.type.toUpperCase()} File</p>
                                <p className="file-message">
                                    Click download to save this file to your computer.
                                </p>
                            </div>
                        </div>

                        {/* Try to embed if it's a document */}
                        {(attachment.type === 'doc' || attachment.type === 'excel') && (
                            <div className="document-embed">
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`}
                                    className="modal-document"
                                    title={attachment.filename}
                                />
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="attachment-modal-overlay" onClick={onClose}>
            <div className="attachment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        <span className="file-icon">{getFileIcon(attachment.type)}</span>
                        <span className="filename">{attachment.filename}</span>
                    </div>
                    <div className="modal-actions">
                        <button
                            onClick={downloadFile}
                            className="download-btn"
                            title="Download file"
                        >
                            ⬇️ Download
                        </button>
                        <button
                            onClick={onClose}
                            className="close-btn"
                            title="Close modal"
                        >
                            ❌
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="modal-content">
                    {renderContent()}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <div className="message-info">
                        <span>Sent by {attachment.message.sender.username}</span>
                        <span className="message-time">
                            {new Date(attachment.message.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
