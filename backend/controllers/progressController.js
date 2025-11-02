// controllers/progressController.js
const { User, Profile, Badge, Achievement, Rank, UserBadge, UserAchievement } = require('../models');
const { Op } = require('sequelize');

// Get user progress (badges, achievements, ranks)
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user profile with rank
        const profile = await Profile.findOne({
            where: { user_id: userId },
            include: [{ model: Rank, as: 'CurrentRank' }]
        });

        // Get earned badges
        const userBadges = await UserBadge.findAll({
            where: { user_id: userId },
            include: [{ model: Badge, as: 'Badge' }]
        });

        // Get achievements progress
        const userAchievements = await UserAchievement.findAll({
            where: { user_id: userId },
            include: [{ model: Achievement, as: 'Achievement' }]
        });

        // Get all badges (to show locked ones too)
        const allBadges = await Badge.findAll();

        // Get all achievements (to show progress)
        const allAchievements = await Achievement.findAll({
            order: [['category', 'ASC'], ['tier', 'ASC']]
        });

        // Get all ranks
        const allRanks = await Rank.findAll({
            order: [['level', 'ASC']]
        });

        // Map earned badges
        const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
        const badgesData = allBadges.map(badge => ({
            id: badge.badge_id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            rarity: badge.rarity,
            earned: earnedBadgeIds.has(badge.badge_id),
            earnedDate: earnedBadgeIds.has(badge.badge_id) 
                ? userBadges.find(ub => ub.badge_id === badge.badge_id).earned_date 
                : null
        }));

        // Map achievements with progress
        const userAchMap = new Map(userAchievements.map(ua => [ua.achievement_id, ua]));
        const achievementsData = allAchievements.map(achievement => {
            const userProgress = userAchMap.get(achievement.achievement_id);
            return {
                id: achievement.achievement_id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                category: achievement.category,
                tier: achievement.tier,
                requirementType: achievement.requirement_type,
                requirementValue: achievement.requirement_value,
                xpReward: achievement.xp_reward,
                progress: userProgress ? userProgress.progress : 0,
                completed: userProgress ? userProgress.completed : false,
                completedDate: userProgress ? userProgress.completed_date : null
            };
        });

        // Calculate next rank
        const currentRankLevel = profile?.CurrentRank?.level || 0;
        const nextRank = allRanks.find(rank => rank.level > currentRankLevel);
        const rankProgress = nextRank 
            ? Math.min(100, Math.floor((profile.xp / nextRank.xp_required) * 100))
            : 100;

        res.json({
            success: true,
            data: {
                profile: {
                    xp: profile?.xp || 0,
                    level: profile?.level || 1,
                    currentRank: profile?.CurrentRank || null,
                    consecutiveLoginDays: profile?.consecutive_login_days || 0,
                    totalLoginDays: profile?.total_login_days || 0
                },
                badges: badgesData,
                achievements: achievementsData,
                ranks: allRanks.map(rank => ({
                    id: rank.rank_id,
                    name: rank.name,
                    symbol: rank.symbol,
                    level: rank.level,
                    xpRequired: rank.xp_required,
                    tradesRequired: rank.trades_required,
                    itemsRequired: rank.items_required,
                    legendaryItemsRequired: rank.legendary_items_required
                })),
                nextRank,
                rankProgress
            }
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user progress',
            error: error.message
        });
    }
};

// Award badge to user
const awardBadge = async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        // Check if badge exists
        const badge = await Badge.findByPk(badgeId);
        if (!badge) {
            return res.status(404).json({
                success: false,
                message: 'Badge not found'
            });
        }

        // Check if user already has the badge
        const existingBadge = await UserBadge.findOne({
            where: { user_id: userId, badge_id: badgeId }
        });

        if (existingBadge) {
            return res.status(400).json({
                success: false,
                message: 'User already has this badge'
            });
        }

        // Award the badge
        await UserBadge.create({
            user_id: userId,
            badge_id: badgeId
        });

        res.json({
            success: true,
            message: `Badge "${badge.name}" awarded successfully!`,
            badge
        });
    } catch (error) {
        console.error('Error awarding badge:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to award badge',
            error: error.message
        });
    }
};

// Update achievement progress
const updateAchievementProgress = async (req, res) => {
    try {
        const { userId, achievementId, progress } = req.body;

        // Check if achievement exists
        const achievement = await Achievement.findByPk(achievementId);
        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        // Find or create user achievement
        let userAchievement = await UserAchievement.findOne({
            where: { user_id: userId, achievement_id: achievementId }
        });

        const completed = progress >= achievement.requirement_value;

        if (userAchievement) {
            // Update existing progress
            userAchievement.progress = progress;
            if (completed && !userAchievement.completed) {
                userAchievement.completed = true;
                userAchievement.completed_date = new Date();

                // Award XP to user
                const profile = await Profile.findOne({ where: { user_id: userId } });
                if (profile) {
                    profile.xp += achievement.xp_reward;
                    await profile.save();

                    // Check for rank up
                    await checkAndUpdateRank(userId, profile.xp);
                }
            }
            await userAchievement.save();
        } else {
            // Create new progress entry
            userAchievement = await UserAchievement.create({
                user_id: userId,
                achievement_id: achievementId,
                progress,
                completed,
                completed_date: completed ? new Date() : null
            });

            if (completed) {
                // Award XP to user
                const profile = await Profile.findOne({ where: { user_id: userId } });
                if (profile) {
                    profile.xp += achievement.xp_reward;
                    await profile.save();

                    // Check for rank up
                    await checkAndUpdateRank(userId, profile.xp);
                }
            }
        }

        res.json({
            success: true,
            message: completed ? `Achievement "${achievement.name}" completed!` : 'Progress updated',
            userAchievement,
            xpAwarded: completed ? achievement.xp_reward : 0
        });
    } catch (error) {
        console.error('Error updating achievement progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update achievement progress',
            error: error.message
        });
    }
};

// Helper function to check and update rank
const checkAndUpdateRank = async (userId, currentXp) => {
    try {
        const profile = await Profile.findOne({ where: { user_id: userId } });
        const currentRank = await Rank.findByPk(profile.current_rank_id);
        const currentRankLevel = currentRank?.level || 0;

        // Find the highest rank the user qualifies for
        const qualifiedRank = await Rank.findOne({
            where: {
                level: { [Op.gt]: currentRankLevel },
                xp_required: { [Op.lte]: currentXp }
            },
            order: [['level', 'DESC']]
        });

        if (qualifiedRank) {
            profile.current_rank_id = qualifiedRank.rank_id;
            await profile.save();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking rank:', error);
        return false;
    }
};

// Add XP to user
const addXP = async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;

        const profile = await Profile.findOne({ where: { user_id: userId } });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        const oldXP = profile.xp;
        profile.xp += amount;
        await profile.save();

        // Check for rank up
        const rankedUp = await checkAndUpdateRank(userId, profile.xp);

        res.json({
            success: true,
            message: `Added ${amount} XP for: ${reason}`,
            oldXP,
            newXP: profile.xp,
            rankedUp
        });
    } catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add XP',
            error: error.message
        });
    }
};

module.exports = {
    getUserProgress,
    awardBadge,
    updateAchievementProgress,
    addXP
};
