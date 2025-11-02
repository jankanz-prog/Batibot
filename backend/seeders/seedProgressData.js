// seeders/seedProgressData.js
const { Badge, Achievement, Rank } = require('../models');

const badges = [
    // Progress & Activity
    { name: 'First Steps', description: 'Logged in for the first time', icon: '/images/badges/first-steps.png', category: 'progress', rarity: 'common', requirement_type: 'first_login', requirement_value: 1 },
    { name: 'Collector', description: 'Received your first 10 items', icon: '/images/badges/collector.png', category: 'progress', rarity: 'common', requirement_type: 'collect_items', requirement_value: 10 },
    { name: 'Veteran', description: 'Logged in for 30 consecutive days', icon: '/images/badges/veteran.png', category: 'activity', rarity: 'epic', requirement_type: 'consecutive_logins', requirement_value: 30 },
    { name: 'Trader', description: 'Completed your first trade', icon: '/images/badges/trader.png', category: 'progress', rarity: 'common', requirement_type: 'complete_trade', requirement_value: 1 },
    { name: 'Entrepreneur', description: 'Completed 10 successful trades', icon: '/images/badges/entrepreneur.png', category: 'progress', rarity: 'rare', requirement_type: 'complete_trades', requirement_value: 10 },
    { name: 'Craftsman', description: 'Crafted or enhanced 5 items', icon: '/images/badges/craftsman.png', category: 'progress', rarity: 'rare', requirement_type: 'craft_items', requirement_value: 5 },
    
    // Item & Rarity
    { name: 'Common Collector', description: 'Own at least 10 common items', icon: '/images/badges/common-collector.png', category: 'item', rarity: 'common', requirement_type: 'own_common_items', requirement_value: 10 },
    { name: 'Epic Hunter', description: 'Own at least 5 epic items', icon: '/images/badges/epic-hunter.png', category: 'rarity', rarity: 'epic', requirement_type: 'own_epic_items', requirement_value: 5 },
    { name: 'Legendary Finder', description: 'Receive your first legendary item', icon: '/images/badges/legendary-finder.png', category: 'rarity', rarity: 'legendary', requirement_type: 'own_legendary_items', requirement_value: 1 },
    { name: 'Treasure Hoarder', description: 'Have 50+ total items', icon: '/images/badges/treasure-hoarder.png', category: 'item', rarity: 'rare', requirement_type: 'total_items', requirement_value: 50 },
    { name: 'Diversity Badge', description: 'Own at least one item from every category', icon: '/images/badges/diversity-badge.png', category: 'item', rarity: 'epic', requirement_type: 'all_categories', requirement_value: 1 },
    
    // Social / Interaction
    { name: 'Friendly Neighbor', description: 'Chat with 5 users', icon: '/images/badges/friendly-neighbor.png', category: 'social', rarity: 'common', requirement_type: 'chat_users', requirement_value: 5 },
    { name: 'Negotiator', description: 'Declined 5 bad trade offers', icon: '/images/badges/negotiator.png', category: 'interaction', rarity: 'rare', requirement_type: 'decline_trades', requirement_value: 5 },
    { name: 'Active Trader', description: 'Made 10 trade offers in one day', icon: '/images/badges/active-trader.png', category: 'interaction', rarity: 'epic', requirement_type: 'daily_trade_offers', requirement_value: 10 }
];

