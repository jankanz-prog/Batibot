// services/progressService.js
// Auto-award service for badges and achievements

const { Profile, Badge, Achievement, Rank, UserBadge, UserAchievement, Inventory } = require('../models');
const { Op } = require('sequelize');

class ProgressService {
    /**
     * Award a badge to a user (if not already earned)
     */
    async awardBadge(userId, badgeName) {
        try {
            const badge = await Badge.findOne({ where: { name: badgeName } });
            if (!badge) {
                console.log(`⚠️ Badge "${badgeName}" not found`);
                return null;
            }

            // Check if user already has this badge
            const existingBadge = await UserBadge.findOne({
                where: { user_id: userId, badge_id: badge.badge_id }
            });

            if (existingBadge) {
                console.log(`✓ User ${userId} already has badge: ${badgeName}`);
                return null;
            }

            // Award the badge
            const userBadge = await UserBadge.create({
                user_id: userId,
                badge_id: badge.badge_id,
                earned_date: new Date()
            });

            console.log(`🏅 Awarded badge "${badgeName}" to user ${userId}`);
            return userBadge;
        } catch (error) {
            console.error(`Error awarding badge ${badgeName}:`, error);
            return null;
        }
    }

    /**
     * Update achievement progress and complete if reached
     */
    async updateAchievement(userId, achievementName, progressIncrement = 1) {
        try {
            const achievement = await Achievement.findOne({ where: { name: achievementName } });
            if (!achievement) {
                console.log(`⚠️ Achievement "${achievementName}" not found`);
                return null;
            }

            // Get or create user achievement record
            let [userAchievement] = await UserAchievement.findOrCreate({
                where: { user_id: userId, achievement_id: achievement.achievement_id },
                defaults: { progress: 0, completed: false }
            });

            // Don't update if already completed
            if (userAchievement.completed) {
                console.log(`✓ Achievement "${achievementName}" already completed for user ${userId}`);
                return userAchievement;
            }

            // Update progress
            userAchievement.progress += progressIncrement;

            // Check if completed
            if (userAchievement.progress >= achievement.requirement_value) {
                userAchievement.completed = true;
                userAchievement.completed_date = new Date();

                // Award XP
                await this.addXP(userId, achievement.xp_reward, `Completed achievement: ${achievementName}`);

                console.log(`🏆 Achievement "${achievementName}" completed! Awarded ${achievement.xp_reward} XP to user ${userId}`);
            }

            await userAchievement.save();
            return userAchievement;
        } catch (error) {
            console.error(`Error updating achievement ${achievementName}:`, error);
            return null;
        }
    }

