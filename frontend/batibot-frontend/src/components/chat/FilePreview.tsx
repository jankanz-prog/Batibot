// components/chat/FilePreview.tsx - Preview selected/uploaded file
import React from 'react';
import type { FilePreviewProps } from '../../types/chat';

export const FilePreview: React.FC<FilePreviewProps> = ({
    file,
    uploadedFile,
    onRemove,
}) => {
    const getFileIcon = (type?: string) => {
        if (!type) return '📎';
        
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getPreviewContent = () => {
        // If file is uploaded, use uploaded file data
        if (uploadedFile) {
            const isImage = uploadedFile.type === 'image';
            
            return (
                <div className="file-preview-content">
                    {isImage ? (
                        <div className="file-preview-image">
                            <img
                                src={`http://localhost:3001${uploadedFile.url}`}
                                alt={uploadedFile.filename}
                                className="preview-image"
                            />
                        </div>
                    ) : (
                        <div className="file-preview-icon">
                            {getFileIcon(uploadedFile.type)}
                        </div>
                    )}
                    
                    <div className="file-preview-info">
                        <div className="filename">{uploadedFile.filename}</div>
                        <div className="file-details">
                            <span className="file-type">{uploadedFile.type.toUpperCase()}</span>
                            <span className="file-size">{formatFileSize(uploadedFile.size)}</span>
                        </div>
                        <div className="upload-status success">
                            ✅ Ready to send
                        </div>
                    </div>
                </div>
            );
        }

        // If file is being uploaded, use file data
        if (file) {
            const isImage = file.type.startsWith('image/');
            
            return (
                <div className="file-preview-content">
                    {isImage ? (
                        <div className="file-preview-image">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="preview-image"
                                onLoad={(e) => {
                                    // Clean up object URL after loading
                                    URL.revokeObjectURL((e.target as HTMLImageElement).src);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="file-preview-icon">
                            {getFileIcon(file.type.split('/')[0])}
                        </div>
                    )}
                    
                    <div className="file-preview-info">
                        <div className="filename">{file.name}</div>
                        <div className="file-details">
                            <span className="file-type">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <div className="upload-status uploading">
                            ⏳ Uploading...
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="file-preview">
            {getPreviewContent()}
            
            <button
                type="button"
                className="file-preview-remove"
                onClick={onRemove}
                title="Remove file"
            >
                ❌
            </button>
        </div>
    );
};
