import React, { useState, useEffect } from 'react';
import { Award, Trophy } from 'lucide-react';
import '../styles/slideshow.css';

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: number;
    requirementType: string;
    requirementValue: number;
    xpReward: number;
    progress: number;
    completed: boolean;
    completedDate?: string;
}

interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    earned: boolean;
    earnedDate?: string;
}

interface Props {
    achievements: Achievement[];
    badges: Badge[];
    onAchievementClick: (achievement: Achievement) => void;
    onBadgeClick: (badge: Badge) => void;
    getRarityColor: (rarity: string) => string;
}

export const AchievementsBadgesSlideshow: React.FC<Props> = ({
    achievements,
    badges,
    onAchievementClick,
    onBadgeClick,
    getRarityColor
}) => {
    const [showAchievements, setShowAchievements] = useState(true);

    // Auto-switch every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setShowAchievements(prev => !prev);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const earnedBadges = badges.filter(b => b.earned);
    const completedAchievements = achievements.filter(a => a.completed);

    return (
        <div className="slideshow-container">
            <div className="slideshow-header">
                <div className="slideshow-tabs">
                    <button 
                        className={`tab-btn ${showAchievements ? 'active' : ''}`}
                        onClick={() => setShowAchievements(true)}
                    >
                        <Award size={18} /> Achievements
                    </button>
                    <button 
                        className={`tab-btn ${!showAchievements ? 'active' : ''}`}
                        onClick={() => setShowAchievements(false)}
                    >
                        <Trophy size={18} /> Badges
                    </button>
                </div>
                <span className="count-badge">
                    {showAchievements 
                        ? `${completedAchievements.length}/${achievements.length}`
                        : `${earnedBadges.length}/${badges.length}`
                    }
                </span>
            </div>
            
            <div className="slideshow-content">
                {showAchievements ? (
                    <div className="achievements-scroll">
                        {achievements
                            .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
                            .map((achievement) => (
                            <div 
                                key={achievement.id}
                                className={`achievement-item ${achievement.completed ? 'completed light-up' : 'locked'}`}
                                onClick={() => onAchievementClick(achievement)}
                            >
                                <div className="achievement-icon">
                                    <img src={achievement.icon} alt={achievement.name} />
                                </div>
                                <div className="achievement-info">
                                    <h4>{achievement.name}</h4>
                                    <div className="achievement-progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${(achievement.progress / achievement.requirementValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="badges-scroll">
                        {badges
                            .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0))
                            .map((badge) => (
                            <div 
                                key={badge.id}
                                className={`badge-item-sidebar ${badge.earned ? 'earned light-up' : 'locked'}`}
                                onClick={() => onBadgeClick(badge)}
                                style={{ borderColor: getRarityColor(badge.rarity) }}
                            >
                                <div className="badge-icon-small">
                                    <img src={badge.icon} alt={badge.name} />
                                </div>
                                <div className="badge-info-small">
                                    <h4>{badge.name}</h4>
                                    {badge.earned && badge.earnedDate && (
                                        <p className="earned-date">Earned {new Date(badge.earnedDate).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
