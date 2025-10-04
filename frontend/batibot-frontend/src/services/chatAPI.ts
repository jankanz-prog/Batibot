// services/chatAPI.ts - Chat API service
import { API_CONFIG } from '../config/api';
import type { ChatMessage, ChatConversation, ChatApiResponse, FileUploadResponse } from '../types/chat';

const BASE_URL = API_CONFIG.BASE_URL;

// Helper function for API calls
const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ChatApiResponse<T>> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const chatAPI = {
    // Get messages for a specific chat or all messages
    getMessages: async (
        receiver_id?: 'global' | number,
        limit: number = 50,
        offset: number = 0,
        token: string = ''
    ): Promise<ChatApiResponse<ChatMessage[]>> => {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });
        
        if (receiver_id !== undefined) {
            params.append('receiver_id', receiver_id.toString());
        }

        return apiCall<ChatMessage[]>(`/chat/messages?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Send message (backup to WebSocket)
    sendMessage: async (
        messageData: {
            receiver_id?: 'global' | number;
            content?: string;
            attachment_url?: string;
            attachment_type?: string;
            attachment_filename?: string;
        },
        token: string
    ): Promise<ChatApiResponse<ChatMessage>> => {
        return apiCall<ChatMessage>('/chat/messages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(messageData),
        });
    },

    // Get conversation list
    getConversations: async (token: string): Promise<ChatApiResponse<ChatConversation[]>> => {
        return apiCall<ChatConversation[]>('/chat/conversations', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Delete message
    deleteMessage: async (messageId: number, token: string): Promise<ChatApiResponse<null>> => {
        return apiCall<null>(`/chat/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Upload file attachment
    uploadFile: async (file: File, token: string): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/uploads/chatUploads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed! status: ${response.status}`);
        }

        return response.json();
    },

    // Get all users (for user list)
    getAllUsers: async (token: string): Promise<ChatApiResponse<ChatConversation[]>> => {
        return apiCall<ChatConversation[]>('/chat/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};
