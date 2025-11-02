// services/progressAPI.ts
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'progress' | 'activity' | 'item' | 'rarity' | 'social' | 'interaction';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earned: boolean;
    earnedDate: string | null;
}

export interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'trading' | 'collection' | 'engagement' | 'misc';
    tier: number;
    requirementType: string;
    requirementValue: number;
    xpReward: number;
    progress: number;
    completed: boolean;
    completedDate: string | null;
}

export interface Rank {
    id: number;
    name: string;
    symbol: string;
    level: number;
    xpRequired: number;
    tradesRequired: number | null;
    itemsRequired: number | null;
    legendaryItemsRequired: number | null;
}

export interface UserProfile {
    xp: number;
    level: number;
    currentRank: Rank | null;
    consecutiveLoginDays: number;
    totalLoginDays: number;
}

export interface UserProgress {
    profile: UserProfile;
    badges: Badge[];
    achievements: Achievement[];
    ranks: Rank[];
    nextRank: Rank | null;
    rankProgress: number;
}

const progressAPI = {
    // Get user progress (badges, achievements, ranks)
    getUserProgress: async (token: string): Promise<UserProgress> => {
        const response = await fetch(`${API_BASE_URL}/progress`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user progress');
        }

        const data = await response.json();
        return data.data;
    },

    // Award badge to user
    awardBadge: async (token: string, userId: number, badgeId: number) => {
        const response = await fetch(`${API_BASE_URL}/badge/award`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, badgeId })
        });

        if (!response.ok) {
            throw new Error('Failed to award badge');
        }

        return await response.json();
    },

    // Update achievement progress
    updateAchievementProgress: async (
        token: string,
        userId: number,
        achievementId: number,
        progress: number
    ) => {
        const response = await fetch(`${API_BASE_URL}/achievement/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, achievementId, progress })
        });

        if (!response.ok) {
            throw new Error('Failed to update achievement progress');
        }

        return await response.json();
    },

    // Add XP to user
    addXP: async (token: string, userId: number, amount: number, reason: string) => {
        const response = await fetch(`${API_BASE_URL}/xp/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, amount, reason })
        });

        if (!response.ok) {
            throw new Error('Failed to add XP');
        }

        return await response.json();
    }
};

export default progressAPI;
