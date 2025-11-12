import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import progressAPI, { type UserProgress } from "../services/progressAPI"

export const AchievementsPage: React.FC = () => {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedAchievement, setSelectedAchievement] = useState<any>(null)

    useEffect(() => {
        const fetchUserProgress = async () => {
            if (!token) return
            
            try {
                setLoading(true)
                const progress = await progressAPI.getUserProgress(token)
                setUserProgress(progress)
            } catch (error) {
                console.error('Failed to fetch user progress:', error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchUserProgress()
    }, [token])

    if (loading || !userProgress) {
        return (
            <div className="achievements-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading achievements...</p>
                </div>
            </div>
        )
    }

    const completedCount = userProgress.achievements.filter(a => a.completed).length
    const totalCount = userProgress.achievements.length

    return (
        <div className="achievements-page">
            {/* Header */}
            <div className="achievements-page-header">
                <button onClick={() => navigate('/profile')} className="back-button">
                    ← Back to Profile
                </button>
                <div className="header-content">
                    <h1>🏆 Achievements</h1>
                    <p className="achievements-subtitle">
                        Track your progress and unlock rewards
                    </p>
                </div>
                <div className="achievements-stats">
                    <div className="stat-badge">
                        <span className="stat-number">{completedCount}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-badge">
                        <span className="stat-number">{totalCount}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-badge">
                        <span className="stat-number">{Math.round((completedCount / totalCount) * 100)}%</span>
                        <span className="stat-label">Progress</span>
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="achievements-grid-full">
                {userProgress.achievements
                    .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
                    .map((achievement) => (
                        <div 
                            key={achievement.id}
                            className={`achievement-card ${achievement.completed ? 'completed' : ''}`}
                            onClick={() => setSelectedAchievement(achievement)}
                        >
                            <div className="achievement-card-icon">
                                {achievement.icon ? (
                                    <img src={achievement.icon} alt={achievement.name} />
                                ) : (
                                    '🏆'
                                )}
                            </div>
                            <div className="achievement-card-content">
                                <h3 className="achievement-card-name">{achievement.name}</h3>
                                <p className="achievement-card-description">{achievement.description}</p>
                                
                                {!achievement.completed && (
                                    <div className="achievement-card-progress">
                                        <div className="progress-bar-small">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${(achievement.progress / achievement.requirementValue) * 100}%` }}
                                            />
                                        </div>
                                        <span className="progress-text">
                                            {achievement.progress}/{achievement.requirementValue}
                                        </span>
                                    </div>
                                )}
                                
                                {achievement.completed && (
                                    <div className="achievement-card-reward">
                                        <span className="xp-badge">+{achievement.xpReward} XP</span>
                                        {achievement.completedDate && (
                                            <span className="completed-date">
                                                Completed {new Date(achievement.completedDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {achievement.completed && (
                                <div className="achievement-checkmark">✓</div>
                            )}
                        </div>
                    ))}
            </div>

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
        </div>
    )
}
