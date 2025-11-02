// config/autoSeeder.js - Automatic database seeder
// Runs on server startup only if tables are empty

const ItemRarity = require('../models/itemRarityModel');
const ItemCategory = require('../models/itemCategoryModel');
const { Badge, Achievement, Rank } = require('../models');
const { seedProgressData } = require('../seeders/seedProgressData');

async function autoSeedDatabase() {
    try {
        // Check if tables are empty
        const [rarityCount, categoryCount, badgeCount, achievementCount, rankCount] = await Promise.all([
            ItemRarity.count(),
            ItemCategory.count(),
            Badge.count(),
            Achievement.count(),
            Rank.count()
        ]);

        // If all tables have data, skip seeding
        if (rarityCount > 0 && categoryCount > 0 && badgeCount > 0 && achievementCount > 0 && rankCount > 0) {
            console.log('✅ Database already seeded (Rarities: %d, Categories: %d, Badges: %d, Achievements: %d, Ranks: %d)', 
                rarityCount, categoryCount, badgeCount, achievementCount, rankCount);
            return;
        }

        console.log('🌱 Database tables empty, auto-seeding initial data...');

        // Seed rarities if empty
        if (rarityCount === 0) {
            const rarities = [
                { name: 'common', color: '#9CA3AF', weight: 60 },
                { name: 'uncommon', color: '#10B981', weight: 20 },
                { name: 'rare', color: '#3B82F6', weight: 15 },
                { name: 'epic', color: '#8B5CF6', weight: 4 },
                { name: 'legendary', color: '#F59E0B', weight: 1 }
            ];

            console.log('   🎯 Seeding rarities...');
            await ItemRarity.bulkCreate(rarities);
            console.log('   ✅ Created %d rarities', rarities.length);
        }

        // Seed categories if empty
        if (categoryCount === 0) {
            const categories = [
                { name: 'weapon', description: 'Weapons for combat and battle' },
                { name: 'armor', description: 'Protective gear and equipment' },
                { name: 'accessory', description: 'Jewelry and enhancement items' },
                { name: 'consumable', description: 'Items that can be consumed for effects' },
                { name: 'material', description: 'Crafting materials and resources' },
                { name: 'tool', description: 'Tools for various tasks and crafting' },
                { name: 'misc', description: 'Miscellaneous and special items' }
            ];

            console.log('   📦 Seeding categories...');
            await ItemCategory.bulkCreate(categories);
            console.log('   ✅ Created %d categories', categories.length);
        }

        // Seed progress system if empty
        if (badgeCount === 0 || achievementCount === 0 || rankCount === 0) {
            console.log('   🏅 Seeding progress system (badges, achievements, ranks)...');
            await seedProgressData();
            console.log('   ✅ Progress system seeded');
        }

        // Show final counts
        const [finalRarities, finalCategories, finalBadges, finalAchievements, finalRanks] = await Promise.all([
            ItemRarity.count(),
            ItemCategory.count(),
            Badge.count(),
            Achievement.count(),
            Rank.count()
        ]);

        console.log('🎉 Auto-seeding complete!');
        console.log('   📊 Items: Rarities: %d, Categories: %d', finalRarities, finalCategories);
        console.log('   🎮 Progress: Badges: %d, Achievements: %d, Ranks: %d', finalBadges, finalAchievements, finalRanks);

    } catch (error) {
        console.error('❌ Auto-seeding error:', error.message);
        // Don't throw - allow server to continue starting up
    }
}

module.exports = { autoSeedDatabase };
