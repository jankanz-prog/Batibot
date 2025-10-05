// context/ChatContext.tsx - Chat context with WebSocket integration
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type {
    ChatContextType,
    ChatMessage,
    ChatConversation,
    ChatUser,
    FileUploadResponse
} from '../types/chat';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeChat, setActiveChat] = useState<'global' | number | null>('global');
    const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [key: string]: ChatUser }>({});
    
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Initialize WebSocket connection
    useEffect(() => {
        if (!user || !token) {
            return;
        }

        const newSocket = io(API_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
            newSocket.emit('authenticate', token);
        });

        newSocket.on('authenticated', (data) => {
            console.log('✅ Authenticated:', data);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('new_message', (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('user_status', (data: { userId: number; username: string; online: boolean }) => {
            if (data.online) {
                setOnlineUsers(prev => {
                    if (!prev.find(u => u.id === data.userId)) {
                        return [...prev, { id: data.userId, username: data.username, isOnline: true }];
                    }
                    return prev;
                });
            } else {
                setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
            }
        });

        newSocket.on('user_typing', (data: { userId: number; username: string; receiver_id: string | number }) => {
            const key = data.receiver_id === 'global' ? 'global' : `dm_${data.userId}`;
            setTypingUsers(prev => ({
                ...prev,
                [key]: { id: data.userId, username: data.username }
            }));
        });

        newSocket.on('user_stop_typing', (data: { userId: number; receiver_id: string | number }) => {
            const key = data.receiver_id === 'global' ? 'global' : `dm_${data.userId}`;
            setTypingUsers(prev => {
                const newTyping = { ...prev };
                delete newTyping[key];
                return newTyping;
            });
        });

        newSocket.on('heartbeat', () => {
            newSocket.emit('pong');
        });

        newSocket.on('auth_error', (error) => {
            console.error('❌ Auth error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user, token, API_URL]);

    // Load messages for active chat
    const loadMessages = useCallback(async (chatId: 'global' | number, limit = 50) => {
        if (!token) return;

        try {
            const receiverId = chatId === 'global' ? 'global' : chatId;
            const response = await fetch(
                `${API_URL}/api/chat/messages?receiver_id=${receiverId}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMessages(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [token, API_URL]);

    // Load conversations
    const loadConversations = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    }, [token, API_URL]);

    // Send message
    const sendMessage = useCallback((content: string, attachment?: FileUploadResponse['data']) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected');
            return;
        }

        const messageData: any = {
            message: content,
            receiver_id: activeChat === 'global' ? 'global' : activeChat
        };

        if (attachment) {
            messageData.attachment_url = attachment.url;
            messageData.attachment_type = attachment.type;
            messageData.attachment_filename = attachment.filename;
        }

        socket.emit('chat_message', messageData);
    }, [socket, isConnected, activeChat]);

    // Upload file
    const uploadFile = useCallback(async (file: File): Promise<FileUploadResponse['data']> => {
        if (!token) {
            throw new Error('Not authenticated');
        }

        const formData = new FormData();
        formData.append('chatFile', file);

        const response = await fetch(`${API_URL}/api/uploads/chatUploads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        const data = await response.json();
        return data.data;
    }, [token, API_URL]);

    // Start typing indicator
    const startTyping = useCallback(() => {
        if (!socket || !isConnected) return;

        socket.emit('typing', {
            receiver_id: activeChat === 'global' ? 'global' : activeChat
        });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Auto-stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000);
    }, [socket, isConnected, activeChat]);

    // Stop typing indicator
    const stopTyping = useCallback(() => {
        if (!socket || !isConnected) return;

        socket.emit('stop_typing', {
            receiver_id: activeChat === 'global' ? 'global' : activeChat
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [socket, isConnected, activeChat]);

    // Load messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            loadMessages(activeChat);
        }
    }, [activeChat, loadMessages]);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const value: ChatContextType = {
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
        loadMessages,
        loadConversations
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
