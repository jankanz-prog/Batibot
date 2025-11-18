"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import progressAPI, { type UserProgress } from "../services/progressAPI"
import { tradeAPI } from "../services/tradeAPI"
import { TrendingUp, CheckCircle, Clock, XCircle, Package, DollarSign, ShoppingCart, FileText, User, BarChart3, Users, Settings } from "lucide-react"
import { AchievementsBadgesSlideshow } from "./AchievementsBadgesSlideshow"

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

export const Dashboard: React.FC = () => {
    const { user, isAdmin, token } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState<UserStats>({
        tradesCompleted: 0,
        tradesFailed: 0,
        tradesInProgress: 0,
        totalItemsTraded: 0,
        totalValueTraded: 0,
        successRate: 0,
        rank: 'Novice',
        rankProgress: 0,
        level: 1,
        experience: 0,
        experienceToNext: 100
    })
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
    const [selectedBadge, setSelectedBadge] = useState<any>(null)
    const [selectedAchievement, setSelectedAchievement] = useState<any>(null)
    const [showRanksModal, setShowRanksModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) return
            
            try {
                setLoading(true)
                
                // Fetch user progress and trade statistics in parallel
                const [progress, tradeStats] = await Promise.all([
                    progressAPI.getUserProgress(token),
                    tradeAPI.getTradeStatistics(token)
                ])
                
                setUserProgress(progress)
                
                // Update stats with real data from both APIs
                setStats({
                    tradesCompleted: tradeStats.data.tradesCompleted,
                    tradesFailed: tradeStats.data.tradesFailed,
                    tradesInProgress: tradeStats.data.tradesInProgress,
                    totalItemsTraded: tradeStats.data.totalItemsTraded,
                    totalValueTraded: tradeStats.data.totalValueTraded,
                    successRate: tradeStats.data.successRate,
                    rank: progress.profile.currentRank?.name || 'Novice',
                    rankProgress: progress.rankProgress,
                    level: progress.profile.level,
                    experience: progress.profile.xp,
                    experienceToNext: progress.nextRank ? progress.nextRank.xpRequired - progress.profile.xp : 0
                })
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchUserData()
    }, [token])

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

    const badges = userProgress?.badges || []
    const earnedBadges = badges.filter(badge => badge.earned)

    if (loading || !userProgress) {
        return (
            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Loading your progress...</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <h2>Welcome back, {user?.username}!</h2>
                        <p>Ready to make some trades?</p>
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
                                <div className="stat-icon"><TrendingUp size={48} /></div>
                                <div className="stat-content">
                                    <h3>{stats.tradesCompleted}</h3>
                                    <p>Trades Completed</p>
                                </div>
                            </div>
                            
                            <div className="stat-card success">
                                <div className="stat-icon"><CheckCircle size={48} /></div>
                                <div className="stat-content">
                                    <h3>{stats.successRate}%</h3>
                                    <p>Success Rate</p>
                                </div>
                            </div>
                            
                            <div className="stat-card warning">
                                <div className="stat-icon"><Clock size={48} /></div>
                                <div className="stat-content">
                                    <h3>{stats.tradesInProgress}</h3>
                                    <p>In Progress</p>
                                </div>
                            </div>
                            
                            <div className="stat-card error">
                                <div className="stat-icon"><XCircle size={48} /></div>
                                <div className="stat-content">
                                    <h3>{stats.tradesFailed}</h3>
                                    <p>Failed Trades</p>
                                </div>
                            </div>
                            
                            <div className="stat-card info">
                                <div className="stat-icon"><Package size={48} /></div>
                                <div className="stat-content">
                                    <h3>{stats.totalItemsTraded}</h3>
                                    <p>Items Traded</p>
                                </div>
                            </div>
                            
                            <div className="stat-card money">
                                <div className="stat-icon"><DollarSign size={48} /></div>
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
                                <div className="action-icon"><ShoppingCart size={56} /></div>
                                <div className="action-content">
                                    <h4>Browse Trades</h4>
                                    <p>Find items to trade</p>
                                </div>
                            </button>
                            
                            <button 
                                className="action-card"
                                onClick={() => navigate('/trade-offers')}
                            >
                                <div className="action-icon"><FileText size={56} /></div>
                                <div className="action-content">
                                    <h4>My Offers</h4>
                                    <p>Manage trade offers</p>
                                </div>
                            </button>
                            
                            <button 
                                className="action-card"
                                onClick={() => navigate('/profile')}
                            >
                                <div className="action-icon"><User size={56} /></div>
                                <div className="action-content">
                                    <h4>Profile</h4>
                                    <p>Update your profile</p>
                                </div>
                            </button>
                            
                            <button className="action-card">
                                <div className="action-icon"><BarChart3 size={56} /></div>
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
                                    <div className="admin-icon"><Users size={48} /></div>
                                    <div className="admin-content">
                                        <h4>Manage Users</h4>
                                        <p>User administration</p>
                                    </div>
                                </button>
                                
                                <button className="admin-card">
                                    <div className="admin-icon"><Settings size={48} /></div>
                                    <div className="admin-content">
                                        <h4>System Settings</h4>
                                        <p>Configure platform</p>
                                    </div>
                                </button>
                                
                                <button className="admin-card">
                                    <div className="admin-icon"><TrendingUp size={48} /></div>
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
                        <div className="rank-card" onClick={() => setShowRanksModal(true)} style={{ cursor: 'pointer' }}>
                            <div className="rank-header">
                                <h3>Current Rank</h3>
                                <div className="rank-display">
                                    {userProgress?.profile.currentRank?.symbol && (
                                        <img 
                                            src={userProgress.profile.currentRank.symbol} 
                                            alt={stats.rank}
                                            className="rank-icon-large"
                                        />
                                    )}
                                    <div 
                                        className="rank-badge"
                                        style={{ backgroundColor: getRankColor(stats.rank) }}
                                    >
                                        {stats.rank}
                                    </div>
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
                            <p className="rank-click-hint">Click to view all ranks</p>
                        </div>
                    </div>

                    {/* Achievements & Badges Slideshow */}
                    <AchievementsBadgesSlideshow
                        achievements={userProgress?.achievements || []}
                        badges={badges}
                        onAchievementClick={setSelectedAchievement}
                        onBadgeClick={setSelectedBadge}
                        getRarityColor={getRarityColor}
                    />
                </div>
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
                    <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="badge-modal-header">
                            <div className="badge-modal-icon">
                                <img src={selectedBadge.icon} alt={selectedBadge.name} />
                            </div>
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
                                    ✅ Earned on {selectedBadge.earnedDate ? new Date(selectedBadge.earnedDate).toLocaleDateString() : 'Unknown'}
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

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <div className="badge-modal-overlay" onClick={() => setSelectedAchievement(null)}>
                    <div className="badge-modal achievement-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="badge-modal-header">
                            <div className="badge-modal-icon">
                                <img src={selectedAchievement.icon} alt={selectedAchievement.name} />
                            </div>
                            <h3>{selectedAchievement.name}</h3>
                            <button 
                                className="close-modal"
                                onClick={() => setSelectedAchievement(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="badge-modal-content">
                            <p>{selectedAchievement.description}</p>
                            <div className="achievement-category">
                                Category: {selectedAchievement.category.charAt(0).toUpperCase() + selectedAchievement.category.slice(1)}
                                {' • Tier '}{selectedAchievement.tier}
                            </div>
                            <div className="achievement-requirement">
                                <strong>Progress:</strong> {selectedAchievement.progress} / {selectedAchievement.requirementValue}
                            </div>
                            <div className="achievement-progress-full">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${(selectedAchievement.progress / selectedAchievement.requirementValue) * 100}%` }}
                                />
                            </div>
                            <div className="achievement-reward">
                                🎁 Reward: <strong>{selectedAchievement.xpReward} XP</strong>
                            </div>
                            {selectedAchievement.completed ? (
                                <div className="badge-earned">
                                    ✅ Completed on {selectedAchievement.completedDate ? new Date(selectedAchievement.completedDate).toLocaleDateString() : 'Unknown'}
                                </div>
                            ) : (
                                <div className="badge-locked">
                                    🔒 Not yet completed
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ranks Modal */}
            {showRanksModal && (
                <div className="badge-modal-overlay" onClick={() => setShowRanksModal(false)}>
                    <div className="badge-modal ranks-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="badge-modal-header">
                            <h3>🏆 All Ranks</h3>
                            <button 
                                className="close-modal"
                                onClick={() => setShowRanksModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="ranks-modal-content">
                            {userProgress?.ranks.map((rank) => {
                                const isCurrentRank = rank.id === userProgress.profile.currentRank?.id;
                                const isUnlocked = userProgress.profile.xp >= rank.xpRequired;
                                
                                return (
                                    <div 
                                        key={rank.id}
                                        className={`rank-item ${isCurrentRank ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                                    >
                                        <div className="rank-item-icon">
                                            <img src={rank.symbol} alt={rank.name} />
                                            {isCurrentRank && <span className="current-badge">Current</span>}
                                        </div>
                                        <div className="rank-item-info">
                                            <h4>{rank.name}</h4>
                                            <p className="rank-level">Level {rank.level}</p>
                                            <div className="rank-requirements">
                                                <strong>Requirements:</strong>
                                                <ul>
                                                    <li>XP: {rank.xpRequired} {isUnlocked && '✅'}</li>
                                                    {rank.tradesRequired && rank.tradesRequired > 0 && (
                                                        <li>Trades: {rank.tradesRequired}</li>
                                                    )}
                                                    {rank.itemsRequired && (
                                                        <li>Items: {rank.itemsRequired}</li>
                                                    )}
                                                    {rank.legendaryItemsRequired && (
                                                        <li>Legendary Items: {rank.legendaryItemsRequired}</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                        {!isUnlocked && <div className="rank-lock">🔒</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