const achievements = [
    // Trading
    { name: 'Novice Trader', description: 'Complete 1 trade', icon: '/images/achievements/novice-trader.png', category: 'trading', tier: 1, requirement_type: 'complete_trades', requirement_value: 1, xp_reward: 50 },
    { name: 'Apprentice Trader', description: 'Complete 10 trades', icon: '/images/achievements/apprentice-trader.png', category: 'trading', tier: 2, requirement_type: 'complete_trades', requirement_value: 10, xp_reward: 200 },
    { name: 'Master Trader', description: 'Complete 100 trades', icon: '/images/achievements/master-trader.png', category: 'trading', tier: 3, requirement_type: 'complete_trades', requirement_value: 100, xp_reward: 1000 },
    { name: 'Merchant Lord', description: 'Complete 500 trades', icon: '/images/achievements/merchant-lord.png', category: 'trading', tier: 4, requirement_type: 'complete_trades', requirement_value: 500, xp_reward: 5000 },
    
    // Item Collection
    { name: 'Item Hoarder I', description: 'Receive 10 items', icon: '/images/achievements/item-hoarder-i.png', category: 'collection', tier: 1, requirement_type: 'collect_items', requirement_value: 10, xp_reward: 30 },
    { name: 'Item Hoarder II', description: 'Receive 50 items', icon: '/images/achievements/item-hoarder-ii.png', category: 'collection', tier: 2, requirement_type: 'collect_items', requirement_value: 50, xp_reward: 150 },
    { name: 'Item Hoarder III', description: 'Receive 100 items', icon: '/images/achievements/item-hoarder-iii.png', category: 'collection', tier: 3, requirement_type: 'collect_items', requirement_value: 100, xp_reward: 500 },
    { name: 'Rare Hunter I', description: 'Receive 1 rare+ item', icon: '/images/achievements/rare-hunter-i.png', category: 'collection', tier: 1, requirement_type: 'collect_rare_items', requirement_value: 1, xp_reward: 50 },
    { name: 'Rare Hunter II', description: 'Receive 10 rare+ items', icon: '/images/achievements/rare-hunter-ii.png', category: 'collection', tier: 2, requirement_type: 'collect_rare_items', requirement_value: 10, xp_reward: 250 },
    { name: 'Rare Hunter III', description: 'Receive 50 rare+ items', icon: '/images/achievements/rare-hunter-iii.png', category: 'collection', tier: 3, requirement_type: 'collect_rare_items', requirement_value: 50, xp_reward: 1000 },
    { name: 'Full Vault', description: 'Reach max inventory (30/30 items)', icon: '/images/achievements/full-vault.png', category: 'collection', tier: 1, requirement_type: 'max_inventory', requirement_value: 30, xp_reward: 300 },
    
    // Engagement
    { name: 'Daily Grinder I', description: 'Log in 7 days', icon: '/images/achievements/daily-grinder-i.png', category: 'engagement', tier: 1, requirement_type: 'login_days', requirement_value: 7, xp_reward: 100 },
    { name: 'Daily Grinder II', description: 'Log in 30 days', icon: '/images/achievements/daily-grinder-ii.png', category: 'engagement', tier: 2, requirement_type: 'login_days', requirement_value: 30, xp_reward: 400 },
    { name: 'Daily Grinder III', description: 'Log in 100 days', icon: '/images/achievements/daily-grinder-iii.png', category: 'engagement', tier: 3, requirement_type: 'login_days', requirement_value: 100, xp_reward: 1500 },
    { name: 'Night Owl', description: 'Active between midnight–3 AM', icon: '/images/achievements/night-owl.png', category: 'engagement', tier: 1, requirement_type: 'active_night', requirement_value: 1, xp_reward: 50 },
    { name: 'Early Bird', description: 'Active between 5–7 AM', icon: '/images/achievements/early-bird.png', category: 'engagement', tier: 1, requirement_type: 'active_morning', requirement_value: 1, xp_reward: 50 },
    
    // Misc / Fun
    { name: 'Lucky Drop', description: 'Receive a rare item from random generation', icon: '/images/achievements/lucky-drop.png', category: 'misc', tier: 1, requirement_type: 'rare_random_drop', requirement_value: 1, xp_reward: 100 },
    { name: 'Comeback Kid', description: 'Log in after 30 days of inactivity', icon: '/images/achievements/comeback-kid.png', category: 'misc', tier: 1, requirement_type: 'comeback', requirement_value: 30, xp_reward: 200 },
    { name: 'First Mistake', description: 'Created an account on batibot', icon: '/images/default/unknown.png', category: 'misc', tier: 1, requirement_type: 'register_account', requirement_value: 1, xp_reward: 10 }
];

const ranks = [
    { name: 'Novice', symbol: '/images/ranks/novice.png', level: 1, xp_required: 0, trades_required: 0, items_required: null, legendary_items_required: null },
    { name: 'Adventurer', symbol: '/images/ranks/adventurer.png', level: 2, xp_required: 100, trades_required: 5, items_required: null, legendary_items_required: null },
    { name: 'Merchant', symbol: '/images/ranks/merchant.png', level: 3, xp_required: 500, trades_required: 25, items_required: null, legendary_items_required: null },
    { name: 'Collector', symbol: '/images/ranks/collector.png', level: 4, xp_required: 1000, trades_required: null, items_required: 50, legendary_items_required: null },
    { name: 'Expert Trader', symbol: '/images/ranks/expert-trader.png', level: 5, xp_required: 2000, trades_required: 50, items_required: null, legendary_items_required: null },
    { name: 'Elite', symbol: '/images/ranks/elite.png', level: 6, xp_required: 4000, trades_required: null, items_required: null, legendary_items_required: 5 },
    { name: 'Master', symbol: '/images/ranks/master.png', level: 7, xp_required: 10000, trades_required: 100, items_required: null, legendary_items_required: null }
];

const seedProgressData = async () => {
    try {
        console.log('🌱 Seeding Progress Data...');

        // Seed Badges
        console.log('📛 Seeding Badges...');
        for (const badge of badges) {
            await Badge.findOrCreate({
                where: { name: badge.name },
                defaults: badge
            });
        }
        console.log(`✅ Seeded ${badges.length} badges`);

        // Seed Achievements
        console.log('🏆 Seeding Achievements...');
        for (const achievement of achievements) {
            await Achievement.findOrCreate({
                where: { name: achievement.name },
                defaults: achievement
            });
        }
        console.log(`✅ Seeded ${achievements.length} achievements`);

        // Seed Ranks
        console.log('🎖️ Seeding Ranks...');
        for (const rank of ranks) {
            await Rank.findOrCreate({
                where: { name: rank.name },
                defaults: rank
            });
        }
        console.log(`✅ Seeded ${ranks.length} ranks`);

        console.log('✨ Progress data seeding completed!');
    } catch (error) {
        console.error('❌ Error seeding progress data:', error);
        throw error;
    }
};

module.exports = { seedProgressData };
