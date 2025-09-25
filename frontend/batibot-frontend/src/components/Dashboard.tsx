"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

interface UserStats {
    tradesCompleted: number
    tradesFailed: number
    tradesInProgress: number
    totalItemsTraded: number
    totalValueTraded: number
    successRate: number
    rank: string
    rankProgress: number
    level: number
    experience: number
    experienceToNext: number
}

interface Badge {
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
    earnedDate?: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Mock data - replace with actual API calls
const mockUserStats: UserStats = {
    tradesCompleted: 47,
    tradesFailed: 8,
    tradesInProgress: 3,
    totalItemsTraded: 156,
    totalValueTraded: 2847.50,
    successRate: 85.5,
    rank: 'Gold Trader',
    rankProgress: 68,
    level: 12,
    experience: 3420,
    experienceToNext: 1580
}

const mockBadges: Badge[] = [
    {
        id: '1',
        name: 'First Trade',
        description: 'Complete your first successful trade',
        icon: '🎯',
        earned: true,
        earnedDate: '2024-01-10',
        rarity: 'common'
    },
    {
        id: '2',
        name: 'Speed Trader',
        description: 'Complete 10 trades in 24 hours',
        icon: '⚡',
        earned: true,
        earnedDate: '2024-01-15',
        rarity: 'rare'
    },
    {
        id: '3',
        name: 'High Roller',
        description: 'Complete a trade worth over $500',
        icon: '💎',
        earned: true,
        earnedDate: '2024-01-20',
        rarity: 'epic'
    },
    {
        id: '4',
        name: 'Master Trader',
        description: 'Achieve 90% success rate with 50+ trades',
        icon: '👑',
        earned: false,
        rarity: 'legendary'
    },
    {
        id: '5',
        name: 'Collector',
        description: 'Trade items from 5 different games',
        icon: '🎮',
        earned: true,
        earnedDate: '2024-01-18',
        rarity: 'rare'
    },
    {
        id: '6',
        name: 'Negotiator',
        description: 'Successfully negotiate 25 counter-offers',
        icon: '🤝',
        earned: false,
        rarity: 'epic'
    }
]

export const Dashboard: React.FC = () => {
    const { user, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [stats] = useState<UserStats>(mockUserStats) // setStats removed - will be used for API integration
    const [badges] = useState<Badge[]>(mockBadges) // setBadges removed - will be used for API integration
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

    useEffect(() => {
        // TODO: Fetch real user statistics from API
        // fetchUserStats()
        // fetchUserBadges()
    }, [])

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return '#b0c3d9'
            case 'rare': return '#4b69ff'
            case 'epic': return '#8847ff'
            case 'legendary': return '#d2a679'
            default: return '#b0c3d9'
        }
    }

    const getRankColor = (rank: string) => {
        if (rank.includes('Bronze')) return '#cd7f32'
        if (rank.includes('Silver')) return '#c0c0c0'
        if (rank.includes('Gold')) return '#ffd700'
        if (rank.includes('Platinum')) return '#e5e4e2'
        if (rank.includes('Diamond')) return '#b9f2ff'
        return '#667eea'
    }

