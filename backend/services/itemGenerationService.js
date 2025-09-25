// services/itemGenerationService.js - Updated with inventory limit check
const cron = require('node-cron');
const User = require('../models/userModel');
const Item = require('../models/itemModel');
const ItemRarity = require('../models/itemRarityModel');
const ItemCategory = require('../models/itemCategoryModel');
const Inventory = require('../models/inventoryModel');

class ItemGenerationService {
    constructor() {
        this.MAX_INVENTORY_ITEMS = 30; // Match the limit in inventoryController
        this.rarityWeights = {
            'common': 60,
            'uncommon': 20,
            'rare': 15,
            'epic': 4,
            'legendary': 1
        };

        this.itemTemplates = {
            'weapon': ['Sword', 'Bow', 'Staff', 'Dagger', 'Axe', 'Spear'],
            'armor': ['Helmet', 'Chestplate', 'Leggings', 'Boots', 'Shield'],
            'accessory': ['Ring', 'Amulet', 'Necklace', 'Bracelet', 'Earring'],
            'consumable': ['Potion', 'Elixir', 'Food', 'Medicine', 'Drink'],
            'material': ['Gem', 'Crystal', 'Ore', 'Wood', 'Fabric'],
            'tool': ['Pickaxe', 'Hammer', 'Chisel', 'Tongs', 'Anvil'],
            'misc': ['Scroll', 'Orb', 'Rune', 'Book', 'Key']
        };
    }

