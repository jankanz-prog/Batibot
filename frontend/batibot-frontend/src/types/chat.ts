// types/chat.ts - Chat system TypeScript types

export interface ChatUser {
    id: number;
    username: string;
    profile_picture?: string;
    isOnline?: boolean;
}

export interface ChatMessage {
    message_id: number;
    sender_id: number;
    receiver_id: number | null; // null for global chat
    content: string | null;
    attachment_url: string | null;
    attachment_type: 'image' | 'pdf' | 'doc' | 'excel' | 'video' | 'audio' | 'other' | null;
    attachment_filename: string | null;
    message_type: 'text' | 'attachment' | 'mixed';
    timestamp: string;
    sender: ChatUser;
    receiver?: ChatUser | null;
}

export interface ChatConversation {
    id: number;
    username: string;
    profile_picture?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    isOnline?: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
    type: 'send_message' | 'typing_start' | 'typing_stop' | 'heartbeat';
    receiver_id?: string | number;
    content?: string;
    attachment_url?: string;
    attachment_type?: string;
    attachment_filename?: string;
}

export interface WebSocketResponse {
    type: 'connection_success' | 'new_message' | 'message_sent' | 'user_typing_start' | 'user_typing_stop' | 'user_status' | 'online_users_list' | 'error' | 'heartbeat_response';
    data?: any;
    message?: string;
    user?: ChatUser;
}

// API Response types
export interface ChatApiResponse<T> {
    success: boolean;
    data: T;
    count?: number;
    message?: string;
}

export interface FileUploadResponse {
    success: boolean;
    data: {
        url: string;
        type: string;
        filename: string;
        size: number;
        mimetype: string;
    };
}

// Chat context types
export interface ChatContextType {
    // State
    messages: ChatMessage[];
    conversations: ChatConversation[];
    activeChat: 'global' | number | null;
    onlineUsers: ChatUser[];
    isConnected: boolean;
    typingUsers: { [key: string]: ChatUser };
    
    // Actions
    sendMessage: (content: string, attachment?: FileUploadResponse['data']) => void;
    setActiveChat: (chatId: 'global' | number) => void;
    uploadFile: (file: File) => Promise<FileUploadResponse['data']>;
    startTyping: () => void;
    stopTyping: () => void;
    loadMessages: (chatId: 'global' | number, limit?: number) => Promise<void>;
    loadConversations: () => Promise<void>;
}

// UI Component Props
export interface ChatPageProps {}

export interface UserListProps {
    conversations: ChatConversation[];
    activeChat: 'global' | number | null;
    onChatSelect: (chatId: 'global' | number) => void;
    onlineUsers: ChatUser[];
}

export interface MessagesPanelProps {
    messages: ChatMessage[];
    activeChat: 'global' | number | null;
    currentUser: ChatUser;
    onSendMessage: (content: string, attachment?: FileUploadResponse['data']) => void;
    onFileUpload: (file: File) => Promise<FileUploadResponse['data']>;
    typingUsers: { [key: string]: ChatUser };
    onStartTyping: () => void;
    onStopTyping: () => void;
}

export interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
    currentUser: ChatUser;
    onAttachmentClick: (attachment: AttachmentInfo) => void;
}

export interface AttachmentInfo {
    url: string;
    type: string;
    filename: string;
    message: ChatMessage;
}

export interface AttachmentModalProps {
    attachment: AttachmentInfo | null;
    isOpen: boolean;
    onClose: () => void;
}

export interface MessageInputProps {
    onSendMessage: (content: string, attachment?: FileUploadResponse['data']) => void;
    onFileUpload: (file: File) => Promise<FileUploadResponse['data']>;
    onStartTyping: () => void;
    onStopTyping: () => void;
    disabled?: boolean;
}

export interface FilePreviewProps {
    file: File | null;
    uploadedFile: FileUploadResponse['data'] | null;
    onRemove: () => void;
}

export interface TypingIndicatorProps {
    typingUsers: { [key: string]: ChatUser };
    activeChat: 'global' | number | null;
}
