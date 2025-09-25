// setup-initial-data.js - Create initial rarities and categories
//
// 🚀 USAGE: node setup-initial-data.js
//
// This script sets up the initial data needed for the item system:
// - Creates 5 rarities: common, uncommon, rare, epic, legendary
// - Creates 7 categories: weapon, armor, accessory, consumable, material, tool, misc
// - Safe to run multiple times (won't create duplicates)
// - Required before item generation can work
//
const sequelize = require('./config/database');
const ItemRarity = require('./models/itemRarityModel');
const ItemCategory = require('./models/itemCategoryModel');

async function setupInitialData() {
    try {
        await sequelize.authenticate();
        console.log('🔗 Connected to database');

        // Create initial rarities
        const rarities = [
            { name: 'common', color: '#9CA3AF', weight: 60 },
            { name: 'uncommon', color: '#10B981', weight: 20 },
            { name: 'rare', color: '#3B82F6', weight: 15 },
            { name: 'epic', color: '#8B5CF6', weight: 4 },
            { name: 'legendary', color: '#F59E0B', weight: 1 }
        ];

        console.log('🎯 Creating rarities...');
        for (const rarity of rarities) {
            const [created, wasCreated] = await ItemRarity.findOrCreate({
                where: { name: rarity.name },
                defaults: rarity
            });
            
            if (wasCreated) {
                console.log(`   ✅ Created rarity: ${rarity.name} (${rarity.color})`);
            } else {
                console.log(`   ⚪ Rarity already exists: ${rarity.name}`);
            }
        }

        // Create initial categories
        const categories = [
            { name: 'weapon', description: 'Weapons for combat and battle' },
            { name: 'armor', description: 'Protective gear and equipment' },
            { name: 'accessory', description: 'Jewelry and enhancement items' },
            { name: 'consumable', description: 'Items that can be consumed for effects' },
            { name: 'material', description: 'Crafting materials and resources' },
            { name: 'tool', description: 'Tools for various tasks and crafting' },
            { name: 'misc', description: 'Miscellaneous and special items' }
        ];

        console.log('📦 Creating categories...');
        for (const category of categories) {
            const [created, wasCreated] = await ItemCategory.findOrCreate({
                where: { name: category.name },
                defaults: category
            });
            
            if (wasCreated) {
                console.log(`   ✅ Created category: ${category.name}`);
            } else {
                console.log(`   ⚪ Category already exists: ${category.name}`);
            }
        }

        // Check final counts
        const [rarityCount, categoryCount] = await Promise.all([
            ItemRarity.count(),
            ItemCategory.count()
        ]);

        console.log('\n📊 Setup Complete:');
        console.log(`   Rarities: ${rarityCount}`);
        console.log(`   Categories: ${categoryCount}`);
        console.log('\n🎮 Item generation is now ready to work!');
        console.log('   Restart your backend server to see generation logs.');

    } catch (error) {
        console.error('❌ Error setting up initial data:', error.message);
    } finally {
        process.exit(0);
    }
}

setupInitialData();
