// components/chat/UserList.tsx - Left panel user list
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/chatAPI';
import { MessageSquare, Search, Globe } from 'lucide-react';
import type { UserListProps, ChatUser } from '../../types/chat';

export const UserList: React.FC<UserListProps> = ({
    conversations,
    activeChat,
    onChatSelect,
    onlineUsers,
}) => {
    const { user, token } = useAuth();
    const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Load all users for DM
    useEffect(() => {
        const loadAllUsers = async () => {
            if (!token) return;

            try {
                // Get all users from API
                const response = await chatAPI.getAllUsers(token);
                
                if (response.success) {
                    const userSet = new Map<number, ChatUser>();

                    // Add users from API
                    response.data.forEach(apiUser => {
                        userSet.set(apiUser.id, {
                            id: apiUser.id,
                            username: apiUser.username,
                            isOnline: false, // Default to offline
                        });
                    });

                    // Add users from conversations
                    conversations.forEach(conv => {
                        userSet.set(conv.id, {
                            id: conv.id,
                            username: conv.username,
                            isOnline: conv.isOnline || false,
                        });
                    });

                    // Update online status from online users
                    onlineUsers.forEach(onlineUser => {
                        if (userSet.has(onlineUser.id)) {
                            const existingUser = userSet.get(onlineUser.id)!;
                            userSet.set(onlineUser.id, {
                                ...existingUser,
                                isOnline: true,
                            });
                        } else {
                            // Add online user if not in list
                            userSet.set(onlineUser.id, {
                                ...onlineUser,
                                isOnline: true,
                            });
                        }
                    });

                    // Remove current user from list
                    if (user) {
                        userSet.delete(user.id);
                    }

                    setAllUsers(Array.from(userSet.values()).sort((a, b) => a.username.localeCompare(b.username)));
                }
            } catch (error) {
                console.error('Failed to load users:', error);
                // Fallback to using conversations + online users
                const userSet = new Map<number, ChatUser>();

                conversations.forEach(conv => {
                    userSet.set(conv.id, {
                        id: conv.id,
                        username: conv.username,
                        isOnline: conv.isOnline || false,
                    });
                });

                onlineUsers.forEach(onlineUser => {
                    userSet.set(onlineUser.id, {
                        ...onlineUser,
                        isOnline: true,
                    });
                });

                if (user) {
                    userSet.delete(user.id);
                }

                setAllUsers(Array.from(userSet.values()).sort((a, b) => a.username.localeCompare(b.username)));
            }
        };

        loadAllUsers();
    }, [conversations, onlineUsers, token, user]);

    // Filter users based on search term
    const filteredUsers = allUsers.filter(chatUser =>
        chatUser.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getProfilePicture = (username?: string) => {
        return (
            <div className="user-avatar user-avatar-initial">
                {username?.[0]?.toUpperCase() || '?'}
            </div>
        );
    };

    return (
        <div className="user-list">
            <div className="user-list-header">
                <h3><MessageSquare size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />Chats</h3>
                <div className="user-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="user-list-content">
                {/* Global Chat */}
                <div
                    className={`user-item global-chat ${activeChat === 'global' ? 'active' : ''}`}
                    onClick={() => onChatSelect('global')}
                >
                    <div className="user-avatar global-avatar">
                        <Globe size={24} />
                    </div>
                    <div className="user-info">
                        <div className="user-name">Global Chat</div>
                        <div className="user-status">Everyone • {onlineUsers.length} online</div>
                    </div>
                </div>

                {/* Divider */}
                <div className="user-list-divider">
                    <span>Direct Messages</span>
                </div>

                {/* Direct Message Users */}
                <div className="dm-users">
                    {filteredUsers.length === 0 ? (
                        <div className="no-users">
                            {searchTerm ? (
                                <p>No users found matching "{searchTerm}"</p>
                            ) : (
                                <div className="no-users-content">
                                    <p>No conversations yet</p>
                                    <span className="no-users-hint">
                                        Start chatting in Global Chat to see users here!
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredUsers.map((chatUser) => (
                            <div
                                key={chatUser.id}
                                className={`user-item dm-user ${activeChat === chatUser.id ? 'active' : ''}`}
                                onClick={() => onChatSelect(chatUser.id)}
                            >
                                <div className="user-avatar-container">
                                    {getProfilePicture(chatUser.username)}
                                    <div className={`online-indicator ${chatUser.isOnline ? 'online' : 'offline'}`}></div>
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{chatUser.username}</div>
                                    <div className="user-status">
                                        {chatUser.isOnline ? (
                                            <span className="status-online">🟢 Online</span>
                                        ) : (
                                            <span className="status-offline">⚫ Offline</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Online Users Count */}
                <div className="online-count">
                    <span className="online-indicator-small"></span>
                    {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
                </div>
            </div>
        </div>
    );
};