    /**
     * Add XP to user and check for rank up
     */
    async addXP(userId, amount, reason = 'Unknown') {
        try {
            const profile = await Profile.findOne({
                where: { user_id: userId },
                include: [{ model: Rank, as: 'CurrentRank' }]
            });

            if (!profile) {
                console.log(`⚠️ Profile not found for user ${userId}`);
                return null;
            }

            const oldXP = profile.xp || 0;
            profile.xp = oldXP + amount;
            await profile.save();

            console.log(`✨ Added ${amount} XP to user ${userId} (${oldXP} → ${profile.xp}). Reason: ${reason}`);

            // Check for rank up
            await this.checkRankUp(userId);

            return profile;
        } catch (error) {
            console.error(`Error adding XP to user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Check if user should rank up
     */
    async checkRankUp(userId) {
        try {
            const profile = await Profile.findOne({
                where: { user_id: userId },
                include: [{ model: Rank, as: 'CurrentRank' }]
            });

            if (!profile) return;

            const currentLevel = profile.CurrentRank?.level || 0;

            // Find next available rank
            const nextRank = await Rank.findOne({
                where: {
                    xp_required: { [Op.lte]: profile.xp },
                    level: { [Op.gt]: currentLevel }
                },
                order: [['level', 'ASC']]
            });

            if (nextRank) {
                profile.current_rank_id = nextRank.rank_id;
                await profile.save();
                console.log(`🎖️ User ${userId} ranked up to: ${nextRank.name}!`);
                return nextRank;
            }

            return null;
        } catch (error) {
            console.error(`Error checking rank up for user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Auto-award on user registration
     */
    async onUserRegister(userId) {
        console.log(`🎯 Auto-awarding registration achievements for user ${userId}...`);
        
        // Award "First Steps" badge
        await this.awardBadge(userId, 'First Steps');
        
        // Award "First Mistake" achievement
        await this.updateAchievement(userId, 'First Mistake', 1);
    }

    /**
     * Auto-award on user login
     */
    async onUserLogin(userId) {
        try {
            const profile = await Profile.findOne({ where: { user_id: userId } });
            if (!profile) return;

            const now = new Date();
            const hour = now.getHours();

            // Check for Night Owl (midnight-3 AM)
            if (hour >= 0 && hour < 3) {
                await this.updateAchievement(userId, 'Night Owl', 1);
            }

            // Check for Early Bird (5-7 AM)
            if (hour >= 5 && hour < 7) {
                await this.updateAchievement(userId, 'Early Bird', 1);
            }

            // Update total login days
            profile.total_login_days = (profile.total_login_days || 0) + 1;
            await profile.save();

            // Check Daily Grinder achievements
            const totalDays = profile.total_login_days;
            if (totalDays >= 7) await this.updateAchievement(userId, 'Daily Grinder I', 7);
            if (totalDays >= 30) await this.updateAchievement(userId, 'Daily Grinder II', 30);
            if (totalDays >= 100) await this.updateAchievement(userId, 'Daily Grinder III', 100);

            // Check Veteran badge (30 consecutive days)
            if (profile.consecutive_login_days >= 30) {
                await this.awardBadge(userId, 'Veteran');
            }
        } catch (error) {
            console.error(`Error in onUserLogin for user ${userId}:`, error);
        }
    }

    /**
     * Auto-award on trade completion
     */
    async onTradeComplete(userId) {
        console.log(`🎯 Auto-awarding trade achievements for user ${userId}...`);
        
        // Award "Trader" badge on first trade
        await this.awardBadge(userId, 'Trader');
        
        // Update trading achievements
        await this.updateAchievement(userId, 'Novice Trader', 1);
        await this.updateAchievement(userId, 'Apprentice Trader', 1);
        await this.updateAchievement(userId, 'Master Trader', 1);
        await this.updateAchievement(userId, 'Merchant Lord', 1);
        
        // Check for Entrepreneur badge (10 trades)
        // We'd need to track total trades - for now just increment achievement
        await this.updateAchievement(userId, 'Apprentice Trader', 1);
    }

    /**
     * Auto-award on item collection
     */
    async onItemCollect(userId) {
        try {
            // Count user's items
            const itemCount = await Inventory.count({
                where: { user_id: userId, is_deleted: false }
            });

            console.log(`🎯 Checking item collection for user ${userId} (${itemCount} items)...`);

            // Award Collector badge (10 items)
            if (itemCount >= 10) {
                await this.awardBadge(userId, 'Collector');
            }

            // Update Item Hoarder achievements
            await this.updateAchievement(userId, 'Item Hoarder I', itemCount);
            await this.updateAchievement(userId, 'Item Hoarder II', itemCount);
            await this.updateAchievement(userId, 'Item Hoarder III', itemCount);

            // Check for Treasure Hoarder badge (50 items)
            if (itemCount >= 50) {
                await this.awardBadge(userId, 'Treasure Hoarder');
            }

            // Check Full Vault achievement (30 items - max inventory)
            if (itemCount >= 30) {
                await this.updateAchievement(userId, 'Full Vault', 30);
            }
        } catch (error) {
            console.error(`Error in onItemCollect for user ${userId}:`, error);
        }
    }

    /**
     * Auto-award on rare item drop
     */
    async onRareItemDrop(userId, rarity) {
        console.log(`🎯 Checking rare item achievements for user ${userId} (rarity: ${rarity})...`);
        
        if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
            await this.updateAchievement(userId, 'Rare Hunter I', 1);
            await this.updateAchievement(userId, 'Rare Hunter II', 1);
            await this.updateAchievement(userId, 'Rare Hunter III', 1);
        }

        if (rarity === 'legendary') {
            await this.awardBadge(userId, 'Legendary Finder');
            await this.updateAchievement(userId, 'Lucky Drop', 1);
        }
    }
}

module.exports = new ProgressService();
