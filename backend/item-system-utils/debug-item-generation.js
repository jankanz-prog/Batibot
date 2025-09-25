// debug-item-generation.js - Check item generation status
// 
// 🔍 USAGE: node debug-item-generation.js
// 
// This script helps you check if the item generation system is working:
// - Shows database overview (users, items, rarities, categories)
// - Lists recent items generated in the last 5 minutes
// - Shows inventory status for all users
// - Identifies potential issues (missing rarities/categories)
//
const sequelize = require('./config/database');
const User = require('./models/userModel');
const Item = require('./models/itemModel');
const Inventory = require('./models/inventoryModel');
const ItemRarity = require('./models/itemRarityModel');
const ItemCategory = require('./models/itemCategoryModel');

async function checkItemGeneration() {
    try {
        await sequelize.authenticate();
        console.log('🔍 Checking Item Generation Status...\n');

        // Get total counts
        const [userCount, itemCount, inventoryCount, rarityCount, categoryCount] = await Promise.all([
            User.count(),
            Item.count(),
            Inventory.count(),
            ItemRarity.count(),
            ItemCategory.count()
        ]);

        console.log('📊 Database Overview:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Items: ${itemCount}`);
        console.log(`   Inventory Entries: ${inventoryCount}`);
        console.log(`   Rarities: ${rarityCount}`);
        console.log(`   Categories: ${categoryCount}\n`);

        // Check recent items (last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentItems = await Item.findAll({
            where: {
                createdAt: {
                    [sequelize.Sequelize.Op.gte]: fiveMinutesAgo
                }
            },
            include: [
                { model: ItemRarity, as: 'rarity' },
                { model: ItemCategory, as: 'category' }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        console.log('🕐 Recent Items (Last 5 minutes):');
        if (recentItems.length === 0) {
            console.log('   No items generated in the last 5 minutes.');
        } else {
            recentItems.forEach(item => {
                console.log(`   ${item.createdAt.toLocaleTimeString()} - ${item.rarity?.name || 'unknown'} ${item.category?.name || 'unknown'}: "${item.name}"`);
            });
        }
        console.log('');

        // Check inventory distribution
        const inventoryStats = await Inventory.findAll({
            attributes: [
                'user_id',
                [sequelize.fn('COUNT', sequelize.col('item_id')), 'item_count']
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['username']
            }],
            group: ['user_id', 'user.id', 'user.username'],
            order: [[sequelize.literal('item_count'), 'DESC']]
        });

        console.log('🎒 User Inventory Status:');
        if (inventoryStats.length === 0) {
            console.log('   No users have items yet.');
        } else {
            inventoryStats.forEach(stat => {
                const itemCount = parseInt(stat.dataValues.item_count);
                const username = stat.user?.username || 'Unknown';
                const status = itemCount >= 30 ? '(FULL)' : '';
                console.log(`   ${username}: ${itemCount}/30 items ${status}`);
            });
        }
        console.log('');

        // Check if generation should be working
        if (rarityCount === 0) {
            console.log('⚠️  WARNING: No rarities found! Item generation will fail.');
            console.log('   Create rarities first using the Admin panel.\n');
        }

        if (categoryCount === 0) {
            console.log('⚠️  WARNING: No categories found! Item generation will fail.');
            console.log('   Create categories first using the Admin panel.\n');
        }

        if (userCount === 0) {
            console.log('⚠️  WARNING: No users found! Nothing to generate items for.\n');
        }

        console.log('✅ Check complete! Watch the backend console for live generation logs.');

    } catch (error) {
        console.error('❌ Error checking item generation:', error.message);
    } finally {
        process.exit(0);
    }
}

checkItemGeneration();