    const earnedBadges = badges.filter(badge => badge.earned)
    // unearnedBadges removed - not currently used but available for future features

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <h2>Welcome back, {user?.username}!</h2>
                        <p>Ready to make some trades?</p>
                    </div>
                    <div className="level-section">
                        <div className="level-badge">
                            <span className="level-number">{stats.level}</span>
                            <span className="level-text">Level</span>
                        </div>
                        <div className="experience-bar">
                            <div className="exp-info">
                                <span>{stats.experience} XP</span>
                                <span>{stats.experienceToNext} to next level</span>
                            </div>
                            <div className="exp-bar">
                                <div 
                                    className="exp-fill"
                                    style={{ width: `${(stats.experience / (stats.experience + stats.experienceToNext)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Main Content - Left Side */}
                <div className="main-content">
                    {/* Trading Statistics */}
                    <div className="stats-section">
                        <h3>Trading Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card primary">
                                <div className="stat-icon">📈</div>
                                <div className="stat-content">
                                    <h3>{stats.tradesCompleted}</h3>
                                    <p>Trades Completed</p>
                                </div>
                            </div>
                            
                            <div className="stat-card success">
                                <div className="stat-icon">✅</div>
                                <div className="stat-content">
                                    <h3>{stats.successRate}%</h3>
                                    <p>Success Rate</p>
                                </div>
                            </div>
                            
                            <div className="stat-card warning">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-content">
                                    <h3>{stats.tradesInProgress}</h3>
                                    <p>In Progress</p>
                                </div>
                            </div>
                            
                            <div className="stat-card error">
                                <div className="stat-icon">❌</div>
                                <div className="stat-content">
                                    <h3>{stats.tradesFailed}</h3>
                                    <p>Failed Trades</p>
                                </div>
                            </div>
                            
                            <div className="stat-card info">
                                <div className="stat-icon">📦</div>
                                <div className="stat-content">
                                    <h3>{stats.totalItemsTraded}</h3>
                                    <p>Items Traded</p>
                                </div>
                            </div>
                            
                            <div className="stat-card money">
                                <div className="stat-icon">💰</div>
                                <div className="stat-content">
                                    <h3>${stats.totalValueTraded.toLocaleString()}</h3>
                                    <p>Total Value</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions-section">
                        <h3>Quick Actions</h3>
                        <div className="action-grid">
                            <button 
                                className="action-card"
                                onClick={() => navigate('/trade')}
                            >
                                <div className="action-icon">🛒</div>
                                <div className="action-content">
                                    <h4>Browse Trades</h4>
                                    <p>Find items to trade</p>
                                </div>
                            </button>
                            
                            <button 
                                className="action-card"
                                onClick={() => navigate('/trade-offers')}
                            >
                                <div className="action-icon">📋</div>
                                <div className="action-content">
                                    <h4>My Offers</h4>
                                    <p>Manage trade offers</p>
                                </div>
                            </button>
                            
                            <button 
                                className="action-card"
                                onClick={() => navigate('/profile')}
                            >
                                <div className="action-icon">👤</div>
                                <div className="action-content">
                                    <h4>Profile</h4>
                                    <p>Update your profile</p>
                                </div>
                            </button>
                            
                            <button className="action-card">
                                <div className="action-icon">📊</div>
                                <div className="action-content">
                                    <h4>Analytics</h4>
                                    <p>View detailed stats</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Admin Panel */}
                    {isAdmin && (
                        <div className="admin-section">
                            <h3>Admin Panel</h3>
                            <div className="admin-grid">
                                <button className="admin-card">
                                    <div className="admin-icon">👥</div>
                                    <div className="admin-content">
                                        <h4>Manage Users</h4>
                                        <p>User administration</p>
                                    </div>
                                </button>
                                
                                <button className="admin-card">
                                    <div className="admin-icon">⚙️</div>
                                    <div className="admin-content">
                                        <h4>System Settings</h4>
                                        <p>Configure platform</p>
                                    </div>
                                </button>
                                
                                <button className="admin-card">
                                    <div className="admin-icon">📈</div>
                                    <div className="admin-content">
                                        <h4>Reports</h4>
                                        <p>Platform analytics</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Content - Right Side */}
                <div className="sidebar-content">
                    {/* Rank and Progress */}
                    <div className="rank-section">
                        <div className="rank-card">
                            <div className="rank-header">
                                <h3>Current Rank</h3>
                                <div 
                                    className="rank-badge"
                                    style={{ backgroundColor: getRankColor(stats.rank) }}
                                >
                                    {stats.rank}
                                </div>
                            </div>
                            <div className="rank-progress">
                                <div className="progress-info">
                                    <span>Progress to next rank</span>
                                    <span>{stats.rankProgress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ width: `${stats.rankProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div className="badges-section">
                        <div className="badges-header">
                            <h3>Badges & Achievements</h3>
                            <span className="badge-count">{earnedBadges.length}/{badges.length}</span>
                        </div>
                        
                        <div className="badges-grid-sidebar">
                            {badges.map((badge) => (
                                <div 
                                    key={badge.id}
                                    className={`badge-item-sidebar ${badge.earned ? 'earned' : 'locked'}`}
                                    onClick={() => setSelectedBadge(badge)}
                                    style={{ borderColor: getRarityColor(badge.rarity) }}
                                >
                                    <div className="badge-icon-small">{badge.icon}</div>
                                    <div className="badge-info-small">
                                        <h4>{badge.name}</h4>
                                        {badge.earned && badge.earnedDate && (
                                            <p className="earned-date">Earned {badge.earnedDate}</p>
                                        )}
                                    </div>
                                    {!badge.earned && <div className="badge-lock-small">🔒</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
                    <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="badge-modal-header">
                            <div className="badge-modal-icon">{selectedBadge.icon}</div>
                            <h3>{selectedBadge.name}</h3>
                            <button 
                                className="close-modal"
                                onClick={() => setSelectedBadge(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="badge-modal-content">
                            <p>{selectedBadge.description}</p>
                            <div className="badge-rarity" style={{ color: getRarityColor(selectedBadge.rarity) }}>
                                {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)} Badge
                            </div>
                            {selectedBadge.earned ? (
                                <div className="badge-earned">
                                    ✅ Earned on {selectedBadge.earnedDate}
                                </div>
                            ) : (
                                <div className="badge-locked">
                                    🔒 Not yet earned
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
