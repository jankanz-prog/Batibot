// context/ChatContext.tsx - Chat context provider
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { chatAPI } from '../services/chatAPI';
import { websocketService } from '../services/websocketService';
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
    
    // State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeChat, setActiveChatState] = useState<'global' | number | null>('global');
    const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<{ [key: string]: ChatUser }>({});
    
    // Refs for managing timeouts and connection state
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const isInitializingRef = useRef(false);

    // Set up chat event listeners (WebSocket is already connected globally)
    useEffect(() => {
        if (user && token && !isInitializingRef.current) {
            console.log('💬 Setting up chat event listeners (WebSocket already connected globally)');
            isInitializingRef.current = true;
            initializeChat();
        }

        return () => {
            console.log('🧹 Removing chat event listeners (keeping WebSocket connected)');
            isInitializingRef.current = false;
            // NOTE: We do NOT disconnect WebSocket here - it stays connected globally
            // Event listeners will be cleaned up when component re-renders
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token]);

    // Initialize chat event listeners (WebSocket already connected by NotificationContext)
    const initializeChat = async () => {
        try {
            console.log('✅ Using existing global WebSocket connection for chat');
            
            // Set up chat-specific event listeners
            websocketService.on('connected', setIsConnected);
            websocketService.on('newMessage', handleNewMessage);
            websocketService.on('messageSent', handleMessageSent);
            websocketService.on('userTypingStart', handleUserTypingStart);
            websocketService.on('userTypingStop', handleUserTypingStop);
            websocketService.on('userStatus', handleUserStatus);
            websocketService.on('onlineUsersList', handleOnlineUsersList);
            websocketService.on('error', handleWebSocketError);
            
            // Mark as connected since WebSocket is already connected
            setIsConnected(true);

            // Load initial data
            await loadConversations();
            
            // Load messages for active chat
            if (activeChat) {
                await loadMessages(activeChat);
            }

        } catch (error) {
            console.error('❌ Failed to initialize chat:', error);
        }
    };

    // Handle new message received
    const handleNewMessage = useCallback((message: ChatMessage) => {
        console.log('📨 New message received:', message);
        setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(m => m.message_id === message.message_id);
            if (exists) return prev;
            
            return [...prev, message].sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        });
    }, []);

    // Handle message sent confirmation
    const handleMessageSent = useCallback((message: ChatMessage) => {
        console.log('✅ Message sent confirmation:', message);
        handleNewMessage(message); // Treat same as new message
    }, [handleNewMessage]);

    // Handle typing indicators
    const handleUserTypingStart = useCallback((data: { user_id: number; username: string; receiver_id: number | null }) => {
        const chatKey = data.receiver_id === null ? 'global' : data.receiver_id.toString();
        setTypingUsers(prev => ({
            ...prev,
            [chatKey]: { id: data.user_id, username: data.username }
        }));
    }, []);

    const handleUserTypingStop = useCallback((data: { user_id: number; username: string; receiver_id: number | null }) => {
        const chatKey = data.receiver_id === null ? 'global' : data.receiver_id.toString();
        setTypingUsers(prev => {
            const newTypingUsers = { ...prev };
            delete newTypingUsers[chatKey];
            return newTypingUsers;
        });
    }, []);

    // Handle user online/offline status
    const handleUserStatus = useCallback((data: { user_id: number; username: string; status: 'online' | 'offline' }) => {
        setOnlineUsers(prev => {
            if (data.status === 'online') {
                // Add user if not exists
                const exists = prev.some(u => u.id === data.user_id);
                if (!exists) {
                    return [...prev, { id: data.user_id, username: data.username, isOnline: true }];
                }
                return prev.map(u => u.id === data.user_id ? { ...u, isOnline: true } : u);
            } else {
                // Mark user as offline or remove
                return prev.map(u => u.id === data.user_id ? { ...u, isOnline: false } : u);
            }
        });
    }, []);

    // Handle initial online users list
    const handleOnlineUsersList = useCallback((users: { id: number; username: string }[]) => {
        console.log('📋 Received initial online users:', users);
        setOnlineUsers(users.map(u => ({ ...u, isOnline: true })));
    }, []);

    // Handle WebSocket errors
    const handleWebSocketError = useCallback((error: any) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
    }, []);

    // Load messages for a specific chat
    const loadMessages = useCallback(async (chatId: 'global' | number, limit: number = 50) => {
        if (!token) return;

        try {
            console.log('📖 Loading messages for chat:', chatId);
            const response = await chatAPI.getMessages(chatId, limit, 0, token);
            
            if (response.success) {
                setMessages(response.data.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                ));
            }
        } catch (error) {
            console.error('❌ Failed to load messages:', error);
        }
    }, [token]);

    // Load conversations
    const loadConversations = useCallback(async () => {
        if (!token) return;

        try {
            console.log('👥 Loading conversations...');
            const response = await chatAPI.getConversations(token);
            
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error('❌ Failed to load conversations:', error);
            // Set empty conversations on error
            setConversations([]);
        }
    }, [token]);

    // Send message
    const sendMessage = useCallback(async (content: string, attachment?: FileUploadResponse['data']) => {
        if (!activeChat || !websocketService.isConnected()) return;

        try {
            // Send via WebSocket
            websocketService.sendChatMessage(
                activeChat,
                content || undefined,
                attachment ? {
                    url: attachment.url,
                    type: attachment.type,
                    filename: attachment.filename
                } : undefined
            );

            // Stop typing indicator
            stopTyping();

        } catch (error) {
            console.error('❌ Failed to send message:', error);
            
            // Fallback to REST API
            try {
                const response = await chatAPI.sendMessage({
                    receiver_id: activeChat,
                    content: content || undefined,
                    attachment_url: attachment?.url,
                    attachment_type: attachment?.type,
                    attachment_filename: attachment?.filename
                }, token);

                if (response.success) {
                    handleNewMessage(response.data);
                }
            } catch (restError) {
                console.error('❌ REST API fallback failed:', restError);
            }
        }
    }, [activeChat, token]);

    // Set active chat
    const setActiveChat = useCallback(async (chatId: 'global' | number) => {
        console.log('💬 Setting active chat to:', chatId);
        setActiveChatState(chatId);
        
        // Load messages for the new chat
        await loadMessages(chatId);
        
        // Clear typing users for old chat
        setTypingUsers({});
    }, [loadMessages]);

    // Upload file
    const uploadFile = useCallback(async (file: File): Promise<FileUploadResponse['data']> => {
        if (!token) throw new Error('No authentication token');

        console.log('📎 Uploading file:', file.name);
        const response = await chatAPI.uploadFile(file, token);
        
        if (!response.success) {
            throw new Error(response.message || 'Upload failed');
        }

        return response.data;
    }, [token]);

    // Start typing
    const startTyping = useCallback(() => {
        if (!activeChat || !websocketService.isConnected()) return;

        if (!isTypingRef.current) {
            console.log('⌨️ Starting typing indicator');
            websocketService.startTyping(activeChat);
            isTypingRef.current = true;
        }

        // Reset typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000); // Stop typing after 3 seconds of inactivity
    }, [activeChat]);

    // Stop typing
    const stopTyping = useCallback(() => {
        if (!activeChat || !websocketService.isConnected()) return;

        if (isTypingRef.current) {
            console.log('⌨️ Stopping typing indicator');
            websocketService.stopTyping(activeChat);
            isTypingRef.current = false;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [activeChat]);

    const contextValue: ChatContextType = {
        // State
        messages,
        conversations,
        activeChat,
        onlineUsers,
        isConnected,
        typingUsers,
        
        // Actions
        sendMessage,
        setActiveChat,
        uploadFile,
        startTyping,
        stopTyping,
        loadMessages,
        loadConversations,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
