// services/itemGenerationService.js - Updated with inventory limit check
const cron = require('node-cron');
const User = require('../models/userModel');
const Item = require('../models/itemModel');
const ItemRarity = require('../models/itemRarityModel');
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

        this.itemTemplates = [
            'Sword', 'Shield', 'Potion', 'Ring', 'Amulet', 'Bow', 'Staff', 'Helmet',
            'Armor', 'Boots', 'Gloves', 'Gem', 'Scroll', 'Crystal', 'Orb', 'Rune'
        ];
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

    // Generate random item name with rarity prefix
    generateItemName(rarity) {
        const template = this.itemTemplates[Math.floor(Math.random() * this.itemTemplates.length)];
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

            // Get all rarities
            const rarities = await ItemRarity.findAll();

            if (rarities.length === 0) {
                console.log('No rarities found in database. Skipping item generation.');
                return null;
            }

            // Select random rarity based on weights
            const selectedRarity = this.getRandomRarity(rarities);

            // Generate item name
            const itemName = this.generateItemName(selectedRarity);

            // Create the item
            const item = await Item.create({
                name: itemName,
                rarity_id: selectedRarity.rarity_id,
                metadata_uri: `generated_item_${Date.now()}`
            });

            // Add item to user's inventory
            await Inventory.create({
                user_id: user.id,
                item_id: item.item_id,
                quantity: 1
            });

            console.log(`Generated ${selectedRarity.name} ${itemName} for user ${user.username} (${itemCount + 1}/${this.MAX_INVENTORY_ITEMS})`);

            return {
                item,
                rarity: selectedRarity,
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
        console.log('Starting item generation service...');

        // Run every 1 minute: '* * * * *'
        // For testing, you might want to use '*/10 * * * * *' (every 10 seconds)
        cron.schedule('* * * * *', async () => {
            console.log('Running scheduled item generation...');
            await this.generateItemsForAllUsers();
        });

        console.log('Item generation service started. Items will be generated every minute.');
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
