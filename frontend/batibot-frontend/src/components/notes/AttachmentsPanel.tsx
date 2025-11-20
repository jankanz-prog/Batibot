import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { X, File, Image, FileText, Video, Music } from "lucide-react"
import type { Attachment } from "../../types/notes"
import "../../styles/attachmentsPanel.css"

interface AttachmentsPanelProps {
    attachments: Attachment[] | null
    onUpload: (files: File[]) => Promise<void>
    onDelete: (index: number) => void
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image size={20} />
    if (type.startsWith("video/")) return <Video size={20} />
    if (type.startsWith("audio/")) return <Music size={20} />
    return <FileText size={20} />
}

export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
    attachments = [],
    onUpload,
    onDelete
}) => {
    const [uploading, setUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return

        setUploading(true)
        try {
            await onUpload(acceptedFiles)
        } catch (error) {
            console.error("Upload error:", error)
            alert(error instanceof Error ? error.message : "Failed to upload files")
        } finally {
            setUploading(false)
        }
    }, [onUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 5,
        maxSize: 10 * 1024 * 1024, // 10MB
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "text/plain": [".txt"],
            "video/*": [".mp4", ".webm"],
            "audio/*": [".mp3", ".wav"]
        }
    })

    const currentAttachments = attachments || []

    return (
        <div className="attachments-panel">
            <label>Attachments</label>
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "active" : ""} ${uploading ? "uploading" : ""}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <p>Uploading...</p>
                ) : isDragActive ? (
                    <p>Drop files here...</p>
                ) : (
                    <p>Drag & drop files here, or click to select (Max 5 files, 10MB each)</p>
                )}
            </div>
            {currentAttachments.length > 0 && (
                <div className="attachments-list">
                    {currentAttachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                            <div className="attachment-icon">
                                {getFileIcon(attachment.type)}
                            </div>
                            <div className="attachment-info">
                                <div className="attachment-name">{attachment.name}</div>
                                <div className="attachment-meta">
                                    {formatFileSize(attachment.size)} • {attachment.type}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="attachment-delete"
                                onClick={() => onDelete(index)}
                                aria-label={`Delete ${attachment.name}`}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

