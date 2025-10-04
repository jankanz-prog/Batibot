// components/chat/MessageInput.tsx - Message input with file upload
import React, { useState, useRef, useCallback } from 'react';
import { FilePreview } from './FilePreview';
import type { MessageInputProps, FileUploadResponse } from '../../types/chat';

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onFileUpload,
    onStartTyping,
    onStopTyping,
    disabled = false,
}) => {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<FileUploadResponse['data'] | null>(null);
    const [dragActive, setDragActive] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle text change and typing indicators
    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }

        // Typing indicators
        if (value.trim()) {
            onStartTyping();
            
            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            // Stop typing after 1 second of no typing
            typingTimeoutRef.current = setTimeout(() => {
                onStopTyping();
            }, 1000);
        } else {
            onStopTyping();
        }
    };

    // Handle send message
    const handleSend = useCallback(async () => {
        const trimmedMessage = message.trim();
        
        if (!trimmedMessage && !uploadedFile) return;

        try {
            await onSendMessage(trimmedMessage, uploadedFile || undefined);
            
            // Clear input
            setMessage('');
            setSelectedFile(null);
            setUploadedFile(null);
            
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            
            // Stop typing indicator
            onStopTyping();
            
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [message, uploadedFile, onSendMessage, onStopTyping]);

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setIsUploading(true);

        try {
            const uploadResult = await onFileUpload(file);
            setUploadedFile(uploadResult);
            console.log('File uploaded successfully:', uploadResult);
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload file. Please try again.');
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        
        // Clear input so same file can be selected again
        e.target.value = '';
    };

    // Handle drag and drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
        }
    }, []);

    // Remove file
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadedFile(null);
    };

    return (
        <div className={`message-input ${dragActive ? 'drag-active' : ''}`}>
            {/* File Preview */}
            {(selectedFile || uploadedFile) && (
                <FilePreview
                    file={selectedFile}
                    uploadedFile={uploadedFile}
                    onRemove={handleRemoveFile}
                />
            )}

            {/* Input Container */}
            <div 
                className="input-container"
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* File Upload Button */}
                <button
                    type="button"
                    className="file-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    title="Attach file"
                >
                    {isUploading ? '⏳' : '📎'}
                </button>

                {/* Text Input */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyPress={handleKeyPress}
                    placeholder={uploadedFile ? 'Add a message (optional)...' : 'Type a message...'}
                    className="message-textarea"
                    disabled={disabled}
                    rows={1}
                />

                {/* Send Button */}
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={disabled || (!message.trim() && !uploadedFile) || isUploading}
                    className="send-btn"
                    title="Send message"
                >
                    🚀
                </button>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.mp3,.wav"
                    className="file-input-hidden"
                />
            </div>

            {/* Drag Overlay */}
            {dragActive && (
                <div className="drag-overlay">
                    <div className="drag-overlay-content">
                        <span className="drag-icon">📎</span>
                        <p>Drop file here to upload</p>
                    </div>
                </div>
            )}
        </div>
    );
};