    // Generate weighted random rarity based on probabilities
    getRandomRarity(rarities) {
        const totalWeight = Object.values(this.rarityWeights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (const rarity of rarities) {
            const weight = this.rarityWeights[rarity.name] || 0;
            if (random < weight) {
                return rarity;
            }
            random -= weight;
        }

        // Fallback to common if something goes wrong
        return rarities.find(r => r.name === 'common') || rarities[0];
    }

    // Generate random item name with rarity prefix and category
    generateItemName(rarity, category) {
        const templates = this.itemTemplates[category.name] || this.itemTemplates['misc'];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const rarityPrefixes = {
            'common': ['Basic', 'Simple', 'Plain'],
            'uncommon': ['Enhanced', 'Improved', 'Quality'],
            'rare': ['Superior', 'Refined', 'Masterwork'],
            'epic': ['Legendary', 'Mythical', 'Ancient'],
            'legendary': ['Divine', 'Celestial', 'Transcendent']
        };

        const prefixes = rarityPrefixes[rarity.name] || ['Basic'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        return `${prefix} ${template}`;
    }

    // Generate item description based on rarity and category
    generateItemDescription(rarity, category, itemName) {
        const descriptions = {
            'weapon': `A ${rarity.name} weapon that deals significant damage to enemies.`,
            'armor': `A ${rarity.name} piece of armor that provides excellent protection.`,
            'accessory': `A ${rarity.name} accessory that enhances the wearer's abilities.`,
            'consumable': `A ${rarity.name} consumable item that provides temporary benefits.`,
            'material': `A ${rarity.name} crafting material used to create powerful items.`,
            'tool': `A ${rarity.name} tool that aids in various tasks and crafting.`,
            'misc': `A ${rarity.name} mysterious item with unknown properties.`
        };

        return descriptions[category.name] || `A ${rarity.name} ${itemName}.`;
    }

    // Generate item for a specific user
    async generateItemForUser(user) {
        try {
            // Check if user's inventory is full
            const itemCount = await Inventory.count({ where: { user_id: user.id } });

            if (itemCount >= this.MAX_INVENTORY_ITEMS) {
                console.log(`User ${user.username} inventory is full (${itemCount}/${this.MAX_INVENTORY_ITEMS}). Skipping item generation.`);
                return {
                    skipped: true,
                    reason: 'inventory_full',
                    user: user.username,
                    currentItems: itemCount
                };
            }

            // Get all rarities and categories
            const [rarities, categories] = await Promise.all([
                ItemRarity.findAll(),
                ItemCategory.findAll()
            ]);

            if (rarities.length === 0) {
                console.log('No rarities found in database. Skipping item generation.');
                return null;
            }

            if (categories.length === 0) {
                console.log('No categories found in database. Skipping item generation.');
                return null;
            }

            // Select random rarity based on weights
            const selectedRarity = this.getRandomRarity(rarities);

            // Select random category
            const selectedCategory = categories[Math.floor(Math.random() * categories.length)];

            // Generate item name and description
            const itemName = this.generateItemName(selectedRarity, selectedCategory);
            const itemDescription = this.generateItemDescription(selectedRarity, selectedCategory, itemName);

            // Create the item
            const item = await Item.create({
                name: itemName,
                description: itemDescription,
                category_id: selectedCategory.category_id,
                rarity_id: selectedRarity.rarity_id,
                is_tradeable: true,
                metadata_uri: `generated_item_${Date.now()}`
            });

            // Add item to user's inventory
            await Inventory.create({
                user_id: user.id,
                item_id: item.item_id,
                quantity: 1
            });

            console.log(`Generated ${selectedRarity.name} ${selectedCategory.name} "${itemName}" for user ${user.username} (${itemCount + 1}/${this.MAX_INVENTORY_ITEMS})`);

            return {
                item,
                rarity: selectedRarity,
                category: selectedCategory,
                user: user.username,
                inventoryCount: itemCount + 1
            };

        } catch (error) {
            console.error(`Error generating item for user ${user.username}:`, error.message);
            return null;
        }
    }

    // Generate items for all users
    async generateItemsForAllUsers() {
        try {
            const users = await User.findAll({
                attributes: ['id', 'username']
            });

            if (users.length === 0) {
                console.log('No users found. Skipping item generation.');
                return [];
            }

            console.log(`Starting item generation for ${users.length} users...`);

            const results = [];
            const skippedUsers = [];

            for (const user of users) {
                const result = await this.generateItemForUser(user);
                if (result) {
                    if (result.skipped) {
                        skippedUsers.push(result);
                    } else {
                        results.push(result);
                    }
                }
            }

            console.log(`Item generation complete. Generated ${results.length} items. Skipped ${skippedUsers.length} users (inventory full).`);

            if (skippedUsers.length > 0) {
                console.log(`Users with full inventory: ${skippedUsers.map(u => u.user).join(', ')}`);
            }

            return {
                generated: results,
                skipped: skippedUsers,
                stats: {
                    totalUsers: users.length,
                    itemsGenerated: results.length,
                    usersSkipped: skippedUsers.length
                }
            };

        } catch (error) {
            console.error('Error in item generation process:', error.message);
            return { generated: [], skipped: [], stats: { totalUsers: 0, itemsGenerated: 0, usersSkipped: 0 } };
        }
    }

    // Start the cron job
    startItemGeneration() {
        console.log('🎮 Starting item generation service...');

        // Run every 1 minute: '* * * * *'
        // For testing, you might want to use '*/10 * * * * *' (every 10 seconds)
        cron.schedule('* * * * *', async () => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`\n⏰ [${timestamp}] Running scheduled item generation...`);
            const results = await this.generateItemsForAllUsers();
            
            if (results && results.stats) {
                console.log(`📊 Generation Summary: ${results.stats.itemsGenerated} items created, ${results.stats.usersSkipped} users skipped`);
            }
            console.log('─'.repeat(50));
        });

        console.log('✅ Item generation service started. Items will be generated every minute.');
        console.log('🔍 Watch for generation logs above every minute...\n');
    }

    // Stop the cron job (useful for testing or graceful shutdown)
    stopItemGeneration() {
        cron.destroy();
        console.log('Item generation service stopped.');
    }

    // Manual item generation (useful for testing)
    async generateItemsNow() {
        console.log('Manual item generation triggered...');
        return await this.generateItemsForAllUsers();
    }
}

module.exports = ItemGenerationService;
